import { chromium, FullConfig } from '@playwright/test';
import { execSync } from 'child_process';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up E2E test environment...');

  // Ensure database is ready and seeded with test data
  try {
    console.log('📊 Setting up test database...');
    execSync('cd backend && npm run migrate:deploy', { stdio: 'inherit' });
    execSync('cd backend && npm run seed:test', { stdio: 'inherit' });
    console.log('✅ Test database ready');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }

  // Create browser instance for auth setup
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to login page
    await page.goto('http://localhost:3000/auth/login');

    // Login with test admin user
    await page.fill('[data-testid="email-input"]', 'admin@sk.com');
    await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
    await page.click('[data-testid="login-button"]');

    // Wait for successful login
    await page.waitForURL('http://localhost:3000/dashboard');

    // Save authentication state
    await page.context().storageState({ path: 'tests/e2e/auth/admin-auth.json' });

    console.log('✅ Admin authentication state saved');

    // Create regular user auth state
    await page.goto('http://localhost:3000/auth/logout');
    await page.goto('http://localhost:3000/auth/login');

    await page.fill('[data-testid="email-input"]', 'user@sk.com');
    await page.fill('[data-testid="password-input"]', 'UserPassword123!');
    await page.click('[data-testid="login-button"]');

    await page.waitForURL('http://localhost:3000/dashboard');
    await page.context().storageState({ path: 'tests/e2e/auth/user-auth.json' });

    console.log('✅ User authentication state saved');
  } catch (error) {
    console.error('❌ Authentication setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log('✅ E2E test environment setup complete');
}

export default globalSetup;