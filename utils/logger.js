const winston = require('winston');

// Create a custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(info => `${info.timestamp} [${info.level}]: ${info.message}`)
);

// Create the logger
const logger = winston.createLogger({
  level: 'info',  // Set default log level
  format: logFormat,
  transports: [
    new winston.transports.Console({ format: logFormat }), 
    new winston.transports.File({ filename: 'app.log' })   
  ]
});

module.exports = logger;
