import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { config } from '@/config';
import { getRedisClient } from '@/config/redis';
import ResponseUtil from '@/utils/response';
import logger from '@/utils/logger';

// Custom store using Redis
class RedisStore {
  private redis = getRedisClient();
  private prefix = 'rate_limit:';

  async increment(key: string): Promise<{ totalHits: number; timeToExpire?: number }> {
    try {
      const redisKey = this.prefix + key;
      const current = await this.redis.incr(redisKey);

      if (current === 1) {
        // First request, set expiration
        await this.redis.expire(redisKey, 60); // 1 minute window
        return { totalHits: current, timeToExpire: 60000 };
      }

      const ttl = await this.redis.ttl(redisKey);
      return { totalHits: current, timeToExpire: ttl * 1000 };
    } catch (error) {
      logger.error('Redis rate limit error:', error);
      // Fallback to allowing the request if Redis is down
      return { totalHits: 1, timeToExpire: 60000 };
    }
  }

  async decrement(key: string): Promise<void> {
    try {
      const redisKey = this.prefix + key;
      await this.redis.decr(redisKey);
    } catch (error) {
      logger.error('Redis rate limit decrement error:', error);
    }
  }

  async resetKey(key: string): Promise<void> {
    try {
      const redisKey = this.prefix + key;
      await this.redis.del(redisKey);
    } catch (error) {
      logger.error('Redis rate limit reset error:', error);
    }
  }
}

// Key generator function
const keyGenerator = (req: Request): string => {
  // Use user ID if authenticated, otherwise use IP
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }

  // Get real IP address
  const forwarded = req.headers['x-forwarded-for'] as string;
  const ip = forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress;
  return `ip:${ip}`;
};

// Skip function for certain requests
const skipFunction = (req: Request): boolean => {
  // Skip rate limiting for health checks
  if (req.path === '/health' || req.path === '/api/health') {
    return true;
  }

  // Skip for admin users in development
  if (config.app.isDevelopment && req.user?.role === 'ADMIN') {
    return true;
  }

  return false;
};

// Rate limit hit handler
const onLimitReached = (req: Request, res: Response): void => {
  logger.warn(`Rate limit exceeded for ${keyGenerator(req)}`, {
    path: req.path,
    method: req.method,
    userAgent: req.get('User-Agent'),
  });
};

// Default rate limiter
export const defaultRateLimit = rateLimit({
  store: new RedisStore(),
  windowMs: 60 * 1000, // 1 minute
  max: config.rateLimit.requestsPerMinute,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator,
  skip: skipFunction,
  onLimitReached,
  handler: (req: Request, res: Response) => {
    ResponseUtil.tooManyRequests(res, 'Too many requests, please try again later');
  },
});

// Strict rate limiter for sensitive endpoints
export const strictRateLimit = rateLimit({
  store: new RedisStore(),
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Only 5 requests per minute
  message: {
    success: false,
    error: 'Too many requests for this sensitive endpoint',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  skip: skipFunction,
  onLimitReached,
  handler: (req: Request, res: Response) => {
    ResponseUtil.tooManyRequests(res, 'Too many requests for sensitive endpoint');
  },
});

// Auth rate limiter for login attempts
export const authRateLimit = rateLimit({
  store: new RedisStore(),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 login attempts per 15 minutes
  message: {
    success: false,
    error: 'Too many login attempts, please try again later',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // For auth, use email + IP combination
    const email = req.body?.email || 'unknown';
    const forwarded = req.headers['x-forwarded-for'] as string;
    const ip = forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress;
    return `auth:${email}:${ip}`;
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  onLimitReached,
  handler: (req: Request, res: Response) => {
    ResponseUtil.tooManyRequests(res, 'Too many login attempts, please try again later');
  },
});

// AI service rate limiter
export const aiRateLimit = rateLimit({
  store: new RedisStore(),
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 AI requests per minute
  message: {
    success: false,
    error: 'Too many AI requests, please try again later',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  skip: skipFunction,
  onLimitReached,
  handler: (req: Request, res: Response) => {
    ResponseUtil.tooManyRequests(res, 'Too many AI requests, please try again later');
  },
});

// File upload rate limiter
export const uploadRateLimit = rateLimit({
  store: new RedisStore(),
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 file uploads per minute
  message: {
    success: false,
    error: 'Too many file uploads, please try again later',
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  skip: skipFunction,
  onLimitReached,
  handler: (req: Request, res: Response) => {
    ResponseUtil.tooManyRequests(res, 'Too many file uploads, please try again later');
  },
});

export default defaultRateLimit;