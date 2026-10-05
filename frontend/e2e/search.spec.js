/**
 * Search flow — find a card across decks, open it in Manage Deck, and come back
 * to the same results. Creates its own deck and cleans up after.
 */
import { test, expect } from '@playwright/test';
import { userState } from './helpers/auth.js';

test.use({ storageState: userState });

test('search finds a card, opens it in Manage Deck, and Back keeps the search', async ({ page }) => {
  const deckName = `E2E search ${Date.now()}`;
  const marker = `zq${Date.now()}`;
  await page.goto('decks');
  await page.locator('[data-test="new-deck-button"]').click();
  await page.locator('[data-test="deck-name-input"]').fill(deckName);
  await page.locator('[data-test="submit-new-deck"]').click();
  await page.locator('[data-test="deck-row"]', { hasText: deckName }).locator('[data-test="deck-open"]').click();

  await page.locator('[data-test="bulk-add-button"]').click();
  await page.locator('[data-test="bulk-add-input"]').fill(`Adiós ${marker}, goodbye\nHola, hello ${marker}\nGracias, thanks`);
  await page.locator('[data-test="bulk-add-submit"]').click();
  await expect(page.locator('[data-test="manage-card-row"]')).toHaveCount(3);
  await page.locator('[data-test="manage-back"]').click();

  await page.locator('[data-test="search-input"]').fill(`adios ${marker}`);
  await expect(page).toHaveURL(new RegExp(`q=adios`));
  const results = page.locator('[data-test="search-result"]');
  await expect(results).toHaveCount(1);
  await expect(results.first()).toContainText('Adiós');

  await page.locator('[data-test="search-input"]').fill(marker);
  await expect(results).toHaveCount(2);

  await results.nth(1).click();
  await expect(page).toHaveURL(/\/decks\/.+\/manage/);
  await expect(page.locator('[data-test="manage-card-row"]').nth(1)).toHaveClass(/bg-grape-100/);

  await page.locator('[data-test="manage-back"]').click();
  await expect(page.locator('[data-test="search-input"]')).toHaveValue(marker);
  await expect(results).toHaveCount(2);

  await page.goBack();
  await page.goBack();
  await expect(page.locator('[data-test="search-input"]')).toHaveValue(marker);

  await page.locator('[data-test="search-clear"]').click();
  await expect(page.locator('[data-test="deck-row"]', { hasText: deckName })).toBeVisible();
  await page.locator('[data-test="deck-row"]', { hasText: deckName }).locator('[data-test="deck-manage"]').click();
  await page.locator('[data-test="delete-deck-button"]').click();
  await page.locator('[data-test="deck-confirm-delete"]').click();
  await expect(page).toHaveURL(/\/decks$/);
});
