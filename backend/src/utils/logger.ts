import winston from 'winston';
import { config } from '@/config';

// Custom log format
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += '\n' + JSON.stringify(meta, null, 2);
    }
    return msg;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: config.app.logLevel,
  format: customFormat,
  defaultMeta: {
    service: 'work-redesign-backend',
    environment: config.app.env
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: config.app.isDevelopment ? consoleFormat : customFormat,
      level: config.app.isDevelopment ? 'debug' : 'info'
    }),
  ],
});

// Add file transports for production
if (config.app.isProduction) {
  // Error log file
  logger.add(new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: customFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }));

  // Combined log file
  logger.add(new winston.transports.File({
    filename: 'logs/combined.log',
    format: customFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }));
}

// Create child loggers for different modules
export const createModuleLogger = (module: string): winston.Logger => {
  return logger.child({ module });
};

// Export default logger
export default logger;