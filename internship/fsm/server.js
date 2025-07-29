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
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

// Authentication helper functions
const authHelpers = {
  // Check if user is rate limited
  isRateLimited: (email) => {
    const attempts = loginAttempts.get(email);
    if (!attempts) return false;
    
    if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
      const timeLeft = attempts.lockoutUntil - Date.now();
      if (timeLeft > 0) {
        return { limited: true, timeLeft: Math.ceil(timeLeft / 1000 / 60) };
      } else {
        // Reset attempts after lockout period
        loginAttempts.delete(email);
        return false;
      }
    }
    return false;
  },

  // Record failed login attempt
  recordFailedAttempt: (email) => {
    const attempts = loginAttempts.get(email) || { count: 0, lockoutUntil: 0 };
    attempts.count++;
    
    if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
      attempts.lockoutUntil = Date.now() + LOCKOUT_TIME;
      logger.warn(`Account locked due to too many failed attempts: ${email}`);
    }
    
    loginAttempts.set(email, attempts);
    logger.info(`Failed login attempt ${attempts.count} for: ${email}`);
  },

  // Clear failed attempts on successful login
  clearFailedAttempts: (email) => {
    loginAttempts.delete(email);
  },

  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate password strength
  isValidPassword: (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  // Authenticate user
  authenticateUser: async (email, password) => {
    try {
      // Input validation
      if (!email || !password) {
        return { success: false, error: 'Email and password are required', code: 'MISSING_FIELDS' };
      }

      if (!authHelpers.isValidEmail(email)) {
        return { success: false, error: 'Invalid email format', code: 'INVALID_EMAIL' };
      }

      // Check rate limiting
      const rateLimited = authHelpers.isRateLimited(email);
      if (rateLimited) {
        return { 
          success: false, 
          error: `Too many failed attempts. Try again in ${rateLimited.timeLeft} minutes`, 
          code: 'RATE_LIMITED' 
        };
      }

      // Fetch user by email
      const [rows] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
      if (rows.length === 0) {
        authHelpers.recordFailedAttempt(email);
        logger.info(`Login attempt failed: Email ${email} not found`);
        return { success: false, error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' };
      }

      const user = rows[0];
      
      // Compare password
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        authHelpers.recordFailedAttempt(email);
        logger.info(`Login attempt failed: Invalid password for email ${email}`);
        return { success: false, error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' };
      }

      // Fetch seller profile if seller
      let sellerProfile = null;
      if (user.role === 'seller') {
        const [sellerRows] = await db.query('SELECT * FROM Sellers WHERE user_id = ?', [user.id]);
        if (sellerRows.length > 0) {
          sellerProfile = sellerRows[0];
        }
      }

      // Clear failed attempts on successful login
      authHelpers.clearFailedAttempts(email);

      const userInfo = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        sellerProfile,
      };

      logger.info(`Login successful for user: ${email} (ID: ${user.id})`);
      return { success: true, user: userInfo };

    } catch (error) {
      logger.error('Authentication error:', error);
      return { success: false, error: 'Authentication failed', code: 'SERVER_ERROR' };
    }
  },

  // Register new user
  registerUser: async (userData) => {
    try {
      const { name, email, password, role, sellerProfile } = userData;

      // Input validation
      if (!name || !email || !password || !role) {
        return { success: false, error: 'All fields are required', code: 'MISSING_FIELDS' };
      }

      if (!authHelpers.isValidEmail(email)) {
        return { success: false, error: 'Invalid email format', code: 'INVALID_EMAIL' };
      }

      if (!authHelpers.isValidPassword(password)) {
        return { 
          success: false, 
          error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character', 
          code: 'WEAK_PASSWORD' 
        };
      }

      if (!['gamer', 'seller'].includes(role)) {
        return { success: false, error: 'Invalid role', code: 'INVALID_ROLE' };
      }

      // Check if email already exists
      const [existingUsers] = await db.query('SELECT id FROM Users WHERE email = ?', [email]);
      if (existingUsers.length > 0) {
        return { success: false, error: 'Email already registered', code: 'EMAIL_EXISTS' };
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

      const userInfo = { id: userId, name, email, role };
      logger.info(`User registered successfully: ${email} (ID: ${userId})`);
      return { success: true, user: userInfo };

    } catch (error) {
      logger.error('Registration error:', error);
      return { success: false, error: 'Registration failed', code: 'SERVER_ERROR' };
    }
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

    // LOGIN and SIGNUP are now handled in the main endpoint before reaching here
    // These handlers just update the context with the provided user info
    if (event.type === 'LOGIN') {
      if (event.userInfo) {
        state.context.user = event.userInfo;
        logger.info(`User context updated for login: ${event.userInfo.email}`);
      }
    }

    if (event.type === 'SIGNUP') {
      if (event.userInfo) {
        state.context.user = event.userInfo;
        logger.info(`User context updated for signup: ${event.userInfo.email}`);
      }
    }

    if (event.type === 'EDIT_PROFILE') {
      try {
        const { id, name, email, role, sellerProfile } = event;
        
        // Validate inputs
        if (!authHelpers.isValidEmail(email)) {
          if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
            keys[key].res.status(400).json({ error: 'Invalid email format' });
          }
          return;
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
        logger.info(`Profile updated for user ID: ${id}`);
      } catch (error) {
        logger.error('Edit profile error:', error);
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.status(500).json({ error: 'Edit profile failed' });
        }
      }
    }

    // Game management operations
    if (event.type === 'ADD_GAME') {
      try {
        const { userId, title, genre, releaseDate } = event;
        
        // Validate inputs
        if (!title || !genre || !releaseDate) {
          if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
            keys[key].res.status(400).json({ error: 'All game fields are required' });
          }
          return;
        }

        const [result] = await db.query(
          'INSERT INTO Games (seller_id, title, genre, release_date) VALUES (?, ?, ?, ?)',
          [userId, title, genre, releaseDate]
        );
        
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.json({ success: true, gameId: result.insertId });
        }
        logger.info(`Game added: ${title} by user ID: ${userId}`);
      } catch (error) {
        logger.error('Add game error:', error);
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.status(500).json({ error: 'Add game failed' });
        }
      }
    }

    if (event.type === 'UPDATE_GAME') {
      try {
        const { gameId, title, genre, releaseDate } = event;
        
        if (!title || !genre || !releaseDate) {
          if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
            keys[key].res.status(400).json({ error: 'All game fields are required' });
          }
          return;
        }

        await db.query(
          'UPDATE Games SET title = ?, genre = ?, release_date = ? WHERE id = ?',
          [title, genre, releaseDate, gameId]
        );
        
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.json({ success: true });
        }
        logger.info(`Game updated: ID ${gameId}`);
      } catch (error) {
        logger.error('Update game error:', error);
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.status(500).json({ error: 'Update game failed' });
        }
      }
    }

    if (event.type === 'DELETE_GAME') {
      try {
        const { gameId } = event;
        await db.query('DELETE FROM Games WHERE id = ?', [gameId]);
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.json({ success: true });
        }
        logger.info(`Game deleted: ID ${gameId}`);
      } catch (error) {
        logger.error('Delete game error:', error);
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.status(500).json({ error: 'Delete game failed' });
        }
      }
    }

    // Cart operations
    if (event.type === 'ADD_TO_CART') {
      try {
        const { userId, gameId, quantity } = event;
        
        if (!userId || !gameId || !quantity || quantity <= 0) {
          if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
            keys[key].res.status(400).json({ error: 'Valid userId, gameId, and quantity are required' });
          }
          return;
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
        logger.info(`Added to cart: Game ${gameId} for user ${userId}`);
      } catch (error) {
        logger.error('Add to cart error:', error);
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.status(500).json({ error: 'Add to cart failed' });
        }
      }
    }

    if (event.type === 'UPDATE_CART_ITEM') {
      try {
        const { userId, gameId, quantity } = event;
        
        if (!userId || !gameId || quantity < 0) {
          if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
            keys[key].res.status(400).json({ error: 'Valid userId, gameId, and quantity are required' });
          }
          return;
        }

        if (quantity === 0) {
          // Remove item if quantity is 0
          await db.query(
            'DELETE FROM Cart WHERE user_id = ? AND game_id = ?',
            [userId, gameId]
          );
        } else {
          await db.query(
            'UPDATE Cart SET quantity = ? WHERE user_id = ? AND game_id = ?',
            [quantity, userId, gameId]
          );
        }
        
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.json({ success: true });
        }
        logger.info(`Updated cart: Game ${gameId} for user ${userId}`);
      } catch (error) {
        logger.error('Update cart item error:', error);
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.status(500).json({ error: 'Update cart item failed' });
        }
      }
    }

    if (event.type === 'REMOVE_CART_ITEM') {
      try {
        const { userId, gameId } = event;
        await db.query(
          'DELETE FROM Cart WHERE user_id = ? AND game_id = ?',
          [userId, gameId]
        );
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.json({ success: true });
        }
        logger.info(`Removed from cart: Game ${gameId} for user ${userId}`);
      } catch (error) {
        logger.error('Remove cart item error:', error);
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.status(500).json({ error: 'Remove cart item failed' });
        }
      }
    }

    if (event.type === 'GET_CART') {
      try {
        const { userId } = event;
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
        logger.info(`Cart retrieved for user ${userId}`);
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

    // Handle LOGIN authentication before state machine
    if (transition === 'LOGIN') {
      const authResult = await authHelpers.authenticateUser(jsonObj.email, jsonObj.password);
      
      if (!authResult.success) {
        return res.status(authResult.code === 'RATE_LIMITED' ? 429 : 401).json({ 
          error: authResult.error,
          code: authResult.code 
        });
      }

      // Authentication successful - proceed with state machine
      if (service.state.nextEvents.includes(transition)) {
        service.send({
          ...jsonObj,
          type: transition,
          userInfo: authResult.user,
        });
        
        return res.json({
          success: true,
          user: authResult.user,
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

    // Handle SIGNUP before state machine
    if (transition === 'SIGNUP') {
      const registrationResult = await authHelpers.registerUser(jsonObj);
      
      if (!registrationResult.success) {
        return res.status(registrationResult.code === 'EMAIL_EXISTS' ? 409 : 400).json({ 
          error: registrationResult.error,
          code: registrationResult.code 
        });
      }

      // Registration successful - proceed with state machine
      if (service.state.nextEvents.includes(transition)) {
        service.send({
          ...jsonObj,
          type: transition,
          userInfo: registrationResult.user,
        });
        
        return res.json({
          success: true,
          user: registrationResult.user,
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
});

// Other endpoints remain the same
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

// Database endpoints
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

// Security monitoring endpoint
app.get('/security/login-attempts', (req, res) => {
  const attempts = Array.from(loginAttempts.entries()).map(([email, data]) => ({
    email,
    attempts: data.count,
    lockedUntil: data.lockoutUntil > Date.now() ? new Date(data.lockoutUntil) : null
  }));
  res.json({ loginAttempts: attempts });
});

// Page endpoints
const pages = [
  'home', 'about', 'cart', 'categories', 'checkout', 'forgot-password',
  'games', 'login', 'profile', 'signup', 'deals'
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
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  // Clean up services
  Object.keys(keys).forEach(key => {
    if (keys[key].service) {
      keys[key].service.stop();
    }
  });
  process.exit(0);
});

// Auto-initialize database when server starts
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
      console.log('🔒 Security features enabled:');
      console.log('   - Rate limiting: 5 attempts per 15 minutes');
      console.log('   - Password validation: Strong passwords required');
      console.log('   - Input validation: Email format and required fields');
      console.log('   - Proper error handling with status codes');
      console.log('🎯 You can now use the API endpoints');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();