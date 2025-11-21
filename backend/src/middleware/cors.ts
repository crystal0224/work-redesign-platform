import cors from 'cors';
import { config } from '@/config';

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // In development, allow configured origin
    if (config.app.isDevelopment) {
      const allowedOrigins = [
        ...(Array.isArray(config.cors.origin) ? config.cors.origin : [config.cors.origin]),
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001', // For testing
      ];

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
    }

    // In production, only allow configured origin
    if (config.app.isProduction) {
      const allowedOrigins = Array.isArray(config.cors.origin) ? config.cors.origin : [config.cors.origin];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
    }

    // Default: allow for test environment
    if (config.app.isTest) {
      return callback(null, true);
    }

    // Reject other origins
    return callback(new Error('Not allowed by CORS'), false);
  },

  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token',
    'X-Session-ID',
    'X-Request-ID',
  ],

  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Per-Page',
    'X-Current-Page',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset',
  ],

  credentials: true, // Allow cookies and authorization headers

  maxAge: config.app.isDevelopment ? 86400 : 3600, // Preflight cache duration

  // Only send CORS headers for cross-origin requests
  preflightContinue: false,

  // Pass the CORS preflight response to the next handler
  optionsSuccessStatus: 200,
};

// Export configured CORS middleware
export const corsMiddleware = cors(corsOptions);

export default corsMiddleware;