---
name: frontend-e2e
description: Write and run browser end-to-end tests for apps/web with Playwright — Page Object Model, role/text locators, web-first assertions, visual regression with toHaveScreenshot, and a stub API for Server Component data. Use when adding e2e coverage for a web user journey, adding visual-regression baselines, or debugging the web-e2e suite.
allowed-tools: Bash(pnpm run e2e), Bash(pnpm nx run web-e2e:e2e), Bash(pnpm exec playwright*), Bash(pnpm nx build web*)
---

# Frontend E2E (Playwright)

The e2e suite lives in `apps/web-e2e/` and runs against a production build of
`apps/web`. Run it with `pnpm run e2e` (builds web first, then runs Playwright).

## Layout

```txt
apps/web-e2e/
  playwright.config.ts          # web + stub servers, projects, reporters
  src/<journey>.spec.ts         # tests (testMatch: **/*.spec.ts)
  src/pages/<page>.page.ts       # Page Objects (locators + actions)
  src/support/stub-core-api.mjs  # deterministic stand-in for core-api
```

## The server is the test boundary (App Router)

`apps/web` pages are Server Components that read core-api **server-side** at request
time, so browser request mocking (`page.route`) cannot intercept that data. Instead
the Playwright config starts a tiny stub HTTP server and points the web server at it
via `CORE_API_URL`/`CORE_API_TOKEN`. This exercises the real RSC → Zod validation →
mapper → view pipeline with deterministic data and no database. Extend
`src/support/stub-core-api.mjs` (keep its responses matching the published contract
in `contracts/openapi/**`) rather than mocking in the browser.

## Writing tests

- **Page Object Model**: put locators and actions in a `*.page.ts`; keep specs
  about behavior. See `src/pages/appointments.page.ts`.
- **Locators**: prefer `getByRole`, `getByText`, `getByLabel` — what a user
  perceives. Never select by CSS class or Tailwind utility (markup churns).
- **Web-first assertions**: use `await expect(locator).toBeVisible()` /
  `toHaveText()` — they auto-wait and retry. Never use `waitForTimeout`/hard sleeps.
- Keep tests independent and idempotent; each navigates fresh.

## Running

- `pnpm run e2e` — full suite (chromium + webkit), CI-equivalent.
- `pnpm exec playwright test --project=chromium` (from `apps/web-e2e`) — fast local
  loop on one browser.
- First run on a fresh machine needs browsers: `pnpm exec playwright install
  --with-deps chromium webkit` (the `--with-deps` part installs OS libraries and may
  require root; CI does this automatically).
- Debug a failure with the trace: `pnpm exec playwright show-trace <trace.zip>`
  (traces are captured `on-first-retry`).

## Watch it run (visual)

Installing browsers is a one-time machine setup, separate from "using this skill" —
whoever *runs* the tests needs them. Once installed (with `--with-deps`; on WSL,
WSLg renders real windows), you can see the run, not just the result. From
`apps/web-e2e`:

- `pnpm exec playwright test --ui` — interactive UI mode: pick tests, watch each
  step, time-travel the DOM, re-run on change. Best for developing a test.
- `pnpm exec playwright test --headed --project=chromium` — run with a visible
  browser window.
- `pnpm exec playwright test --debug` — step through with the Playwright Inspector.
- `pnpm exec playwright show-report` — open the HTML report after a run.

CI always runs headless; these modes are for local development only.

## Visual regression (`toHaveScreenshot`)

Playwright compares the live page against a committed baseline PNG, pixel-by-pixel
(`pixelmatch`), after auto-waiting for the page to stabilize (no network, no
animations, no running JS). Our stub-driven RSC pipeline makes this reliable: the
data is deterministic, so a diff means the **UI** changed, not the data.

- Assert on a **specific element** for component-level checks; reserve full-page
  shots for a few critical flows:
  `await expect(page.getByRole('table')).toHaveScreenshot('appointments-table.png')`.
- **Baselines must be generated in the CI environment**, never on WSL/local — fonts
  and anti-aliasing differ and would produce false diffs. Update them via the CI job
  (or the same Docker image CI uses) with `--update-snapshots`, then commit the PNGs
  under `*.spec.ts-snapshots/`. A baseline regenerated on a developer machine MUST
  NOT be committed.
- **Mask dynamic content** so it never trips the diff: `toHaveScreenshot({ mask:
  [page.getByTestId('timestamp')], animations: 'disabled' })`.
- Set tolerances in `playwright.config.ts` under `expect.toHaveScreenshot`
  (`maxDiffPixelRatio: 0.01`, `threshold: 0.2`) — tight enough to catch real
  regressions, loose enough to ignore sub-pixel anti-aliasing.
- A failed visual check writes `expected`/`actual`/`diff` PNGs into `test-results/`;
  open them with `pnpm exec playwright show-report`.

Treat baselines as reviewed source: a diff in a PR is a deliberate UI change to
approve, exactly like a code diff.

## CI

The `e2e` job in `.github/workflows/ci.yml` (needs `quality`) installs browsers with
`--with-deps`, builds web, and runs `pnpm run e2e`. Artifacts (`test-results/`,
`playwright-report/`) are gitignored.

## Verification

- `pnpm run e2e` passes locally (after installing browsers) and in the CI `e2e` job.
- Reviewer checks locators are role/text-based, assertions are web-first, and new
  data flows through the stub, not browser mocks.
- Any committed `*-snapshots/` baseline was generated in CI (not on a dev machine),
  and a visual diff in the PR is an intended UI change, not an accident.

Related: [[frontend-architecture]], [[frontend-performance]], [[engineering-discipline]].
