const WINSTON = require("winston");
const path = require("path");
const fs = require("fs");

// Ensure logs directory exists
const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const LOG_FORMAT = (file) => {
  return WINSTON.format.combine(
    WINSTON.format.colorize(),
    WINSTON.format.label({ label: file }),
    WINSTON.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    WINSTON.format.printf(({ timestamp, level, message, label }) => {
      return `[${timestamp} | ${level} | LOG: ${message} | ${label}]`;
    })
  );
};

const logger = (file) => {
  return WINSTON.createLogger({
    level: "debug",
    format: LOG_FORMAT(file),
    transports: [
      new WINSTON.transports.Console({
        handleExceptions: true,
      }),
      new WINSTON.transports.File({
        filename: path.join(logDir, "app.log"),
        level: "info",
        handleExceptions: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
    ],
    exitOnError: false,
  });
};

module.exports = logger;
