import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Application
  app: {
    name: process.env.APP_NAME || 'Work Redesign Platform',
    version: process.env.APP_VERSION || '1.0.0',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.API_PORT || '4000'),
  },

  // Database
  database: {
    url: process.env.DATABASE_URL || 'postgresql://workredesign:password123@localhost:5432/work_redesign',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'work_redesign',
    user: process.env.DB_USER || 'workredesign',
    password: process.env.DB_PASSWORD || 'password123',
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
  },

  // Authentication
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),

    // SK SSO
    skSso: {
      url: process.env.SK_SSO_URL || 'https://sso.sk.com',
      clientId: process.env.SK_SSO_CLIENT_ID,
      clientSecret: process.env.SK_SSO_CLIENT_SECRET,
    },
  },

  // AI Services
  ai: {
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
      maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '4000'),
      timeout: parseInt(process.env.AI_REQUEST_TIMEOUT_MS || '30000'),
    },

    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4',
    },
  },

  // File Storage
  storage: {
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'ap-northeast-2',
      s3Bucket: process.env.S3_BUCKET || 'work-redesign-files',
      s3Endpoint: process.env.S3_ENDPOINT,
    },

    limits: {
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '50') * 1024 * 1024, // Convert to bytes
      maxFilesPerSession: parseInt(process.env.MAX_FILES_PER_SESSION || '10'),
    },
  },

  // Email
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    from: process.env.EMAIL_FROM || 'noreply@sk.com',
  },

  // Security
  security: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    rateLimitRpm: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '60'),
  },

  // Monitoring
  monitoring: {
    datadog: {
      apiKey: process.env.DATADOG_API_KEY,
      appKey: process.env.DATADOG_APP_KEY,
    },

    sentry: {
      dsn: process.env.SENTRY_DSN,
    },

    analytics: {
      gaTrackingId: process.env.GA_TRACKING_ID,
    },
  },

  // Feature Flags
  features: {
    enableAiChat: process.env.ENABLE_AI_CHAT === 'true',
    enableFileUpload: process.env.ENABLE_FILE_UPLOAD === 'true',
    enableEmailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
    enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
    enablePerformanceTracking: process.env.ENABLE_PERFORMANCE_TRACKING === 'true',
  },

  // Performance
  performance: {
    maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS || '100'),
  },

  // Development
  development: {
    logLevel: process.env.LOG_LEVEL || 'info',
    enableCors: process.env.ENABLE_CORS === 'true',
    enableSwagger: process.env.ENABLE_SWAGGER === 'true',
    enableHotReload: process.env.ENABLE_HOT_RELOAD === 'true',
    enableDebugLogs: process.env.ENABLE_DEBUG_LOGS === 'true',
  },
};

// Validation
export const validateConfig = (): void => {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // AI API key validation
  if (!config.ai.anthropic.apiKey && !config.ai.openai.apiKey) {
    console.warn('Warning: No AI API keys configured. AI features will be disabled.');
  }

  // Storage validation
  if (config.features.enableFileUpload && !config.storage.aws.accessKeyId) {
    console.warn('Warning: File upload is enabled but AWS credentials are not configured.');
  }

  // Email validation
  if (config.features.enableEmailNotifications && !config.email.smtp.user) {
    console.warn('Warning: Email notifications are enabled but SMTP is not configured.');
  }
};

// Environment helpers
export const isDevelopment = (): boolean => config.app.env === 'development';
export const isProduction = (): boolean => config.app.env === 'production';
export const isTest = (): boolean => config.app.env === 'test';

export default config;