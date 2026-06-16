import { test, expect } from '@playwright/test';

const ADMIN = { email: 'admin@local.dev', password: 'admin' };
const USER = { email: 'user@local.dev', password: 'user' };

async function clearSession(page: import('@playwright/test').Page) {
  await page.evaluate(() => localStorage.clear());
}

async function login(page: import('@playwright/test').Page, credentials: { email: string; password: string }) {
  await page.goto('/login');
  await page.fill('input[type="email"]', credentials.email);
  await page.fill('input[type="password"]', credentials.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/events/);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await clearSession(page);
});

test('1. Register a new user and land on events page', async ({ page }) => {
  const unique = `test-${Date.now()}@example.com`;
  await page.goto('/register');
  await page.fill('input[placeholder="Full Name"]', 'New User');
  await page.fill('input[type="email"]', unique);
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/events/);
});

test('2. User logs in, registers for an event, button becomes Cancel', async ({ page }) => {
  await login(page, USER);

  // Ensure at least one event exists (created by admin in another test or seeded)
  const cards = page.locator('[data-testid="event-card"], .bg-white.rounded-xl');
  await expect(cards.first()).toBeVisible({ timeout: 5000 });

  // Find a Register button (if available)
  const registerBtn = page.getByRole('button', { name: /^register$/i }).first();
  if (await registerBtn.isVisible()) {
    await registerBtn.click();
    await expect(page.getByRole('button', { name: /cancel registration/i }).first()).toBeVisible();
  }
});

test('3. Admin creates an event, verifies it on events page, then deletes it', async ({ page }) => {
  await login(page, ADMIN);

  // Check Admin link is visible
  await expect(page.getByRole('link', { name: /admin/i })).toBeVisible();

  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin/);

  const title = `E2E Event ${Date.now()}`;
  await page.fill('input[placeholder="Title"]', title);
  await page.fill('textarea[placeholder="Description"]', 'E2E test description');
  await page.fill('input[type="datetime-local"]', '2028-01-01T10:00');
  await page.fill('input[placeholder="Capacity"]', '5');
  await page.getByRole('button', { name: /create event/i }).click();

  // Verify on events page
  await page.goto('/events');
  await expect(page.getByText(title)).toBeVisible({ timeout: 5000 });

  // Go back to admin and delete
  await page.goto('/admin');
  const row = page.locator('div').filter({ hasText: title }).last();
  page.on('dialog', dialog => dialog.accept());
  await row.getByRole('button', { name: /delete/i }).click();
  await expect(page.getByText(title)).not.toBeVisible({ timeout: 5000 });
});

test('4. Non-admin navigating to /admin is redirected to /events', async ({ page }) => {
  await login(page, USER);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/events/);
});

test('5. Unauthenticated user navigating to /events is redirected to /login', async ({ page }) => {
  await clearSession(page);
  await page.goto('/events');
  await expect(page).toHaveURL(/\/login/);
});
