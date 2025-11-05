import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { execSync } from 'child_process';
import { join } from 'path';

export default async function globalSetup() {
  console.log('🚀 Setting up test environment...');

  // Start PostgreSQL test container
  const postgres = await new GenericContainer('postgres:15-alpine')
    .withEnvironment({
      POSTGRES_DB: 'work_redesign_test',
      POSTGRES_USER: 'test_user',
      POSTGRES_PASSWORD: 'test_password',
    })
    .withExposedPorts(5432)
    .start();

  // Start Redis test container
  const redis = await new GenericContainer('redis:7-alpine')
    .withExposedPorts(6379)
    .start();

  // Store container information for tests
  process.env.TEST_DATABASE_URL = `postgresql://test_user:test_password@localhost:${postgres.getMappedPort(5432)}/work_redesign_test`;
  process.env.TEST_REDIS_URL = `redis://localhost:${redis.getMappedPort(6379)}`;

  // Store container references for cleanup
  (global as any).__POSTGRES_CONTAINER__ = postgres;
  (global as any).__REDIS_CONTAINER__ = redis;

  // Run database migrations
  console.log('📊 Running database migrations...');
  try {
    execSync('npm run migrate:test', {
      cwd: join(__dirname, '..'),
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: process.env.TEST_DATABASE_URL,
      },
    });
    console.log('✅ Database migrations completed');
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    throw error;
  }

  console.log('✅ Test environment setup complete');
}