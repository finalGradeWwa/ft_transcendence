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

  // Select Polish from the language switcher
  await page.getByRole('combobox', { name: /Select language/i }).selectOption('pl');

  // Expects the URL to change to /pl/
  await expect(page).toHaveURL('/pl/');
});

// test('search modal opens', async ({ page }) => {
//   await page.goto('/en/');

//   // Click the Search link
//   await page.getByRole('link', { name: /Search/i }).click();

//   // Expects the URL to contain showSearch
//   await expect(page).toHaveURL(/showSearch/);
// });

test('footer links work', async ({ page }) => {
  await page.goto('/en/');

  // Click the Terms link in footer
  await page.getByRole('link', { name: /Terms/i }).click();

  // Expects the URL to be /en/terms
  await expect(page).toHaveURL('/en/terms');
});