/**
 * Regenerates the README screenshots in docs/images/.
 *
 * Runs against a real, already-running bench site (same requirement as the
 * Playwright e2e suite — see README's "UI (Playwright)" section): logs in as
 * the test user, builds a throwaway "Spanish Basics" demo deck, captures
 * each view, then deletes the deck so the site is left unchanged.
 *
 * Build the frontend first so the screenshots reflect current UI code:
 *   yarn build
 *   yarn screenshots
 *
 * Override target/credentials the same way the e2e suite does:
 *   FLASHCARD_TEST_URL, FLASHCARD_TEST_EMAIL, FLASHCARD_TEST_PASSWORD
 */
import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../../docs/images");

const TEST_URL = process.env.FLASHCARD_TEST_URL || "http://127.0.0.1:8005/flashcard/";
const BASE_URL = new URL(TEST_URL).origin;
const EMAIL = process.env.FLASHCARD_TEST_EMAIL || "user@flashcard.test";
const PASSWORD = process.env.FLASHCARD_TEST_PASSWORD || "Test@1234";

// Matches the shape of the pre-existing docs screenshots (front = English,
// back = Spanish) so a re-run doesn't change the deck's apparent content.
const DECK_NAME = "Spanish Basics";
const CARDS = [
	["Hello", "Hola"],
	["Thank you", "Gracias"],
	["Goodbye", "Adiós"],
	["Please", "Por favor"],
];

// Same crop as the committed docs/images/*.png files.
const VIEWPORT = { width: 606, height: 727 };

// Lets in-flight pop-in/flip CSS transitions (250-500ms) finish before capture.
const SETTLE_MS = 400;

async function shoot(page, name) {
	await page.waitForTimeout(SETTLE_MS);
	await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`) });
	console.log(`  saved ${name}.png`);
}

async function main() {
	fs.mkdirSync(OUT_DIR, { recursive: true });

	const browser = await chromium.launch();
	const page = await browser.newPage({ viewport: VIEWPORT });

	console.log(`Logging in as ${EMAIL} at ${BASE_URL} ...`);
	await page.goto(`${BASE_URL}/login`);
	await page.fill("#login_email", EMAIL);
	await page.fill("#login_password", PASSWORD);
	await page.click(".btn-login");
	await page.waitForURL((url) => !url.href.includes("/login"), { timeout: 15_000 });

	await page.goto(`${BASE_URL}/flashcard/decks`);

	// Idempotent: a leftover deck from an interrupted previous run would
	// otherwise get cards appended to it instead of a fresh set.
	const existing = page.locator('[data-test="deck-row"]', { hasText: DECK_NAME });
	if (await existing.count()) {
		console.log(`Removing leftover "${DECK_NAME}" deck from a previous run ...`);
		await existing.locator('[data-test="deck-open"]').click();
		await page.locator('[data-test="delete-deck-button"]').click();
		await page.locator('[data-test="deck-confirm-delete"]').click();
		await page.waitForURL(/\/decks$/);
	}

	console.log(`Creating demo deck "${DECK_NAME}" ...`);
	await page.locator('[data-test="new-deck-button"]').click();
	await page.locator('[data-test="deck-name-input"]').fill(DECK_NAME);
	await page.locator('[data-test="submit-new-deck"]').click();
	await page.locator('[data-test="deck-row"]', { hasText: DECK_NAME }).waitFor();

	await shoot(page, "decks");

	await page
		.locator('[data-test="deck-row"]', { hasText: DECK_NAME })
		.locator('[data-test="deck-open"]')
		.click();
	await page.waitForURL(/\/decks\/.+\/manage/);

	for (const [front, back] of CARDS) {
		await page.locator('[data-test="add-card-button"]').click();
		await page.locator('[data-test="card-front-input"]').fill(front);
		await page.locator('[data-test="card-back-input"]').fill(back);
		await page.locator('[data-test="save-card"]').click();
		await page.locator('[data-test="manage-card-row"]', { hasText: front }).waitFor();
	}

	await shoot(page, "manage-deck");

	await page.goto(`${BASE_URL}/flashcard/review`);
	await shoot(page, "review");

	await page
		.locator('[data-test="deck-row"]', { hasText: DECK_NAME })
		.locator('[data-test="deck-open"]')
		.click();
	await page.waitForURL(/\/review\/.+/);
	await shoot(page, "review-session-front");

	await page.locator('[data-test="review-card"]').click();
	await shoot(page, "review-session-back");

	await page.goto(`${BASE_URL}/flashcard/settings`);
	await shoot(page, "settings");

	console.log(`Deleting demo deck "${DECK_NAME}" ...`);
	await page.goto(`${BASE_URL}/flashcard/decks`);
	await page
		.locator('[data-test="deck-row"]', { hasText: DECK_NAME })
		.locator('[data-test="deck-open"]')
		.click();
	await page.locator('[data-test="delete-deck-button"]').click();
	await page.locator('[data-test="deck-confirm-delete"]').click();
	await page.waitForURL(/\/decks$/);

	await browser.close();
	console.log("Done.");
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
