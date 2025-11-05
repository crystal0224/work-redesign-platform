export default async function globalTeardown() {
  console.log('🧹 Cleaning up test environment...');

  // Stop test containers
  const postgresContainer = (global as any).__POSTGRES_CONTAINER__;
  const redisContainer = (global as any).__REDIS_CONTAINER__;

  if (postgresContainer) {
    await postgresContainer.stop();
    console.log('✅ PostgreSQL container stopped');
  }

  if (redisContainer) {
    await redisContainer.stop();
    console.log('✅ Redis container stopped');
  }

  console.log('✅ Test environment cleanup complete');
}