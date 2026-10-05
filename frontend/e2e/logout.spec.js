/**
 * Logging out invalidates the session server-side, not just the local
 * cookie — so this test logs in fresh rather than reusing the shared
 * userState session, to avoid logging out every other spec file too.
 */
import { test, expect } from '@playwright/test';
import { loginAs } from './helpers/auth.js';

test.describe('Log out', () => {
  test('the Decks header shows the user and Log out redirects to login', async ({ page }) => {
    await loginAs(page, process.env.FLASHCARD_TEST_EMAIL || 'user@flashcard.test');
    await page.goto('decks');
    await expect(page.locator('[data-test="user-name"]')).not.toBeEmpty();
    await expect(page.locator('[data-test="bottom-nav-tab"]')).toHaveCount(0);
    await page.locator('[data-test="logout-button"]').click();
    await expect(page).toHaveURL(/\/login/);
  });
});
