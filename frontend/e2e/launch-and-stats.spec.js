/**
 * Launch auto-starts a Review Session for All Cards, and finishing/exiting
 * one records that day's Cards Viewed count on the Stats calendar.
 * Creates its own deck/card and cleans up after.
 */
import { test, expect } from '@playwright/test';
import { userState } from './helpers/auth.js';

test.use({ storageState: userState });

const DECK_NAME = `E2E launch ${Date.now()}`;

test.describe('Launch and Stats', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('decks');
    await page.locator('[data-test="new-deck-button"]').click();
    await page.locator('[data-test="deck-name-input"]').fill(DECK_NAME);
    await page.locator('[data-test="submit-new-deck"]').click();
    await page.locator('[data-test="deck-row"]', { hasText: DECK_NAME }).locator('[data-test="deck-open"]').click();
    await page.locator('[data-test="add-card-button"]').click();
    await page.locator('[data-test="card-front-input"]').fill('2 + 2');
    await page.locator('[data-test="card-back-input"]').fill('4');
    await page.locator('[data-test="save-card"]').click();
    await expect(page.locator('[data-test="manage-card-row"]')).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    await page.goto('decks');
    await page.locator('[data-test="deck-row"]', { hasText: DECK_NAME }).locator('[data-test="deck-manage"]').click();
    await page.locator('[data-test="delete-deck-button"]').click();
    await page.locator('[data-test="deck-confirm-delete"]').click();
  });

  test('launching the app starts an All Cards Review Session, and finishing it records a Stats entry for today', async ({ page }) => {
    await page.goto('');
    await expect(page).toHaveURL(/\/review$/);
    await expect(page.locator('[data-test="review-card"]')).toBeVisible();

    await page.locator('[data-test="review-card"]').click();
    await page.locator('[data-test="mark-know-it"]').click();
    await expect(page.locator('[data-test="review-complete"]')).toBeVisible();
    await page.getByRole('button', { name: 'Back to Decks' }).click();
    await expect(page).toHaveURL(/\/decks$/);

    await page.goto('stats');
    await expect(page.locator('[data-test="stats-today-cell"]')).toContainText(/[1-9]\d*/);
  });
});
