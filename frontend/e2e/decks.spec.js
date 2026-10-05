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

    const newRow = page.locator('[data-test="new-card-row"]');
    await newRow.locator('[data-test="card-front-cell"]').fill('Capital of France');
    await newRow.locator('[data-test="card-front-cell"]').press('Enter');
    await newRow.locator('[data-test="card-back-cell"]').fill('Paris');
    await newRow.locator('[data-test="card-back-cell"]').press('Enter');
    const row = page.locator('[data-test="manage-card-row"]').first();
    await expect(row.locator('[data-test="card-front-cell"]')).toHaveValue('Capital of France');
    await expect(newRow.locator('[data-test="card-front-cell"]')).toBeFocused();

    await row.locator('[data-test="card-back-cell"]').fill('Paris, France');
    await row.locator('[data-test="card-back-cell"]').press('Enter');
    await expect(row.locator('[data-test="row-saved"]')).toBeVisible();
    await page.reload();
    await expect(page.locator('[data-test="manage-card-row"] [data-test="card-back-cell"]')).toHaveValue('Paris, France');

    await row.locator('[data-test="card-delete"]').click();
    await row.locator('[data-test="card-confirm-delete"]').click();
    await expect(page.locator('[data-test="manage-card-row"]')).toHaveCount(0);

    await page.locator('[data-test="delete-deck-button"]').click();
    await page.locator('[data-test="deck-confirm-delete"]').click();
    await expect(page).toHaveURL(/\/decks$/);
  });

  test('bulk add cards by pasting comma-separated lines', async ({ page }) => {
    const deckName = uniqueDeckName('bulk');
    await page.goto('decks');
    await createDeck(page, deckName);
    await page.locator('[data-test="deck-row"]', { hasText: deckName }).locator('[data-test="deck-open"]').click();

    await page.locator('[data-test="bulk-add-button"]').click();
    const input = page.locator('[data-test="bulk-add-input"]');
    await input.fill('apple, a fruit, usually red\n"Paris, France", capital city');
    await expect(page.locator('[data-test="bulk-add-line-error"]')).toHaveCount(1);
    await expect(page.locator('[data-test="bulk-add-submit"]')).toBeDisabled();

    await input.fill('apple, "a fruit, usually red"\n"Paris, France", capital city');
    await expect(page.locator('[data-test="bulk-add-line-error"]')).toHaveCount(0);
    await page.locator('[data-test="bulk-add-submit"]').click();

    const fronts = page.locator('[data-test="manage-card-row"] [data-test="card-front-cell"]');
    await expect(fronts).toHaveCount(2);
    await expect(fronts.nth(1)).toHaveValue('Paris, France');
    await expect(page.locator('[data-test="manage-card-row"] [data-test="card-back-cell"]').first()).toHaveValue('a fruit, usually red');

    await page.locator('[data-test="delete-deck-button"]').click();
    await page.locator('[data-test="deck-confirm-delete"]').click();
    await expect(page).toHaveURL(/\/decks$/);
  });

  test('rename a deck', async ({ page }) => {
    const deckName = uniqueDeckName('rename');
    const renamedName = uniqueDeckName('renamed');
    await page.goto('decks');
    await createDeck(page, deckName);

    await page.locator('[data-test="deck-row"]', { hasText: deckName }).locator('[data-test="deck-open"]').click();
    await expect(page).toHaveURL(/\/decks\/.+\/manage/);
    await expect(page.getByText(`Manage "${deckName}"`)).toBeVisible();

    await page.locator('[data-test="rename-deck-button"]').click();
    await page.locator('[data-test="rename-deck-input"]').fill(renamedName);
    await page.locator('[data-test="save-deck-name"]').click();
    await expect(page.getByText(`Manage "${renamedName}"`)).toBeVisible();

    await page.locator('[data-test="manage-back"]').click();
    await expect(page.locator('[data-test="deck-row"]', { hasText: renamedName })).toBeVisible();

    await deleteDeck(page, renamedName);
  });
});
