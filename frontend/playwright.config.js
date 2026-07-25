import { defineConfig, devices } from "@playwright/test";

// Full behavioral E2E (not just visual diffing) against a real, already-running
// bench site — the app needs live Frappe auth/API responses, not just static
// files, so this does NOT spin up its own server. Build the frontend
// (`yarn build`) and clear the bench cache first, with the site already
// running, then: yarn test:e2e
// Point at a different site with FLASHCARD_TEST_URL=http://host:port/flashcard
export default defineConfig({
	testDir: "./e2e",
	// Tests share site state (decks, cards) and clean up after themselves —
	// sequential run avoids cross-test interference.
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: 1,
	globalSetup: "./e2e/global-setup.js",
	reporter: [["list"], ["html", { open: "never" }]],
	use: {
		// Trailing slash matters: goto("decks") (no leading slash) resolves
		// relative to this. A leading slash in the spec would instead resolve
		// against the origin root and drop the /flashcard prefix entirely.
		baseURL: process.env.FLASHCARD_TEST_URL || "http://127.0.0.1:8005/flashcard/",
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
		video: "retain-on-failure",
		viewport: { width: 420, height: 900 },
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
});
