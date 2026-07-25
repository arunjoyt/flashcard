/**
 * Deck and card CRUD tests. Each test creates its own uniquely-named deck
 * and deletes it afterward so the site is left clean.
 */
import { test, expect } from '@playwright/test';
import { userState } from './helpers/auth.js';

test.use({ storageState: userState });

function uniqueDeckName(label) {
  return `E2E ${label} ${Date.now()}`;
}

async function createDeck(page, deckName) {
  await page.locator('[data-test="new-deck-button"]').click();
  await page.locator('[data-test="deck-name-input"]').fill(deckName);
  await page.locator('[data-test="submit-new-deck"]').click();
  await expect(page.locator('[data-test="deck-row"]', { hasText: deckName })).toBeVisible();
}

async function deleteDeck(page, deckName) {
  await page.locator('[data-test="deck-row"]', { hasText: deckName }).locator('[data-test="deck-open"]').click();
  await page.locator('[data-test="delete-deck-button"]').click();
  await page.locator('[data-test="deck-confirm-delete"]').click();
  await expect(page).toHaveURL(/\/decks$/);
}

test.describe('Decks', () => {
  test('create a deck and see it in the list', async ({ page }) => {
    const deckName = uniqueDeckName('create');
    await page.goto('decks');
    await createDeck(page, deckName);
    await deleteDeck(page, deckName);
  });

  test('add, edit, and delete a card in a deck', async ({ page }) => {
    const deckName = uniqueDeckName('cards');
    await page.goto('decks');
    await createDeck(page, deckName);

    await page.locator('[data-test="deck-row"]', { hasText: deckName }).locator('[data-test="deck-open"]').click();
    await expect(page).toHaveURL(/\/decks\/.+\/manage/);

    await page.locator('[data-test="add-card-button"]').click();
    await page.locator('[data-test="card-front-input"]').fill('Capital of France');
    await page.locator('[data-test="card-back-input"]').fill('Paris');
    await page.locator('[data-test="save-card"]').click();
    await expect(page.locator('[data-test="manage-card-row"]', { hasText: 'Capital of France' })).toBeVisible();

    await page.locator('[data-test="manage-card-row"]', { hasText: 'Capital of France' }).click();
    await page.locator('[data-test="card-back-input"]').fill('Paris, France');
    await page.locator('[data-test="save-card"]').click();
    await expect(page.locator('[data-test="manage-card-row"]', { hasText: 'Paris, France' })).toBeVisible();

    const row = page.locator('[data-test="manage-card-row"]', { hasText: 'Capital of France' });
    await row.locator('[data-test="card-delete"]').click();
    await row.locator('[data-test="card-confirm-delete"]').click();
    await expect(page.locator('[data-test="manage-card-row"]')).toHaveCount(0);

    await page.locator('[data-test="delete-deck-button"]').click();
    await page.locator('[data-test="deck-confirm-delete"]').click();
    await expect(page).toHaveURL(/\/decks$/);
  });
});
