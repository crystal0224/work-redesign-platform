import { z } from 'zod';
import logger from '../utils/logger';

/**
 * 환경 변수 스키마 정의
 * 배포 시 필수 환경 변수가 누락되거나 잘못된 형식인 경우 서버 시작 전에 에러 발생
 */
const envSchema = z.object({
  // Node 환경
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // 서버 설정
  PORT: z
    .string()
    .default('4000')
    .transform(val => parseInt(val, 10))
    .refine(val => val > 0 && val < 65536, {
      message: 'PORT must be between 1 and 65535',
    }),

  // 데이터베이스
  DATABASE_URL: z
    .string({
      required_error: 'DATABASE_URL is required. Please set it in .env file',
    })
    .url('DATABASE_URL must be a valid URL'),

  // Redis
  REDIS_URL: z
    .string({
      required_error: 'REDIS_URL is required for AI caching and rate limiting',
    })
    .url('REDIS_URL must be a valid URL'),

  // Anthropic API
  ANTHROPIC_API_KEY: z
    .string({
      required_error: 'ANTHROPIC_API_KEY is required for AI features',
    })
    .min(20, 'ANTHROPIC_API_KEY seems too short. Please check your key'),

  // JWT Secret
  JWT_SECRET: z
    .string({
      required_error: 'JWT_SECRET is required for authentication',
    })
    .min(32, 'JWT_SECRET must be at least 32 characters for security'),

  // CORS
  CORS_ORIGIN: z
    .string()
    .url('CORS_ORIGIN must be a valid URL')
    .optional()
    .or(z.literal('*'))
    .default('http://localhost:3000'),

  // AI Cache 설정
  ENABLE_AI_CACHE: z
    .string()
    .optional()
    .default('true')
    .transform(val => val === 'true'),

  AI_CACHE_TTL: z
    .string()
    .optional()
    .default('86400')
    .transform(val => parseInt(val, 10)),

  // Rate Limiting
  RATE_LIMIT_RPM: z
    .string()
    .optional()
    .default('100')
    .transform(val => parseInt(val, 10)),

  // 로그 레벨
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional().default('info'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * 환경 변수 검증 함수
 * 서버 시작 전에 이 함수를 호출하여 필수 환경 변수가 모두 설정되었는지 확인
 */
export function validateEnv(): Env {
  try {
    const env = envSchema.parse(process.env);

    logger.info('✅ Environment variables validated successfully');
    logger.info('Environment configuration:', {
      NODE_ENV: env.NODE_ENV,
      PORT: env.PORT,
      DATABASE_URL: maskUrl(env.DATABASE_URL),
      REDIS_URL: maskUrl(env.REDIS_URL),
      ANTHROPIC_API_KEY: maskApiKey(env.ANTHROPIC_API_KEY),
      CORS_ORIGIN: env.CORS_ORIGIN,
      ENABLE_AI_CACHE: env.ENABLE_AI_CACHE,
      AI_CACHE_TTL: env.AI_CACHE_TTL,
      RATE_LIMIT_RPM: env.RATE_LIMIT_RPM,
      LOG_LEVEL: env.LOG_LEVEL,
    });

    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('❌ Invalid environment variables:');
      logger.error('');

      error.errors.forEach(err => {
        const field = err.path.join('.');
        logger.error(`  • ${field}: ${err.message}`);
      });

      logger.error('');
      logger.error('💡 Fix these issues in your .env file and restart the server');
      logger.error('');

      // 개발 환경에서는 .env.example 힌트 제공
      if (process.env.NODE_ENV !== 'production') {
        logger.error('📝 Check .env.example for reference');
      }
    } else {
      logger.error('❌ Unexpected error during environment validation:', error);
    }

    process.exit(1);
  }
}

/**
 * URL에서 비밀번호 부분을 마스킹
 * 예: postgres://user:password@host:5432/db -> postgres://user:****@host:5432/db
 */
function maskUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    if (urlObj.password) {
      urlObj.password = '****';
    }
    return urlObj.toString();
  } catch {
    return '****';
  }
}

/**
 * API 키를 마스킹
 * 예: sk-ant-1234567890abcdef -> sk-ant-****
 */
function maskApiKey(key: string): string {
  if (key.length <= 8) {
    return '****';
  }
  return key.substring(0, 8) + '****';
}

/**
 * 환경 변수 헬퍼 함수들
 */
export const envHelpers = {
  isDevelopment: () => process.env.NODE_ENV === 'development',
  isProduction: () => process.env.NODE_ENV === 'production',
  isTest: () => process.env.NODE_ENV === 'test',
};
