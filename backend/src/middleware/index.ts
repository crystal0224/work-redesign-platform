// Export all middleware
export * from './auth';
export * from './cors';
export * from './rateLimit';
export * from './errorHandler';

// Additional middleware exports
export { default as corsMiddleware } from './cors';
export { default as defaultRateLimit } from './rateLimit';
export { default as errorHandler } from './errorHandler';