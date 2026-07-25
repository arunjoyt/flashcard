### Flashcard

A simple flashcard app

### Installation

You can install this app using the [bench](https://github.com/frappe/bench) CLI:

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app $URL_OF_THIS_REPO --branch develop
bench install-app flashcard
```

### Testing

#### Frontend unit tests (Vitest)

```bash
cd frontend
yarn test
```

#### UI (Playwright)

Full behavioral end-to-end tests run against a real, already-running bench site (the app needs live Frappe auth/API responses, not just static files). Build the frontend and clear the cache first:

```bash
# from apps/flashcard/frontend
yarn build

# from the bench root, with $SITE already running
bench --site $SITE clear-cache
```

The suite logs in once as a test user and saves the session to `frontend/e2e/.auth/` so individual specs skip the login step — create a Website User for this on your site first (e.g. `user@flashcard.test` / `Test@1234`, matching the defaults below), or point at your own via env vars.

```bash
# back in apps/flashcard/frontend
yarn test:e2e              # headless (CI-friendly)
yarn test:e2e:headed       # watch it in a real browser window
yarn test:e2e:report       # open the HTML report from the last run
```

By default it targets `http://127.0.0.1:8005/flashcard/` and logs in as `user@flashcard.test`; override with `FLASHCARD_TEST_URL`, `FLASHCARD_TEST_EMAIL`, and `FLASHCARD_TEST_PASSWORD`.

Covers deck creation/deletion, card CRUD within a deck, the review session flow (flip, Know It / Don't Know It, requeue, completion screen), and logout — each test creates its own uniquely-named deck and cleans up afterward so the site is left unchanged.

> **Note:** `frontend/e2e/.auth/` and `frontend/e2e/report/` are gitignored — they contain live session tokens and generated artifacts. These tests are a **local dev tool only** — not run in CI.

### Contributing

This app uses `pre-commit` for code formatting and linting. Please [install pre-commit](https://pre-commit.com/#installation) and enable it for this repository:

```bash
cd apps/flashcard
pre-commit install
```

Pre-commit is configured to use the following tools for checking and formatting your code:

- ruff
- eslint
- prettier
- pyupgrade

### CI

This app can use GitHub Actions for CI. The following workflows are configured:

- CI: Installs this app and runs unit tests on every push to `develop` branch.
- Linters: Runs [Frappe Semgrep Rules](https://github.com/frappe/semgrep-rules) and [pip-audit](https://pypi.org/project/pip-audit/) on every pull request.


### License

mit
