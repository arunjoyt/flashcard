import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_DIR = path.join(__dirname, '../.auth');

/** Pre-saved session state for the test user (created by global-setup.js). */
export const userState = path.join(AUTH_DIR, 'user.json');

/** Direct login via the Frappe login page — use for auth-flow tests only. */
export async function loginAs(page, email, password = 'Test@1234') {
  await page.goto('/login');
  await page.fill('#login_email', email);
  await page.fill('#login_password', password);
  await page.click('.btn-login');
  await page.waitForURL((url) => !url.href.includes('/login'), { timeout: 15_000 });
}
