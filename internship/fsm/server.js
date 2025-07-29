const express = require('express');
var cors = require("cors");
const app = express();
const { interpret } = require("xstate");
var bodyParser = require("body-parser");
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const PORT = 3000;
app.use(express.json());
const { superAppMachine } = require("./stateMachine.js");
const log = require("./log.js");
const logger = log("server.js");

const db = require('./db');
const { initializeDatabase, testDatabaseConnection } = require('./initDb');

var keys = {};
var httpReq = {};
var r = 0;
const bcrypt = require('bcryptjs');
const saltRounds = 12; // Increased for better security

// Rate limiting for login attempts
const loginAttempts = new Map(); // In production, use Redis
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

// Input validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Rate limiting helper
const checkRateLimit = (email) => {
  const now = Date.now();
  const attempts = loginAttempts.get(email);
  
  if (!attempts) {
    return { allowed: true, remaining: MAX_LOGIN_ATTEMPTS };
  }
  
  // Clean old attempts
  const recentAttempts = attempts.filter(timestamp => now - timestamp < LOCKOUT_TIME);
  loginAttempts.set(email, recentAttempts);
  
  if (recentAttempts.length >= MAX_LOGIN_ATTEMPTS) {
    const oldestAttempt = Math.min(...recentAttempts);
    const timeUntilReset = LOCKOUT_TIME - (now - oldestAttempt);
    return { 
      allowed: false, 
      remaining: 0, 
      resetTime: Math.ceil(timeUntilReset / 1000 / 60) // minutes
    };
  }
  
  return { allowed: true, remaining: MAX_LOGIN_ATTEMPTS - recentAttempts.length };
};

const recordFailedLogin = (email) => {
  const now = Date.now();
  const attempts = loginAttempts.get(email) || [];
  attempts.push(now);
  loginAttempts.set(email, attempts);
};

// Authentication service
const authService = {
  async signup(userData) {
    const { name, email, password, role, sellerProfile } = userData;
    
    // Validation
    if (!name || !email || !password || !role) {
      throw new Error('All fields are required');
    }
    
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }
    
    if (!validatePassword(password)) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    if (!['buyer', 'seller'].includes(role)) {
      throw new Error('Invalid role. Must be buyer or seller');
    }
    
    // Check if user already exists
    const [existingUsers] = await db.query('SELECT id FROM Users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      throw new Error('User with this email already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Insert user
    const [userResult] = await db.query(
      'INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );
    const userId = userResult.insertId;
    
    // If seller, insert seller profile
    if (role === 'seller' && sellerProfile) {
      const { companyName, contactPhone, address, gamesListed } = sellerProfile;
      await db.query(
        'INSERT INTO Sellers (user_id, companyName, contactPhone, address, gamesListed) VALUES (?, ?, ?, ?, ?)',
        [userId, companyName, contactPhone, address, gamesListed || 0]
      );
    }
    
    logger.info(`New user registered: ${email} (${role})`);
    return { id: userId, name, email, role };
  },

  async login(email, password) {
    // Input validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }
    
    // Check rate limiting
    const rateLimit = checkRateLimit(email);
    if (!rateLimit.allowed) {
      logger.warn(`Rate limit exceeded for email: ${email}`);
      throw new Error(`Too many login attempts. Please try again in ${rateLimit.resetTime} minutes`);
    }
    
    // Fetch user by email
    const [rows] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
    if (rows.length === 0) {
      recordFailedLogin(email);
      logger.warn(`Login attempt failed: Email ${email} not found`);
      throw new Error('Invalid email or password');
    }
    
    const user = rows[0];
    
    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      recordFailedLogin(email);
      logger.warn(`Login attempt failed: Invalid password for email ${email}`);
      throw new Error('Invalid email or password');
    }
    
    // Clear failed attempts on successful login
    loginAttempts.delete(email);
    
    // Fetch seller profile if seller
    let sellerProfile = null;
    if (user.role === 'seller') {
      const [sellerRows] = await db.query('SELECT * FROM Sellers WHERE user_id = ?', [user.id]);
      if (sellerRows.length > 0) {
        sellerProfile = sellerRows[0];
      }
    }
    
    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      sellerProfile,
    };
    
    logger.info(`Login successful for user: ${email}`);
    return userInfo;
  }
};

function createService(key) {
  const service = interpret(superAppMachine.withConfig({
    actions: {
      sendCtx: (context, event) => {
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.json(context);
        }
      },
    },
  })).onTransition(async (state, event) => {
    logger.info(`Key: ${key} State: ${JSON.stringify(state.value)} NextEvents: ${state.nextEvents}`);

    // Handle non-auth events in state machine
    if (event.type === 'SIGNUP') {
      // Authentication already handled in main endpoint
      if (event.userInfo) {
        state.context.user = event.userInfo;
      }
    }

    if (event.type === 'LOGIN') {
      // Authentication already handled in main endpoint
      if (event.userInfo) {
        state.context.user = event.userInfo;
      }
    }

    if (event.type === 'EDIT_PROFILE') {
      try {
        const { id, name, email, role, sellerProfile } = event;
        
        // Validate inputs
        if (!name || !email) {
          throw new Error('Name and email are required');
        }
        
        if (!validateEmail(email)) {
          throw new Error('Invalid email format');
        }
        
        // Check if email is already taken by another user
        const [existingUsers] = await db.query('SELECT id FROM Users WHERE email = ? AND id != ?', [email, id]);
        if (existingUsers.length > 0) {
          throw new Error('Email is already taken by another user');
        }
        
        // Update user info
        await db.query(
          'UPDATE Users SET name = ?, email = ? WHERE id = ?',
          [name, email, id]
        );
        
        // Update seller profile if applicable
        if (role === 'seller' && sellerProfile) {
          const { companyName, contactPhone, address } = sellerProfile;
          await db.query(
            'UPDATE Sellers SET companyName = ?, contactPhone = ?, address = ? WHERE user_id = ?',
            [companyName, contactPhone, address, id]
          );
        }
        
        // Fetch updated user info
        const [rows] = await db.query('SELECT * FROM Users WHERE id = ?', [id]);
        const user = rows[0];
        
        // Fetch updated seller profile if seller
        let updatedSellerProfile = null;
        if (user.role === 'seller') {
          const [sellerRows] = await db.query('SELECT * FROM Sellers WHERE user_id = ?', [id]);
          if (sellerRows.length > 0) {
            updatedSellerProfile = sellerRows[0];
          }
        }
        
        // Update context with updated user info
        state.context.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          sellerProfile: updatedSellerProfile,
        };
        
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.json({ success: true, user: state.context.user });
        }
      } catch (error) {
        logger.error('Edit profile error:', error);
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.status(400).json({ error: error.message });
        }
      }
    }

    if (event.type === 'ADD_GAME') {
      try {
        const { userId, title, genre, releaseDate } = event;
        
        // Validate inputs
        if (!title || !genre || !releaseDate) {
          throw new Error('Title, genre, and release date are required');
        }
        
        // Verify user is a seller
        const [userRows] = await db.query('SELECT role FROM Users WHERE id = ?', [userId]);
        if (userRows.length === 0 || userRows[0].role !== 'seller') {
          throw new Error('Only sellers can add games');
        }
        
        // Insert new game for seller
        const [result] = await db.query(
          'INSERT INTO Games (seller_id, title, genre, release_date) VALUES (?, ?, ?, ?)',
          [userId, title, genre, releaseDate]
        );
        
        // Update seller's games count
        await db.query(
          'UPDATE Sellers SET gamesListed = gamesListed + 1 WHERE user_id = ?',
          [userId]
        );
        
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.json({ success: true, gameId: result.insertId });
        }
      } catch (error) {
        logger.error('Add game error:', error);
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.status(400).json({ error: error.message });
        }
      }
    }

    if (event.type === 'UPDATE_GAME') {
      try {
        const { gameId, userId, title, genre, releaseDate } = event;
        
        // Validate inputs
        if (!title || !genre || !releaseDate) {
          throw new Error('Title, genre, and release date are required');
        }
        
        // Verify game belongs to user
        const [gameRows] = await db.query('SELECT seller_id FROM Games WHERE id = ?', [gameId]);
        if (gameRows.length === 0) {
          throw new Error('Game not found');
        }
        if (gameRows[0].seller_id !== userId) {
          throw new Error('You can only update your own games');
        }
        
        // Update game details
        await db.query(
          'UPDATE Games SET title = ?, genre = ?, release_date = ? WHERE id = ?',
          [title, genre, releaseDate, gameId]
        );
        
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.json({ success: true });
        }
      } catch (error) {
        logger.error('Update game error:', error);
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.status(400).json({ error: error.message });
        }
      }
    }

    if (event.type === 'DELETE_GAME') {
      try {
        const { gameId, userId } = event;
        
        // Verify game belongs to user
        const [gameRows] = await db.query('SELECT seller_id FROM Games WHERE id = ?', [gameId]);
        if (gameRows.length === 0) {
          throw new Error('Game not found');
        }
        if (gameRows[0].seller_id !== userId) {
          throw new Error('You can only delete your own games');
        }
        
        // Delete game
        await db.query('DELETE FROM Games WHERE id = ?', [gameId]);
        
        // Update seller's games count
        await db.query(
          'UPDATE Sellers SET gamesListed = GREATEST(gamesListed - 1, 0) WHERE user_id = ?',
          [userId]
        );
        
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.json({ success: true });
        }
      } catch (error) {
        logger.error('Delete game error:', error);
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.status(400).json({ error: error.message });
        }
      }
    }

    if (event.type === 'ADD_TO_CART') {
      try {
        const { userId, gameId, quantity } = event;
        
        // Validate inputs
        if (!gameId || !quantity || quantity <= 0) {
          throw new Error('Valid game ID and quantity are required');
        }
        
        // Verify game exists
        const [gameRows] = await db.query('SELECT id FROM Games WHERE id = ?', [gameId]);
        if (gameRows.length === 0) {
          throw new Error('Game not found');
        }
        
        // Check if item already in cart
        const [rows] = await db.query(
          'SELECT * FROM Cart WHERE user_id = ? AND game_id = ?',
          [userId, gameId]
        );
        
        if (rows.length > 0) {
          // Update quantity
          await db.query(
            'UPDATE Cart SET quantity = quantity + ? WHERE user_id = ? AND game_id = ?',
            [quantity, userId, gameId]
          );
        } else {
          // Insert new cart item
          await db.query(
            'INSERT INTO Cart (user_id, game_id, quantity) VALUES (?, ?, ?)',
            [userId, gameId, quantity]
          );
        }
        
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.json({ success: true });
        }
      } catch (error) {
        logger.error('Add to cart error:', error);
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.status(400).json({ error: error.message });
        }
      }
    }

    if (event.type === 'UPDATE_CART_ITEM') {
      try {
        const { userId, gameId, quantity } = event;
        
        // Validate inputs
        if (!gameId || quantity < 0) {
          throw new Error('Valid game ID and quantity are required');
        }
        
        if (quantity === 0) {
          // Remove item if quantity is 0
          await db.query(
            'DELETE FROM Cart WHERE user_id = ? AND game_id = ?',
            [userId, gameId]
          );
        } else {
          // Update cart item quantity
          await db.query(
            'UPDATE Cart SET quantity = ? WHERE user_id = ? AND game_id = ?',
            [quantity, userId, gameId]
          );
        }
        
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.json({ success: true });
        }
      } catch (error) {
        logger.error('Update cart item error:', error);
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.status(400).json({ error: error.message });
        }
      }
    }

    if (event.type === 'REMOVE_CART_ITEM') {
      try {
        const { userId, gameId } = event;
        
        // Remove cart item
        const [result] = await db.query(
          'DELETE FROM Cart WHERE user_id = ? AND game_id = ?',
          [userId, gameId]
        );
        
        if (result.affectedRows === 0) {
          throw new Error('Cart item not found');
        }
        
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.json({ success: true });
        }
      } catch (error) {
        logger.error('Remove cart item error:', error);
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.status(400).json({ error: error.message });
        }
      }
    }

    if (event.type === 'GET_CART') {
      try {
        const { userId } = event;
        
        // Fetch cart items with game details
        const [rows] = await db.query(
          `SELECT Cart.game_id, Cart.quantity, Games.title, Games.genre, Games.release_date
           FROM Cart
           JOIN Games ON Cart.game_id = Games.id
           WHERE Cart.user_id = ?`,
          [userId]
        );
        
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.json({ success: true, cart: rows });
        }
      } catch (error) {
        logger.error('Get cart error:', error);
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.status(500).json({ error: 'Get cart failed' });
        }
      }
    }

  }).onDone(() => {
    logger.info(`Key: ${key} Machine reached final state and stopped.`);
    if (keys[key]) {
      delete keys[key];
    }
  });

  service.start();
  return service;
}

// Basic endpoints for testing
app.post('/login', (req, res) => {
  res.send('Express server is running 🚀');
});
app.get('/login', (req, res) => {
  res.send('GET request to /login endpoint');
});
app.put('/login', (req, res) => {
  res.send('PUT request to /login endpoint');
});
app.delete('/login', (req, res) => {
  res.send('DELETE request to /login endpoint');
});

// Main FSM endpoint with proper authentication handling
app.post("/fsm/machine", async (req, res) => {
    httpReq = req.body || {};
    var key = httpReq.key;

    if (!key) {
      key = "default";
      logger.info("Request Token key missing, assigned default key.");
    }

    if (!(key in keys)) {
      keys[key] = {
        service: createService(key),
        res: res,
      };
      logger.info(`Created new FSM service for key: ${key}`);
    } else {
      keys[key].res = res;
      logger.info(`Using existing FSM service for key: ${key}`);
    }

    const service = keys[key].service;
    const jsonObj = httpReq.data || {};
    const transition = httpReq.transition;

    logger.info(`Data from Front-End = ${JSON.stringify(jsonObj)} `);
    logger.info(`Front-End transition = ${transition}`);
    logger.info(`Current FSM state for key ${key}: ${JSON.stringify(service.state.value)}`);

    if (!transition) {
      return res.status(400).json({ code: "FSM-03", errorMessage: "Missing transition event" });
    }

    try {
      // Handle SIGNUP authentication
      if (transition === 'SIGNUP') {
        const userInfo = await authService.signup(jsonObj);
        
        if (service.state.nextEvents.includes(transition)) {
          service.send({
            ...jsonObj,
            type: transition,
            userInfo: userInfo,
          });
          
          return res.json({
            success: true,
            user: userInfo,
            state: service.state.value,
            context: service.state.context,
            nextEvents: service.state.nextEvents,
          });
        } else {
          return res.status(400).json({
            code: "FSM-01",
            errorMessage: "Invalid transition event for current state",
            currentState: service.state.value,
            nextEvents: service.state.nextEvents,
          });
        }
      }

      // Handle LOGIN authentication
      if (transition === 'LOGIN') {
        const { email, password } = jsonObj;
        const userInfo = await authService.login(email, password);
        
        if (service.state.nextEvents.includes(transition)) {
          service.send({
            ...jsonObj,
            type: transition,
            userInfo: userInfo,
          });
          
          return res.json({
            success: true,
            user: userInfo,
            state: service.state.value,
            context: service.state.context,
            nextEvents: service.state.nextEvents,
          });
        } else {
          return res.status(400).json({
            code: "FSM-01",
            errorMessage: "Invalid transition event for current state",
            currentState: service.state.value,
            nextEvents: service.state.nextEvents,
          });
        }
      }

      // Handle other transitions normally
      if (service.state.nextEvents.includes(transition)) {
        service.send({
          ...jsonObj,
          type: transition,
        });
        logger.info(`Transition ${transition} accepted for key ${key}, new state: ${JSON.stringify(service.state.value)}`);
        return res.json({
          state: service.state.value,
          context: service.state.context,
          nextEvents: service.state.nextEvents,
        });
      } else {
        logger.info(`Invalid transition ${transition} for current state ${JSON.stringify(service.state.value)} and key ${key}`);
        return res.status(400).json({
          code: "FSM-01",
          errorMessage: "Invalid transition event for current state",
          currentState: service.state.value,
          nextEvents: service.state.nextEvents,
          context: service.state.context,
        });
      }

    } catch (error) {
      logger.error(`Error handling ${transition}:`, error);
      return res.status(error.message.includes('Too many login attempts') ? 429 : 400).json({
        error: error.message
      });
    }
});

app.get('/fsm/machine', (req, res) => {
  const key = req.query.key || 'default';
  if (!(key in keys)) {
    keys[key] = {
      service: createService(key),
      res: null,
    };
    logger.info(`Created new FSM service for key: ${key} (GET request)`);
  }
  const service = keys[key].service;
  logger.info(`GET FSM state for key ${key}: ${JSON.stringify(service.state.value)}`);
  res.json({
    state: service.state.value,
    context: service.state.context,
    nextEvents: service.state.nextEvents,
  });
});

app.put('/fsm/machine', (req, res) => {
  res.send('PUT request to /fsm/machine endpoint');
});

app.delete('/fsm/machine', (req, res) => {
  res.send('DELETE request to /fsm/machine endpoint');
});

// REST API Endpoints

// Middleware to verify authentication token (simplified - in production use JWT)
const authenticateUser = async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    const userEmail = req.headers['user-email'];
    
    if (!userId || !userEmail) {
      return res.status(401).json({ error: 'Authentication required. Please provide user-id and user-email headers.' });
    }
    
    // Verify user exists
    const [rows] = await db.query('SELECT * FROM Users WHERE id = ? AND email = ?', [userId, userEmail]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid authentication credentials' });
    }
    
    req.user = rows[0];
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// POST /api/games - Add a new game (sellers only)
app.post('/api/games', authenticateUser, async (req, res) => {
  try {
    const { title, genre, releaseDate, price, description } = req.body;
    const userId = req.user.id;
    
    // Verify user is a seller
    if (req.user.role !== 'seller') {
      return res.status(403).json({ error: 'Only sellers can add games' });
    }
    
    // Validate required fields
    if (!title || !genre || !releaseDate) {
      return res.status(400).json({ error: 'Title, genre, and release date are required' });
    }
    
    // Validate price if provided
    if (price && (isNaN(price) || price < 0)) {
      return res.status(400).json({ error: 'Price must be a valid positive number' });
    }
    
    // Insert new game
    const [result] = await db.query(
      'INSERT INTO Games (seller_id, title, genre, release_date, price, description) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, title, genre, releaseDate, price || 0, description || '']
    );
    
    // Update seller's games count
    await db.query(
      'UPDATE Sellers SET gamesListed = gamesListed + 1 WHERE user_id = ?',
      [userId]
    );
    
    // Fetch the created game
    const [gameRows] = await db.query('SELECT * FROM Games WHERE id = ?', [result.insertId]);
    
    logger.info(`Game added by seller ${req.user.email}: ${title}`);
    
    res.status(201).json({
      success: true,
      message: 'Game added successfully',
      game: gameRows[0]
    });
    
  } catch (error) {
    logger.error('Add game API error:', error);
    res.status(500).json({ error: 'Failed to add game' });
  }
});

// POST /api/orders - Create a new order
app.post('/api/orders', authenticateUser, async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items are required' });
    }
    
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ error: 'Valid total amount is required' });
    }
    
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({ error: 'Complete shipping address is required' });
    }
    
    // Validate payment method
    const validPaymentMethods = ['credit_card', 'debit_card', 'paypal', 'bank_transfer'];
    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({ error: 'Valid payment method is required' });
    }
    
    // Start transaction
    await db.query('START TRANSACTION');
    
    try {
      // Validate all games exist and calculate total
      let calculatedTotal = 0;
      const validatedItems = [];
      
      for (const item of items) {
        if (!item.gameId || !item.quantity || item.quantity <= 0) {
          throw new Error('Each item must have gameId and valid quantity');
        }
        
        const [gameRows] = await db.query('SELECT * FROM Games WHERE id = ?', [item.gameId]);
        if (gameRows.length === 0) {
          throw new Error(`Game with ID ${item.gameId} not found`);
        }
        
        const game = gameRows[0];
        const itemTotal = (game.price || 0) * item.quantity;
        calculatedTotal += itemTotal;
        
        validatedItems.push({
          gameId: item.gameId,
          quantity: item.quantity,
          price: game.price || 0,
          title: game.title
        });
      }
      
      // Verify total amount matches calculated total (allowing small floating point differences)
      if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
        throw new Error(`Total amount mismatch. Expected: ${calculatedTotal}, Provided: ${totalAmount}`);
      }
      
      // Create order
      const [orderResult] = await db.query(
        `INSERT INTO Orders (user_id, total_amount, status, payment_method, shipping_address, created_at) 
         VALUES (?, ?, 'pending', ?, ?, NOW())`,
        [userId, totalAmount, paymentMethod, JSON.stringify(shippingAddress)]
      );
      
      const orderId = orderResult.insertId;
      
      // Create order items
      for (const item of validatedItems) {
        await db.query(
          'INSERT INTO OrderItems (order_id, game_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.gameId, item.quantity, item.price]
        );
      }
      
      // Remove items from cart if they exist
      for (const item of validatedItems) {
        await db.query(
          'DELETE FROM Cart WHERE user_id = ? AND game_id = ?',
          [userId, item.gameId]
        );
      }
      
      await db.query('COMMIT');
      
      // Fetch complete order with items
      const [orderRows] = await db.query(`
        SELECT o.*, 
               JSON_ARRAYAGG(
                 JSON_OBJECT(
                   'gameId', oi.game_id,
                   'title', g.title,
                   'quantity', oi.quantity,
                   'price', oi.price
                 )
               ) as items
        FROM Orders o
        LEFT JOIN OrderItems oi ON o.id = oi.order_id
        LEFT JOIN Games g ON oi.game_id = g.id
        WHERE o.id = ?
        GROUP BY o.id
      `, [orderId]);
      
      logger.info(`Order created for user ${req.user.email}: Order ID ${orderId}, Total: ${totalAmount}`);
      
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order: {
          ...orderRows[0],
          shipping_address: JSON.parse(orderRows[0].shipping_address),
          items: JSON.parse(orderRows[0].items)
        }
      });
      
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    logger.error('Create order API error:', error);
    res.status(400).json({ error: error.message || 'Failed to create order' });
  }
});

// GET /api/sales/:sellerId - Fetch sales data for a seller
app.get('/api/sales/:sellerId', authenticateUser, async (req, res) => {
  try {
    const sellerId = parseInt(req.params.sellerId);
    const { startDate, endDate, status } = req.query;
    
    // Verify seller exists and user has permission
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Only sellers can view sales data.' });
    }
    
    // If not admin, sellers can only view their own sales
    if (req.user.role === 'seller' && req.user.id !== sellerId) {
      return res.status(403).json({ error: 'You can only view your own sales data' });
    }
    
    // Verify seller exists
    const [sellerRows] = await db.query('SELECT * FROM Users WHERE id = ? AND role = ?', [sellerId, 'seller']);
    if (sellerRows.length === 0) {
      return res.status(404).json({ error: 'Seller not found' });
    }
    
    // Build query with optional filters
    let query = `
      SELECT 
        o.id as order_id,
        o.total_amount,
        o.status,
        o.payment_method,
        o.created_at,
        o.updated_at,
        oi.quantity,
        oi.price as item_price,
        g.id as game_id,
        g.title as game_title,
        g.genre,
        u.name as buyer_name,
        u.email as buyer_email
      FROM Orders o
      JOIN OrderItems oi ON o.id = oi.order_id
      JOIN Games g ON oi.game_id = g.id
      JOIN Users u ON o.user_id = u.id
      WHERE g.seller_id = ?
    `;
    
    const queryParams = [sellerId];
    
    // Add date filters
    if (startDate) {
      query += ' AND o.created_at >= ?';
      queryParams.push(startDate);
    }
    
    if (endDate) {
      query += ' AND o.created_at <= ?';
      queryParams.push(endDate + ' 23:59:59'); // Include full end date
    }
    
    // Add status filter
    if (status) {
      query += ' AND o.status = ?';
      queryParams.push(status);
    }
    
    query += ' ORDER BY o.created_at DESC';
    
    const [salesRows] = await db.query(query, queryParams);
    
    // Calculate summary statistics
    const [summaryRows] = await db.query(`
      SELECT 
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(oi.quantity * oi.price), 0) as total_revenue,
        COALESCE(SUM(oi.quantity), 0) as total_games_sold,
        COUNT(DISTINCT o.user_id) as unique_customers
      FROM Orders o
      JOIN OrderItems oi ON o.id = oi.order_id
      JOIN Games g ON oi.game_id = g.id
      WHERE g.seller_id = ?
      ${startDate ? 'AND o.created_at >= ?' : ''}
      ${endDate ? 'AND o.created_at <= ?' : ''}
      ${status ? 'AND o.status = ?' : ''}
    `, queryParams);
    
    const summary = summaryRows[0];
    
    // Group sales by order
    const ordersMap = new Map();
    salesRows.forEach(row => {
      if (!ordersMap.has(row.order_id)) {
        ordersMap.set(row.order_id, {
          order_id: row.order_id,
          total_amount: row.total_amount,
          status: row.status,
          payment_method: row.payment_method,
          created_at: row.created_at,
          updated_at: row.updated_at,
          buyer_name: row.buyer_name,
          buyer_email: row.buyer_email,
          items: []
        });
      }
      
      ordersMap.get(row.order_id).items.push({
        game_id: row.game_id,
        game_title: row.game_title,
        genre: row.genre,
        quantity: row.quantity,
        item_price: row.item_price,
        total_price: row.quantity * row.item_price
      });
    });
    
    const orders = Array.from(ordersMap.values());
    
    logger.info(`Sales data retrieved for seller ${sellerId}: ${orders.length} orders`);
    
    res.json({
      success: true,
      seller: {
        id: sellerRows[0].id,
        name: sellerRows[0].name,
        email: sellerRows[0].email
      },
      summary: {
        total_orders: parseInt(summary.total_orders),
        total_revenue: parseFloat(summary.total_revenue),
        total_games_sold: parseInt(summary.total_games_sold),
        unique_customers: parseInt(summary.unique_customers)
      },
      filters: {
        startDate: startDate || null,
        endDate: endDate || null,
        status: status || null
      },
      orders: orders
    });
    
  } catch (error) {
    logger.error('Get sales API error:', error);
    res.status(500).json({ error: 'Failed to fetch sales data' });
  }
});

// PUT /api/orders/:orderId - Update order status and payment info
app.put('/api/orders/:orderId', authenticateUser, async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const { status, paymentStatus, paymentTransactionId, notes } = req.body;
    
    // Verify order exists
    const [orderRows] = await db.query('SELECT * FROM Orders WHERE id = ?', [orderId]);
    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orderRows[0];
    
    // Check permissions - users can only update their own orders, sellers can update orders for their games
    let hasPermission = false;
    
    if (req.user.id === order.user_id) {
      // Order owner - can only update limited fields
      hasPermission = true;
      if (status && !['cancelled'].includes(status)) {
        return res.status(403).json({ error: 'Customers can only cancel their orders' });
      }
    } else if (req.user.role === 'seller') {
      // Check if seller has games in this order
      const [sellerOrderRows] = await db.query(`
        SELECT COUNT(*) as count 
        FROM OrderItems oi 
        JOIN Games g ON oi.game_id = g.id 
        WHERE oi.order_id = ? AND g.seller_id = ?
      `, [orderId, req.user.id]);
      
      if (sellerOrderRows[0].count > 0) {
        hasPermission = true;
      }
    } else if (req.user.role === 'admin') {
      hasPermission = true;
    }
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'You do not have permission to update this order' });
    }
    
    // Validate status if provided
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }
    
    // Validate payment status if provided
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }
    
    // Build update query
    const updateFields = [];
    const updateValues = [];
    
    if (status) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    
    if (paymentStatus) {
      updateFields.push('payment_status = ?');
      updateValues.push(paymentStatus);
    }
    
    if (paymentTransactionId) {
      updateFields.push('payment_transaction_id = ?');
      updateValues.push(paymentTransactionId);
    }
    
    if (notes) {
      updateFields.push('notes = ?');
      updateValues.push(notes);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    // Add updated timestamp
    updateFields.push('updated_at = NOW()');
    updateValues.push(orderId);
    
    // Update order
    await db.query(
      `UPDATE Orders SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    // Fetch updated order
    const [updatedOrderRows] = await db.query(`
      SELECT o.*, 
             JSON_ARRAYAGG(
               JSON_OBJECT(
                 'gameId', oi.game_id,
                 'title', g.title,
                 'quantity', oi.quantity,
                 'price', oi.price
               )
             ) as items
      FROM Orders o
      LEFT JOIN OrderItems oi ON o.id = oi.order_id
      LEFT JOIN Games g ON oi.game_id = g.id
      WHERE o.id = ?
      GROUP BY o.id
    `, [orderId]);
    
    const updatedOrder = updatedOrderRows[0];
    
    logger.info(`Order ${orderId} updated by user ${req.user.email}. Status: ${status || 'unchanged'}, Payment: ${paymentStatus || 'unchanged'}`);
    
    res.json({
      success: true,
      message: 'Order updated successfully',
      order: {
        ...updatedOrder,
        shipping_address: updatedOrder.shipping_address ? JSON.parse(updatedOrder.shipping_address) : null,
        items: JSON.parse(updatedOrder.items)
      }
    });
    
  } catch (error) {
    logger.error('Update order API error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Database management endpoints
app.post('/init-db', async (req, res) => {
  try {
    await initializeDatabase();
    res.json({ message: 'Database initialized successfully' });
  } catch (error) {
    logger.error('Database initialization error:', error);
    res.status(500).json({ error: 'Database initialization failed' });
  }
});

app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT VERSION() AS version');
    res.json({ mysqlVersion: rows[0].version });
  } catch (error) {
    logger.error('Database query error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Page endpoints
const pages = [
  'home',
  'about',
  'cart',
  'categories',
  'checkout',
  'forgot-password',
  'games',
  'login',
  'profile',
  'signup',
  'deals'
];

pages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.json({ method: 'GET', page: page, message: `GET request to /${page} endpoint` });
  });

  app.post(`/${page}`, (req, res) => {
    res.json({ method: 'POST', page: page, message: `POST request to /${page} endpoint`, data: req.body });
  });

  app.put(`/${page}`, (req, res) => {
    res.json({ method: 'PUT', page: page, message: `PUT request to /${page} endpoint`, data: req.body });
  });

  app.delete(`/${page}`, (req, res) => {
    res.json({ method: 'DELETE', page: page, message: `DELETE request to /${page} endpoint` });
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Cleanup function for rate limiting (optional - runs every hour)
setInterval(() => {
  const now = Date.now();
  for (const [email, attempts] of loginAttempts.entries()) {
    const recentAttempts = attempts.filter(timestamp => now - timestamp < LOCKOUT_TIME);
    if (recentAttempts.length === 0) {
      loginAttempts.delete(email);
    } else {
      loginAttempts.set(email, recentAttempts);
    }
  }
}, 60 * 60 * 1000); // Run every hour

// Server startup with database initialization
async function startServer() {
  try {
    console.log('🔄 Testing database connection...');
    const connectionTest = await testDatabaseConnection();
    
    if (!connectionTest) {
      console.error('❌ Database connection failed. Please check your MySQL server and credentials.');
      process.exit(1);
    }

    console.log('🔄 Initializing database tables...');
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log('📊 Database tables are ready!');
      console.log('🔐 Security features enabled:');
      console.log('   • Password hashing with bcrypt (12 rounds)');
      console.log('   • Rate limiting for login attempts');
      console.log('   • Input validation');
      console.log('   • SQL injection protection');
      console.log('🎯 You can now use the API endpoints');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();