import { createHash } from 'crypto';
import Redis from 'ioredis';
import logger from '../utils/logger';

/**
 * AI 응답 캐싱 서비스
 *
 * 목적: AI API 비용 절감 (50% 이상)
 * - 동일한 프롬프트에 대한 응답을 캐싱
 * - 24시간 TTL
 * - Redis 기반 빠른 조회
 */
export class AICacheService {
  private redis: Redis;
  private enabled: boolean;
  private ttl: number;

  constructor(redis: Redis) {
    this.redis = redis;
    this.enabled = process.env.ENABLE_AI_CACHE === 'true';
    this.ttl = parseInt(process.env.AI_CACHE_TTL_SECONDS || '86400', 10); // 24시간
  }

  /**
   * 캐시된 AI 응답 조회
   */
  async getCachedResponse(
    prompt: string,
    context?: any
  ): Promise<string | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      const cacheKey = this.generateCacheKey(prompt, context);
      const cached = await this.redis.get(`ai:response:${cacheKey}`);

      if (cached) {
        logger.info('💰 AI Cache HIT - API 비용 절약!', {
          promptLength: prompt.length,
          cacheKey: cacheKey.substring(0, 16),
        });

        // 캐시 히트 메트릭 기록
        await this.recordCacheMetric('hit');

        return cached;
      }

      // 캐시 미스 메트릭 기록
      await this.recordCacheMetric('miss');

      return null;
    } catch (error) {
      logger.error('AI cache retrieval error:', error);
      return null; // 캐시 에러 시 정상 플로우 진행
    }
  }

  /**
   * AI 응답 캐싱
   */
  async setCachedResponse(
    prompt: string,
    context: any,
    response: string
  ): Promise<void> {
    if (!this.enabled) {
      return;
    }

    try {
      const cacheKey = this.generateCacheKey(prompt, context);
      await this.redis.setex(
        `ai:response:${cacheKey}`,
        this.ttl,
        response
      );

      logger.info('💾 AI Response cached', {
        promptLength: prompt.length,
        responseLength: response.length,
        ttl: this.ttl,
      });
    } catch (error) {
      logger.error('AI cache storage error:', error);
      // 캐시 저장 실패는 무시 (응답은 정상 반환)
    }
  }

  /**
   * 특정 세션의 캐시 무효화
   */
  async invalidateSessionCache(sessionId: string): Promise<void> {
    try {
      const pattern = `ai:response:*${sessionId}*`;
      const keys = await this.redis.keys(pattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.info('🗑️ Session cache invalidated', {
          sessionId,
          keysDeleted: keys.length,
        });
      }
    } catch (error) {
      logger.error('Cache invalidation error:', error);
    }
  }

  /**
   * 캐시 키 생성 (일관된 해시)
   */
  private generateCacheKey(prompt: string, context?: any): string {
    const data = {
      prompt: this.normalizePrompt(prompt),
      context: context || {},
    };

    return createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  /**
   * 프롬프트 정규화 (공백, 줄바꿈 등 일관되게)
   */
  private normalizePrompt(prompt: string): string {
    return prompt
      .trim()
      .replace(/\s+/g, ' ') // 여러 공백 → 하나로
      .toLowerCase();
  }

  /**
   * 캐시 메트릭 기록 (모니터링용)
   */
  private async recordCacheMetric(type: 'hit' | 'miss'): Promise<void> {
    try {
      const key = `ai:metrics:cache:${type}`;
      const today = new Date().toISOString().split('T')[0];
      await this.redis.hincrby(key, today, 1);
      await this.redis.expire(key, 60 * 60 * 24 * 7); // 7일 보관
    } catch (error) {
      // 메트릭 기록 실패는 무시
    }
  }

  /**
   * 캐시 통계 조회
   */
  async getCacheStats(): Promise<{
    hitRate: number;
    totalHits: number;
    totalMisses: number;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const hits = parseInt(
        (await this.redis.hget('ai:metrics:cache:hit', today)) || '0',
        10
      );
      const misses = parseInt(
        (await this.redis.hget('ai:metrics:cache:miss', today)) || '0',
        10
      );
      const total = hits + misses;
      const hitRate = total > 0 ? (hits / total) * 100 : 0;

      return {
        hitRate: Math.round(hitRate * 100) / 100,
        totalHits: hits,
        totalMisses: misses,
      };
    } catch (error) {
      logger.error('Failed to get cache stats:', error);
      return { hitRate: 0, totalHits: 0, totalMisses: 0 };
    }
  }
}

// Singleton instance
let aiCacheInstance: AICacheService | null = null;

export function initAICache(redis: Redis): AICacheService {
  if (!aiCacheInstance) {
    aiCacheInstance = new AICacheService(redis);
  }
  return aiCacheInstance;
}

export function getAICache(): AICacheService {
  if (!aiCacheInstance) {
    throw new Error('AI Cache not initialized. Call initAICache() first.');
  }
  return aiCacheInstance;
}
