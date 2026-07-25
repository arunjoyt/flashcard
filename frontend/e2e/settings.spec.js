import { test, expect } from '@playwright/test';
import { userState } from './helpers/auth.js';

test.use({ storageState: userState });

test.describe('Settings', () => {
  test('log out redirects to login', async ({ page }) => {
    await page.goto('settings');
    await page.locator('[data-test="logout-button"]').click();
    await expect(page).toHaveURL(/\/login/);
  });
});
