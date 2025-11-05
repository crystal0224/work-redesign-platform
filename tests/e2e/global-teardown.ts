import { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up E2E test environment...');

  try {
    // Clean up test database
    console.log('📊 Cleaning test database...');
    execSync('cd backend && npm run migrate:reset', { stdio: 'inherit' });
    console.log('✅ Test database cleaned');
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    // Don't throw error during cleanup
  }

  console.log('✅ E2E test environment cleanup complete');
}

export default globalTeardown;