import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import logger from '../utils/logger';

// Prisma Client Setup
export const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Prisma Logging
prisma.$on('query', e => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Query: ' + e.query);
    logger.debug('Params: ' + e.params);
    logger.debug('Duration: ' + e.duration + 'ms');
  }
});

prisma.$on('error', e => {
  logger.error('Prisma Error:', e);
});

prisma.$on('info', e => {
  logger.info('Prisma Info:', e.message);
});

prisma.$on('warn', e => {
  logger.warn('Prisma Warning:', e.message);
});

// Redis Client Setup
const redisConfig: any = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: () => null, // Don't retry on failure
  lazyConnect: true,
};

// Only add password if it exists
if (process.env.REDIS_PASSWORD) {
  redisConfig.password = process.env.REDIS_PASSWORD;
}

export const redis = new Redis(redisConfig);

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', error => {
  logger.error('Redis connection error:', error);
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

// Database Connection Helper
export const connectDatabase = async (): Promise<void> => {
  try {
    // Test Prisma connection
    await prisma.$connect();
    logger.info('PostgreSQL connected successfully');

    // Test Redis connection
    await redis.connect();
    const redisResponse = await redis.ping();
    if (redisResponse === 'PONG') {
      logger.info('Redis connected successfully');
    }

    logger.info('All database connections established');
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

// Graceful Shutdown
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    await redis.disconnect();
    logger.info('All database connections closed');
  } catch (error) {
    logger.error('Error closing database connections:', error);
    throw error;
  }
};

// Health Check
export const checkDatabaseHealth = async (): Promise<{
  postgres: boolean;
  redis: boolean;
}> => {
  const health = {
    postgres: false,
    redis: false,
  };

  try {
    // Check PostgreSQL
    await prisma.$queryRaw`SELECT 1`;
    health.postgres = true;
  } catch (error) {
    logger.error('PostgreSQL health check failed:', error);
  }

  try {
    // Check Redis
    const redisResponse = await redis.ping();
    health.redis = redisResponse === 'PONG';
  } catch (error) {
    logger.error('Redis health check failed:', error);
  }

  return health;
};

// Cache Helper Functions
export const cache = {
  // Get from cache
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  },

  // Set to cache with TTL
  set: async <T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> => {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  },

  // Delete from cache
  del: async (key: string): Promise<void> => {
    try {
      await redis.del(key);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  },

  // Clear cache pattern
  clear: async (pattern: string): Promise<void> => {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logger.error('Cache clear error:', error);
    }
  },
};

// Session Helper Functions
export const session = {
  // Get session data
  get: async (sessionId: string): Promise<any> => {
    return await cache.get(`session:${sessionId}`);
  },

  // Set session data
  set: async (sessionId: string, data: any, ttlSeconds: number = 86400): Promise<void> => {
    await cache.set(`session:${sessionId}`, data, ttlSeconds);
  },

  // Delete session
  delete: async (sessionId: string): Promise<void> => {
    await cache.del(`session:${sessionId}`);
  },

  // Extend session TTL
  extend: async (sessionId: string, ttlSeconds: number = 86400): Promise<void> => {
    await redis.expire(`session:${sessionId}`, ttlSeconds);
  },
};

// Export getPrismaClient for compatibility
export const getPrismaClient = () => prisma;
