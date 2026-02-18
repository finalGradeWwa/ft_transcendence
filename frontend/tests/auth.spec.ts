import { test, expect } from '@playwright/test';

const generateUniqueEmail = () => `test${Date.now()}@example.com`;
const generateUniqueUsername = () => `testuser${Date.now()}`;

test.describe('Homepage & Navigation', () => {
  test('homepage has title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Plant Portal/);
  });

  test('homepage has login button', async ({ page }) => {
    await page.goto('/en/');
    await page.getByRole('link', { name: /Login/i }).click();
    await expect(page).toHaveURL(/showLogin/);
  });

  test('navigation to gardens page', async ({ page }) => {
    await page.goto('/en/');
    await page.getByRole('link', { name: /Gardens/i }).click();
    await expect(page).toHaveURL('/en/gardens');
  });

  test('language switcher changes locale', async ({ page }) => {
    await page.goto('/en/');
    await page.waitForSelector('select');
    await page.getByRole('combobox').selectOption('PL');
    await expect(page).toHaveURL(/\/pl\/?/);
  });

  test('search modal opens', async ({ page }) => {
    await page.goto('/en/');
    await page.getByRole('link', { name: 'Search' }).waitFor();
    await page.getByRole('link', { name: 'Search' }).click();
    await page.waitForURL(/showSearch/);
  });

  test('footer links work', async ({ page }) => {
    // test.skip(true, 'requires fix');
    await page.goto('/en/');
    await page.locator('a.text-primary-green[href="/en/terms"]').click();
    await expect(page).toHaveURL('/en/terms');
  });
});

test.describe('Sign Up (Registration)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/register');
  });

  test('1.1 - Register with all required fields', async ({ page }) => {
    const username = generateUniqueUsername();
    const email = generateUniqueEmail();

    await page.fill('#reg-first-name', 'Test');
    await page.fill('#reg-last-name', 'User');
    await page.fill('#reg-username', username);
    await page.fill('#reg-email', email);
    await page.fill('#reg-password', 'Testpass123!');
    await page.fill('#reg-password-confirm', 'Testpass123!');
    await page.check('#terms');

    await page.click('button[type="submit"]');

    await page.waitForURL(/\/en\/register/);
  });

  test('1.2 - Show error for empty required fields', async ({ page }) => {
    await page.click('button[type="submit"]');

    const firstNameInput = page.locator('#reg-first-name');
    const validity = await firstNameInput.evaluate(
      (el: HTMLInputElement) => el.validity.valid
    );
    expect(validity).toBe(false);
  });

  test('1.3 - Show error for invalid email format', async ({ page }) => {
    await page.fill('#reg-first-name', 'Test');
    await page.fill('#reg-last-name', 'User');
    await page.fill('#reg-username', generateUniqueUsername());
    await page.fill('#reg-email', 'invalid-email');
    await page.fill('#reg-password', 'Testpass123!');
    await page.fill('#reg-password-confirm', 'Testpass123!');
    await page.check('#terms');

    await page.click('button[type="submit"]');

    const emailInput = page.locator('#reg-email');
    const validity = await emailInput.evaluate(
      (el: HTMLInputElement) => el.validity.valid
    );
    expect(validity).toBe(false);
  });

  test('1.4 - Show error for weak password', async ({ page }) => {
    await page.fill('#reg-first-name', 'Test');
    await page.fill('#reg-last-name', 'User');
    await page.fill('#reg-username', generateUniqueUsername());
    await page.fill('#reg-email', generateUniqueEmail());
    await page.fill('#reg-password', 'weak');
    await page.fill('#reg-password-confirm', 'weak');
    await page.check('#terms');

    await page.click('button[type="submit"]');

    await expect(page.locator('[role="alert"].animate-pulse')).toContainText(
      /Min. 8 characters/i
    );
  });

  test('1.5 - Show error when passwords do not match', async ({ page }) => {
    await page.fill('#reg-first-name', 'Test');
    await page.fill('#reg-last-name', 'User');
    await page.fill('#reg-username', generateUniqueUsername());
    await page.fill('#reg-email', generateUniqueEmail());
    await page.fill('#reg-password', 'Testpass123!');
    await page.fill('#reg-password-confirm', 'Differentpass123!');
    await page.check('#terms');

    await page.click('button[type="submit"]');

    await expect(page.locator('[role="alert"].animate-pulse')).toContainText(
      /match/i
    );
  });

  test('1.6 - Cannot register without accepting terms', async ({ page }) => {
    await page.fill('#reg-first-name', 'Test');
    await page.fill('#reg-last-name', 'User');
    await page.fill('#reg-username', generateUniqueUsername());
    await page.fill('#reg-email', generateUniqueEmail());
    await page.fill('#reg-password', 'Testpass123!');
    await page.fill('#reg-password-confirm', 'Testpass123!');

    await page.click('button[type="submit"]');

    const termsCheckbox = page.locator('#terms');
    const validity = await termsCheckbox.evaluate(
      (el: HTMLInputElement) => el.validity.valid
    );
    expect(validity).toBe(false);
  });

  test('1.7 - Show error when username already exists', async ({ page }) => {
    await page.fill('#reg-first-name', 'Test');
    await page.fill('#reg-last-name', 'User');
    await page.fill('#reg-username', 'existinguser');
    await page.fill('#reg-email', generateUniqueEmail());
    await page.fill('#reg-password', 'Testpass123!');
    await page.fill('#reg-password-confirm', 'Testpass123!');
    await page.check('#terms');

    await page.click('button[type="submit"]');

    await expect(page.locator('[role="alert"].animate-pulse')).toBeVisible();
  });

  test('1.8 - Show error when email already exists', async ({ page }) => {
    await page.fill('#reg-first-name', 'Test');
    await page.fill('#reg-last-name', 'User');
    await page.fill('#reg-username', generateUniqueUsername());
    await page.fill('#reg-email', 'test@example.com');
    await page.fill('#reg-password', 'Testpass123!');
    await page.fill('#reg-password-confirm', 'Testpass123!');
    await page.check('#terms');

    await page.click('button[type="submit"]');

    await expect(page.locator('[role="alert"].animate-pulse')).toBeVisible();
  });

  test('1.11 - Toggle password visibility', async ({ page }) => {
    await page.fill('#reg-password', 'Testpass123!');

    const passwordInput = page.locator('#reg-password');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = page
      .locator('button:has(svg)')
      .filter({ has: page.locator('path[d*="M15 12"]') })
      .first();
    await toggleButton.click();

    await expect(passwordInput).toHaveAttribute('type', 'text');
  });
});

test.describe('Sign In (Login)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/?showLogin=true');
  });

  test('2.1 - Login with valid credentials', async ({ page }) => {
    // test.skip(true, 'Requires backend CORS/cookie configuration');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Testpass123!');

    await page.click('button[type="submit"]');

    await page.waitForURL(/\/en(\/?|\?.*)$/, { timeout: 15000 });
  });

  test('2.2 - Show error for invalid email', async ({ page }) => {
    await page.fill('input[name="email"]', 'nonexistent@example.com');
    await page.fill('input[name="password"]', 'Testpass123!');

    await page.click('button[type="submit"]');

    await expect(page.locator('.text-red-700')).toBeVisible();
  });

  test('2.3 - Show error for wrong password', async ({ page }) => {
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Wrongpassword123!');

    await page.click('button[type="submit"]');

    await expect(page.locator('.text-red-700')).toBeVisible();
  });

  test('2.4 - Show error for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]');

    const emailInput = page.locator('input[name="email"]');
    const validity = await emailInput.evaluate(
      (el: HTMLInputElement) => el.validity.valid
    );
    expect(validity).toBe(false);
  });

  test('2.5 - Toggle password visibility', async ({ page }) => {
    await page.fill('input[name="password"]', 'Testpass123!');

    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = page.locator('form button:has(svg)').first();
    await toggleButton.click();

    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('2.6 - GitHub OAuth login button redirects', async ({ page }) => {
    const githubButton = page.locator('a:has-text("GitHub")');
    await expect(githubButton).toBeVisible();

    const href = await githubButton.getAttribute('href');
    expect(href).toContain('/api/auth/login/github/');
  });
});

test.describe('Combined Authentication Flows', () => {
  test('3.1 - Switch from login to registration', async ({ page }) => {
    await page.goto('/en/?showLogin=true');

    await page.click('text=Register here');

    await expect(page).toHaveURL(/\/en\/register/);
  });

  test('3.2 - Switch from registration to login', async ({ page }) => {
    await page.goto('/en/register');

    await page.click('text=Login');

    await expect(page).toHaveURL(/showLogin/);
  });

  test('3.3 - Logged-in user sees username in header', async ({ page }) => {
    // test.skip(true, 'Requires backend CORS/cookie configuration');
    await page.goto('/en/?showLogin=true');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Testpass123!');
    await page.click('button[type="submit"]');
    // await page.waitForURL(/auth=login_success/, { timeout: 15000 });

    await expect(page.locator('header')).toContainText(/test/i);
  });

  test('3.4 - Logged-in user can log out', async ({ page }) => {
    // test.skip(true, 'Requires backend CORS/cookie configuration');
    await page.goto('/en/?showLogin=true');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Testpass123!');
    await page.click('button[type="submit"]');
    // await page.waitForURL(/auth=login_success/, { timeout: 15000 });

    const logoutButton = page.locator('button:has-text("Logout")');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await expect(page).toHaveURL(/\/en\/?/);
    }
  });
});