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
const bcrypt = require('bcryptjs'); // Changed from 'bcrypt' to 'bcryptjs'
const saltRounds = 10;

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

    if (event.type === 'SIGNUP') {
      try {
        const { name, email, password, role, sellerProfile } = event;
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

        // Update context with user info
        state.context.user = { id: userId, name, email, role };
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.json({ success: true, user: state.context.user });
        }
      } catch (error) {
        logger.error('Signup error:', error);
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.status(500).json({ error: 'Signup failed' });
        }
      }
    }

    if (event.type === 'LOGIN') {
      try {
        const { email, password } = event;
        // Fetch user by email
        const [rows] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (rows.length === 0) {
          if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
            keys[key].res.status(401).json({ error: 'Invalid email or password' });
          }
          return;
        }
        const user = rows[0];
        // Compare password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
            keys[key].res.status(401).json({ error: 'Invalid email or password' });
          }
          return;
        }
        // Fetch seller profile if seller
        let sellerProfile = null;
        if (user.role === 'seller') {
          const [sellerRows] = await db.query('SELECT * FROM Sellers WHERE user_id = ?', [user.id]);
          if (sellerRows.length > 0) {
            sellerProfile = sellerRows[0];
          }
        }
        // Update context with user info
        state.context.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          sellerProfile,
        };
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.json({ success: true, user: state.context.user });
        }
      } catch (error) {
        logger.error('Login error:', error);
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.status(500).json({ error: 'Login failed' });
        }
      }
    }

    if (event.type === 'EDIT_PROFILE') {
      try {
        const { id, name, email, role, sellerProfile } = event;
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
          keys[key].res.status(500).json({ error: 'Edit profile failed' });
        }
      }
    }

    if (event.type === 'ADD_GAME') {
      try {
        const { userId, title, genre, releaseDate } = event;
        // Insert new game for seller
        const [result] = await db.query(
          'INSERT INTO Games (seller_id, title, genre, release_date) VALUES (?, ?, ?, ?)',
          [userId, title, genre, releaseDate]
        );
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.json({ success: true, gameId: result.insertId });
        }
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
          keys[key].res.status(500).json({ error: 'Update game failed' });
        }
      }
    }

    if (event.type === 'DELETE_GAME') {
      try {
        const { gameId } = event;
        // Delete game
        await db.query('DELETE FROM Games WHERE id = ?', [gameId]);
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.json({ success: true });
        }
      } catch (error) {
        logger.error('Delete game error:', error);
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.status(500).json({ error: 'Delete game failed' });
        }
      }
    }

    if (event.type === 'ADD_TO_CART') {
      try {
        const { userId, gameId, quantity } = event;
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
          keys[key].res.status(500).json({ error: 'Add to cart failed' });
        }
      }
    }

    if (event.type === 'UPDATE_CART_ITEM') {
      try {
        const { userId, gameId, quantity } = event;
        // Update cart item quantity
        await db.query(
          'UPDATE Cart SET quantity = ? WHERE user_id = ? AND game_id = ?',
          [quantity, userId, gameId]
        );
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.json({ success: true });
        }
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
        // Remove cart item
        await db.query(
          'DELETE FROM Cart WHERE user_id = ? AND game_id = ?',
          [userId, gameId]
        );
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.json({ success: true });
        }
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

app.post(
  "/fsm/machine",
  (req, res) => {
    httpReq = req.body || {};
    var key = httpReq.key;

    if (!key) {
      key = "default"; // Assign default key if missing
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
      return res.json({ code: "FSM-03", errorMessage: "Missing transition event" });
    }

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
      return res.json({
        code: "FSM-01",
        errorMessage: "Invalid transition event for current state",
        currentState: service.state.value,
        nextEvents: service.state.nextEvents,
        context: service.state.context,
      });
    }
  }
);

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

// Endpoint to initialize database tables manually
app.post('/init-db', async (req, res) => {
  try {
    await initializeDatabase();
    res.json({ message: 'Database initialized successfully' });
  } catch (error) {
    logger.error('Database initialization error:', error);
    res.status(500).json({ error: 'Database initialization failed' });
  }
});

// Example endpoint to test MySQL connection
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT VERSION() AS version');
    res.json({ mysqlVersion: rows[0].version });
  } catch (error) {
    logger.error('Database query error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

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

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
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
      console.log('🎯 You can now use the API endpoints');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();