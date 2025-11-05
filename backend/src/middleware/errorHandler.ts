import { Request, Response, NextFunction } from 'express';
import { logger, securityLogger } from '../config/logger';
import { isProduction } from '../config';

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export class HttpError extends Error implements AppError {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (message: string, statusCode: number = 500): HttpError => {
  return new HttpError(message, statusCode);
};

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  logger.error('Error caught by error handler:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
  });

  // Default error
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    message = 'Resource not found';
    statusCode = 404;
  }

  // Mongoose duplicate key
  if ((err as any).code === 11000) {
    message = 'Duplicate field value entered';
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = 'Invalid input data';
    statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token. Please log in again';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Your token has expired. Please log in again';
    statusCode = 401;
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    switch (prismaError.code) {
      case 'P2002':
        message = 'Duplicate field value entered';
        statusCode = 400;
        break;
      case 'P2014':
        message = 'Invalid ID provided';
        statusCode = 400;
        break;
      case 'P2003':
        message = 'Invalid input data';
        statusCode = 400;
        break;
      default:
        message = 'Database error';
        statusCode = 500;
    }
  }

  // Rate limiting error
  if (err.message.includes('Too many requests')) {
    statusCode = 429;

    // Log potential abuse
    securityLogger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
    });
  }

  // File upload errors
  if (err.message.includes('File too large')) {
    message = 'File size exceeds the maximum allowed limit';
    statusCode = 413;
  }

  if (err.message.includes('Invalid file type')) {
    message = 'Invalid file type. Please upload a supported file format';
    statusCode = 400;
  }

  // AI service errors
  if (err.message.includes('AI service')) {
    message = 'AI service temporarily unavailable. Please try again later';
    statusCode = 503;
  }

  // Database connection errors
  if (err.message.includes('connect ECONNREFUSED') ||
      err.message.includes('Connection terminated')) {
    message = 'Database connection error. Please try again later';
    statusCode = 503;
  }

  // Security-related errors
  if (statusCode === 401 || statusCode === 403) {
    securityLogger.warn('Authentication/Authorization failure', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      error: message,
    });
  }

  // Response format
  const response: any = {
    success: false,
    error: message,
    status: statusCode >= 400 && statusCode < 500 ? 'fail' : 'error',
  };

  // Add error details in development
  if (!isProduction()) {
    response.stack = err.stack;
    response.details = {
      name: err.name,
      originalMessage: err.message,
    };
  }

  // Add request ID if available
  if ((req as any).requestId) {
    response.requestId = (req as any).requestId;
  }

  res.status(statusCode).json(response);
};

// Async error handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new HttpError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

// Validation error handler
export const validationErrorHandler = (errors: any[]): HttpError => {
  const message = errors.map(error => error.message).join('. ');
  return new HttpError(`Validation Error: ${message}`, 400);
};