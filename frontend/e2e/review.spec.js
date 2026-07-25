/**
 * Review session flow — flip a card, mark it, and requeue on "Don't Know It"
 * until the deck is finished. Creates its own deck/cards and cleans up after.
 */
import { test, expect } from '@playwright/test';
import { userState } from './helpers/auth.js';

test.use({ storageState: userState });

const DECK_NAME = `E2E review ${Date.now()}`;

async function addCard(page, front, back) {
  await page.locator('[data-test="add-card-button"]').click();
  await page.locator('[data-test="card-front-input"]').fill(front);
  await page.locator('[data-test="card-back-input"]').fill(back);
  await page.locator('[data-test="save-card"]').click();
  await expect(page.locator('[data-test="manage-card-row"]', { hasText: front })).toBeVisible();
}

test.describe('Review session', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('decks');
    await page.locator('[data-test="new-deck-button"]').click();
    await page.locator('[data-test="deck-name-input"]').fill(DECK_NAME);
    await page.locator('[data-test="submit-new-deck"]').click();
    await page.locator('[data-test="deck-row"]', { hasText: DECK_NAME }).locator('[data-test="deck-open"]').click();
    await addCard(page, '2 + 2', '4');
    await addCard(page, '3 + 3', '6');
  });

  test.afterEach(async ({ page }) => {
    await page.goto('decks');
    await page.locator('[data-test="deck-row"]', { hasText: DECK_NAME }).locator('[data-test="deck-open"]').click();
    await page.locator('[data-test="delete-deck-button"]').click();
    await page.locator('[data-test="deck-confirm-delete"]').click();
  });

  test('flip, mark, requeue on Don\'t Know It, and reach completion', async ({ page }) => {
    await page.goto('review');
    await page
      .locator('[data-test="deck-row"]', { hasText: DECK_NAME })
      .locator('[data-test="deck-open"]')
      .click();
    await expect(page).toHaveURL(/\/review\/.+/);

    // First card: flip and say "Don't Know It" — it should requeue.
    await page.locator('[data-test="review-card"]').click();
    await page.locator('[data-test="mark-dont-know"]').click();

    // Second card: flip and say "Know It".
    await page.locator('[data-test="review-card"]').click();
    await page.locator('[data-test="mark-know-it"]').click();

    // Requeued first card comes back around: flip and say "Know It" this time.
    await page.locator('[data-test="review-card"]').click();
    await page.locator('[data-test="mark-know-it"]').click();

    await expect(page.locator('[data-test="review-complete"]')).toBeVisible();
  });
});
