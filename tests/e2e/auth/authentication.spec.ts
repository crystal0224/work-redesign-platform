import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/auth/login');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('[data-testid="email-input"]', 'admin@sk.com');
    await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Welcome back')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('[data-testid="email-input"]', 'invalid@sk.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL('/auth/login');
  });

  test('should register new user successfully', async ({ page }) => {
    await page.goto('/auth/register');

    await page.fill('[data-testid="email-input"]', 'newuser@sk.com');
    await page.fill('[data-testid="password-input"]', 'NewUser123!');
    await page.fill('[data-testid="confirm-password-input"]', 'NewUser123!');
    await page.fill('[data-testid="name-input"]', 'New User');
    await page.selectOption('[data-testid="department-select"]', 'IT');
    await page.fill('[data-testid="position-input"]', 'Developer');

    await page.click('[data-testid="register-button"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Registration successful')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'admin@sk.com');
    await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL('/dashboard');

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    await expect(page).toHaveURL('/auth/login');
    await expect(page.getByText('Logged out successfully')).toBeVisible();
  });

  test('should maintain session across browser refresh', async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.fill('[data-testid="email-input"]', 'admin@sk.com');
    await page.fill('[data-testid="password-input"]', 'AdminPassword123!');
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL('/dashboard');

    // Refresh browser
    await page.reload();

    // Should still be logged in
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Welcome back')).toBeVisible();
  });

  test('should validate email domain restriction', async ({ page }) => {
    await page.goto('/auth/register');

    await page.fill('[data-testid="email-input"]', 'user@gmail.com');
    await page.fill('[data-testid="password-input"]', 'Password123!');
    await page.fill('[data-testid="confirm-password-input"]', 'Password123!');
    await page.fill('[data-testid="name-input"]', 'Test User');

    await page.click('[data-testid="register-button"]');

    await expect(page.getByText('Only SK Group email addresses are allowed')).toBeVisible();
    await expect(page).toHaveURL('/auth/register');
  });

  test('should validate password strength', async ({ page }) => {
    await page.goto('/auth/register');

    await page.fill('[data-testid="email-input"]', 'user@sk.com');
    await page.fill('[data-testid="password-input"]', '123'); // Weak password
    await page.fill('[data-testid="name-input"]', 'Test User');

    await page.click('[data-testid="register-button"]');

    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
  });

  test('should handle rate limiting', async ({ page }) => {
    await page.goto('/auth/login');

    // Attempt multiple failed logins
    for (let i = 0; i < 6; i++) {
      await page.fill('[data-testid="email-input"]', 'admin@sk.com');
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');

      if (i < 5) {
        await expect(page.getByText('Invalid credentials')).toBeVisible();
      }
    }

    // Should be rate limited
    await expect(page.getByText('Too many attempts')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeDisabled();
  });
});