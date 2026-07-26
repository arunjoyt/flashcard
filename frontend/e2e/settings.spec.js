/**
 * Logging out invalidates the session server-side, not just the local
 * cookie — so this test logs in fresh rather than reusing the shared
 * userState session, to avoid logging out every other spec file too.
 */
import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth.js';

test.describe('Settings', () => {
  test('log out redirects to login', async ({ page }) => {
    await loginAs(page, process.env.FLASHCARD_TEST_EMAIL || 'user@flashcard.test');
    await page.goto('settings');
    await page.locator('[data-test="logout-button"]').click();
    await expect(page).toHaveURL(/\/login/);
  });
});
