/**
 * Review session flow — flip a card and move between cards with Prev / Next.
 * Creates its own deck/cards and cleans up after.
 */
import { test, expect } from '@playwright/test';
import { userState } from './helpers/auth.js';

test.use({ storageState: userState });

const DECK_NAME = `E2E review ${Date.now()}`;

async function addCard(page, front, back) {
  const newRow = page.locator('[data-test="new-card-row"]');
  await newRow.locator('[data-test="card-front-cell"]').fill(front);
  await newRow.locator('[data-test="card-front-cell"]').press('Enter');
  await newRow.locator('[data-test="card-back-cell"]').fill(back);
  await newRow.locator('[data-test="card-back-cell"]').press('Enter');
  await expect(page.locator('[data-test="manage-card-row"] [data-test="card-front-cell"]').last()).toHaveValue(front);
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
    // The deck now has cards, so deck-open would start a Review Session — use the manage icon instead.
    await page.locator('[data-test="deck-row"]', { hasText: DECK_NAME }).locator('[data-test="deck-manage"]').click();
    await page.locator('[data-test="delete-deck-button"]').click();
    await page.locator('[data-test="deck-confirm-delete"]').click();
  });

  test('flip and navigate with Prev / Next', async ({ page }) => {
    await page.goto('decks');
    await page
      .locator('[data-test="deck-row"]', { hasText: DECK_NAME })
      .locator('[data-test="deck-open"]')
      .click();
    await expect(page).toHaveURL(/\/review\/.+/);

    const card = page.locator('[data-test="review-card"]');
    const position = page.locator('[data-test="card-position"]');
    const prev = page.locator('[data-test="card-prev"]');
    const next = page.locator('[data-test="card-next"]');

    await expect(position).toHaveText('1/2');
    await expect(prev).toBeDisabled();

    await page.locator('[data-test="card-flip"]').click();
    await expect(card).toHaveClass(/is-flipped/);

    await next.click();
    await expect(position).toHaveText('2/2');
    await expect(card).not.toHaveClass(/is-flipped/);
    await expect(next).toBeDisabled();

    await prev.click();
    await expect(position).toHaveText('1/2');
  });
});
