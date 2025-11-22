import rateLimit from 'express-rate-limit';
import { Redis } from 'ioredis';
import { getRedis } from '../config/database';
import logger from '../utils/logger';

/**
 * AI-specific rate limiter to prevent excessive API costs
 * More restrictive than general API rate limit
 */
export const aiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 AI requests per minute per IP (very conservative)
  message: {
    success: false,
    error: 'AI API rate limit exceeded',
    message: 'Too many AI analysis requests. Please wait a moment before trying again.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`AI rate limit exceeded for IP: ${req.ip}, User: ${(req as any).user?.email || 'anonymous'}`);
    res.status(429).json({
      success: false,
      error: 'AI API rate limit exceeded',
      message: 'Too many AI analysis requests. Please wait a moment before trying again.',
      retryAfter: 60,
    });
  },
});

/**
 * Per-user AI rate limiter using Redis
 * Limits AI requests per authenticated user
 */
export const createUserAIRateLimiter = () => {
  return async (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        // If not authenticated, skip (will be caught by auth middleware)
        return next();
      }

      const redis = getRedis();
      const key = `ai:ratelimit:user:${userId}`;
      const limit = 20; // 20 AI requests per minute per user
      const window = 60; // 60 seconds

      // Increment counter
      const current = await redis.incr(key);

      // Set expiry on first request
      if (current === 1) {
        await redis.expire(key, window);
      }

      // Check if limit exceeded
      if (current > limit) {
        const ttl = await redis.ttl(key);
        logger.warn(`User AI rate limit exceeded for user: ${req.user?.email}, requests: ${current}`);

        return res.status(429).json({
          success: false,
          error: 'User AI rate limit exceeded',
          message: `You have exceeded the AI analysis limit. Please wait ${ttl} seconds before trying again.`,
          retryAfter: ttl,
          requests: {
            current,
            limit,
            remaining: 0,
          },
        });
      }

      // Add rate limit info to response headers
      res.set({
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': Math.max(0, limit - current).toString(),
        'X-RateLimit-Reset': new Date(Date.now() + (await redis.ttl(key)) * 1000).toISOString(),
      });

      next();
    } catch (error) {
      logger.error('Error in user AI rate limiter:', error);
      // Don't block request on rate limiter error
      next();
    }
  };
};

/**
 * File upload rate limiter
 * Prevents abuse of file upload endpoints
 */
export const fileUploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 uploads per 15 minutes
  message: {
    success: false,
    error: 'Upload rate limit exceeded',
    message: 'Too many file uploads. Please wait before uploading more files.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`File upload rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Upload rate limit exceeded',
      message: 'Too many file uploads. Please wait before uploading more files.',
    });
  },
});

/**
 * Cost tracking middleware
 * Logs AI API usage for cost monitoring
 */
export const aiCostTracker = async (req: any, res: any, next: any) => {
  const startTime = Date.now();

  // Track request
  const originalJson = res.json.bind(res);
  res.json = function (data: any) {
    const duration = Date.now() - startTime;

    // Log AI API usage
    logger.info(`AI API Request:`, {
      userId: req.user?.id,
      userEmail: req.user?.email,
      endpoint: req.path,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

    // Store usage metrics in Redis for cost analysis
    const redis = getRedis();
    const dailyKey = `ai:usage:daily:${new Date().toISOString().split('T')[0]}`;
    redis.hincrby(dailyKey, req.user?.id || 'anonymous', 1).catch((err) => {
      logger.error('Failed to track AI usage:', err);
    });
    redis.expire(dailyKey, 30 * 24 * 60 * 60); // Keep for 30 days

    return originalJson(data);
  };

  next();
};
