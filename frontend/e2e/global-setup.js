/**
 * Global setup — runs once before all UI tests.
 * Logs in as the test user and saves the session cookies so
 * individual specs can skip the login step entirely.
 */
import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Must derive from the same env var as playwright.config.js's baseURL — the
// storage state we save is scoped to this origin, so logging into 127.0.0.1
// while tests run against a different host (e.g. FLASHCARD_TEST_URL pointing
// at a shared test site) would silently produce a session that never applies.
const TEST_URL = process.env.FLASHCARD_TEST_URL || 'http://127.0.0.1:8005/flashcard/';
const BASE_URL = new URL(TEST_URL).origin;
const AUTH_DIR = path.join(__dirname, '.auth');

const EMAIL = process.env.FLASHCARD_TEST_EMAIL || 'user@flashcard.test';
const PASSWORD = process.env.FLASHCARD_TEST_PASSWORD || 'Test@1234';

export default async function globalSetup() {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  await page.goto(`${BASE_URL}/login`);
  await page.fill('#login_email', EMAIL);
  await page.fill('#login_password', PASSWORD);
  await page.click('.btn-login');
  await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 15_000 });

  await ctx.storageState({ path: path.join(AUTH_DIR, 'user.json') });
  await ctx.close();
  console.log(`  saved auth state: user (${EMAIL})`);
  await browser.close();
}
