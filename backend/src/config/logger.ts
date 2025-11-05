import winston from 'winston';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    if (Object.keys(meta).length > 0) {
      log += '\n' + JSON.stringify(meta, null, 2);
    }

    return log;
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'work-redesign-api',
    version: process.env.APP_VERSION || '1.0.0'
  },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Combined log file
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],

  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],

  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV === 'development') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Production logging adjustments
if (process.env.NODE_ENV === 'production') {
  // Add additional transports for production
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }));
}

// HTTP request logger
export const httpLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'work-redesign-api-http',
    type: 'http-request'
  },
  transports: [
    new winston.transports.File({
      filename: 'logs/http.log',
      maxsize: 5242880, // 5MB
      maxFiles: 3,
    }),
  ],
});

if (process.env.NODE_ENV === 'development') {
  httpLogger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, method, url, status, responseTime }) => {
        return `${timestamp} [HTTP]: ${method} ${url} ${status} - ${responseTime}ms`;
      })
    )
  }));
}

// AI request logger
export const aiLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'work-redesign-api-ai',
    type: 'ai-request'
  },
  transports: [
    new winston.transports.File({
      filename: 'logs/ai.log',
      maxsize: 5242880, // 5MB
      maxFiles: 3,
    }),
  ],
});

// Performance logger
export const performanceLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'work-redesign-api-performance',
    type: 'performance'
  },
  transports: [
    new winston.transports.File({
      filename: 'logs/performance.log',
      maxsize: 5242880, // 5MB
      maxFiles: 3,
    }),
  ],
});

// Security logger
export const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'work-redesign-api-security',
    type: 'security'
  },
  transports: [
    new winston.transports.File({
      filename: 'logs/security.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Create logs directory if it doesn't exist
import { promises as fs } from 'fs';
import path from 'path';

const ensureLogDirectory = async () => {
  try {
    const logDir = path.join(process.cwd(), 'logs');
    await fs.mkdir(logDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create logs directory:', error);
  }
};

ensureLogDirectory();

// Helper functions
export const logRequest = (req: any, res: any, responseTime: number) => {
  httpLogger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    responseTime,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id,
  });
};

export const logAIRequest = (type: string, prompt: string, response: string, duration: number, tokens?: number) => {
  aiLogger.info('AI Request', {
    type,
    promptLength: prompt.length,
    responseLength: response.length,
    duration,
    tokens,
  });
};

export const logPerformance = (operation: string, duration: number, metadata?: any) => {
  performanceLogger.info('Performance Metric', {
    operation,
    duration,
    ...metadata,
  });
};

export const logSecurity = (event: string, level: 'info' | 'warn' | 'error', details: any) => {
  securityLogger[level]('Security Event', {
    event,
    ...details,
  });
};

export default logger;