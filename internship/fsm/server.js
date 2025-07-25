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

var keys = {};
var httpReq = {};
var r = 0;
function createService(key) {
  const service = interpret(superAppMachine.withConfig({
    actions: {
      sendCtx: (context, event) => {
        if (keys[key] && keys[key].res && !keys[key].res.headersSent) {
          keys[key].res.json(context);
        }
      },
    },
  })).onTransition((state) => {
    logger.info(`Key: ${key} State: ${JSON.stringify(state.value)} NextEvents: ${state.nextEvents}`);
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${3000}`);
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