# Flashcard

A simple, single-user flashcard app for reviewing self-authored front/back cards, organized into decks, built on [Frappe](https://frappeframework.com).

## Features

- **Decks** — named collections of Cards on one topic; create, rename via cards, and delete (deleting cascades to all its Cards, after confirmation)
- **Cards** — simple front/back pairs of plain text, managed from the deck's Manage screen
- **Review Session** — a shuffled flip-through of one deck's Cards; flip each card to reveal its answer, then mark Know It or Don't Know It — a Don't Know It card is requeued to reappear later in the same session. No spaced-repetition scheduling
- **Single-page UI** — all views load at `/flashcard`; three bottom tabs (Decks, Review, Settings) with instant navigation and no page reloads

## User Roles

| Role | Access |
|---|---|
| **Flashcard User** | Create, edit, and delete their own Decks and Cards; run Review Sessions |

Single-user app — no sharing, no per-Family or per-account permission model. Admin sets up accounts through Frappe Desk; there's no self-service signup.

## Admin Setup (one-time per user)

1. In Frappe Desk → create a User account, set **User Type = Website User**
2. Assign the **Flashcard User** role — without it, they can create an account but can't create or manage Decks/Cards
3. The user can now log in at the site URL and land on the Review tab

## Installation

You can install this app using the [bench](https://github.com/frappe/bench) CLI:

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app $URL_OF_THIS_REPO --branch develop
bench install-app flashcard
```

## Testing

### Backend (Python)

Tests run against a Frappe site. Enable tests on the site once, then run any time:

```bash
bench --site <your-site> set-config allow_tests true   # one-time
bench --site <your-site> run-tests --app flashcard
```

Covers Deck/Card validation and lifecycle (cascading delete, blank-field rejection, whitespace stripping), and the Frappe Desk Workspace (existence, and that its DocType shortcuts resolve).

### Frontend Unit Tests (Vitest)

```bash
cd frontend
yarn test
```

### UI (Playwright)

Full behavioral end-to-end tests run against a real, already-running bench site (the app needs live Frappe auth/API responses, not just static files). Build the frontend and clear the cache first:

```bash
# from apps/flashcard/frontend
yarn build

# from the bench root, with $SITE already running
bench --site $SITE clear-cache
```

The suite logs in once as a test user and saves the session to `frontend/e2e/.auth/` so individual specs skip the login step — create a Website User with the **Flashcard User** role for this on your site first (e.g. `user@flashcard.test` / `Test@1234`, matching the defaults below), or point at your own via env vars.

```bash
# back in apps/flashcard/frontend
yarn test:e2e              # headless (CI-friendly)
yarn test:e2e:headed       # watch it in a real browser window
yarn test:e2e:report       # open the HTML report from the last run
```

By default it targets `http://127.0.0.1:8005/flashcard/` and logs in as `user@flashcard.test`; override with `FLASHCARD_TEST_URL`, `FLASHCARD_TEST_EMAIL`, and `FLASHCARD_TEST_PASSWORD`.

Covers deck creation/deletion, card CRUD within a deck, the review session flow (flip, Know It / Don't Know It, requeue, completion screen), and logout — each test creates its own uniquely-named deck and cleans up afterward so the site is left unchanged.

> **Note:** `frontend/e2e/.auth/` and `frontend/e2e/report/` are gitignored — they contain live session tokens and generated artifacts. These tests are a **local dev tool only** — not run in CI.

## Contributing

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

## CI

This app can use GitHub Actions for CI. The following workflows are configured:

- CI: Installs this app, runs backend and frontend unit tests, and builds the frontend on every push to `develop` branch.
- Linters: Runs [Frappe Semgrep Rules](https://github.com/frappe/semgrep-rules) and [pip-audit](https://pypi.org/project/pip-audit/) on every pull request.

## License

MIT
