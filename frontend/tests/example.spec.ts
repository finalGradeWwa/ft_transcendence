import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Plant Portal/);
});

test('homepage has login button', async ({ page }) => {
  await page.goto('/en/');

  // Click the login link
  await page.getByRole('link', { name: /Login/i }).click();

  // Expects the URL to contain showLogin.
  await expect(page).toHaveURL(/showLogin/);
});

test('navigation to gardens page', async ({ page }) => {
  await page.goto('/en/');

  // Click the Gardens link in navigation
  await page.getByRole('link', { name: /Gardens/i }).click();

  // Expects the URL to be /en/gardens
  await expect(page).toHaveURL('/en/gardens');
});

test('language switcher changes locale', async ({ page }) => {
  await page.goto('/en/');

  // Wait for the language select to be visible
  await page.waitForSelector('select');

  // Select Polish from the language switcher
  await page.getByRole('combobox').selectOption('PL');

  // Expects the URL to change to /pl/
  await expect(page).toHaveURL(/\/pl\/?/);
});

test('search modal opens', async ({ page }) => {
  await page.goto('/en/');

  // Wait for the search link to be visible
  await page.getByRole('link', { name: 'Search' }).waitFor();

  // Click the Search link
  await page.getByRole('link', { name: 'Search' }).click();

  // Wait for URL to change
  await page.waitForURL(/showSearch/);

  // Expects the URL to contain showSearch
  await expect(page).toHaveURL(/showSearch/);
});

test('footer links work', async ({ page }) => {
  await page.goto('/en/');

  // Click the Terms link in footer
  await page.getByRole('link', { name: /Terms/i }).click();

  // Expects the URL to be /en/terms
  await expect(page).toHaveURL('/en/terms');
});

test('user registration', async ({ page }) => {
  await page.goto('/en/');

  // Click the login link
  await page.getByRole('link', { name: /Login/i }).click();

  // Click the register link in the modal
  await page.getByRole('link', { name: /Register here/i }).click();

  // Fill the registration form
  await page.locator('#reg-username').fill('testuser');
  await page.locator('#reg-email').fill('test@example.com');
  await page.locator('#reg-password').fill('Testpass123!');
  await page.locator('#reg-password-confirm').fill('Testpass123!');

  // Submit the form
  await page.getByRole('button', { name: /Register/i }).click();

  // Expects to stay on register page or check for success message
  await expect(page).toHaveURL('/en/register');
});

test('user login', async ({ page }) => {
  await page.goto('/en/');

  const loginLink = page.getByRole('link', { name: /Login/i });

  // Ensure the login link is ready, then open the modal
  await loginLink.waitFor({ state: 'visible' });
  await loginLink.click();

  // Wait for the modal-triggering query param to appear
  await page.waitForURL(/showLogin=true/);

  const emailInput = page.locator('input[name="email"]');
  const passwordInput = page.locator('input[name="password"]');

  // Fill in credentials
  await emailInput.waitFor({ state: 'visible' });
  await emailInput.fill('test@example.com');
  await passwordInput.fill('Testpass123!');

  await page.getByRole('button', { name: /^Login$/i }).click();

  // Successful login redirects with auth param
  await page.waitForURL(/auth=login_success/);
  await expect(page).toHaveURL(/auth=login_success/);
});