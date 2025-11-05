import Redis from 'ioredis';
import { config } from './index';
import logger from '@/utils/logger';

let redis: Redis;

// Singleton pattern for Redis client
export const getRedisClient = (): Redis => {
  if (!redis) {
    redis = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      lazyConnect: true,
      // Connection pool settings
      family: 4,
      keyPrefix: 'work-redesign:',
    });

    // Event handlers
    redis.on('connect', () => {
      logger.info('Redis client connected');
    });

    redis.on('ready', () => {
      logger.info('Redis client ready');
    });

    redis.on('error', (error) => {
      logger.error('Redis connection error:', error);
    });

    redis.on('close', () => {
      logger.info('Redis connection closed');
    });

    redis.on('reconnecting', () => {
      logger.info('Redis client reconnecting...');
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, disconnecting Redis client...');
      await redis.quit();
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, disconnecting Redis client...');
      await redis.quit();
    });
  }

  return redis;
};

// Redis connection test
export const testRedisConnection = async (): Promise<boolean> => {
  try {
    const client = getRedisClient();
    await client.ping();
    logger.info('Redis connection successful');
    return true;
  } catch (error) {
    logger.error('Redis connection failed:', error);
    return false;
  }
};

// Redis health check
export const getRedisHealth = async (): Promise<{
  status: 'healthy' | 'unhealthy';
  responseTime: number;
  error?: string;
}> => {
  const startTime = Date.now();

  try {
    const client = getRedisClient();
    await client.ping();
    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      status: 'unhealthy',
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Cache utilities
export class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = getRedisClient();
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const exists = await this.redis.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  async flushPattern(pattern: string): Promise<boolean> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return true;
    } catch (error) {
      logger.error(`Cache flush pattern error for pattern ${pattern}:`, error);
      return false;
    }
  }
}

export default getRedisClient;