import { defineConfig, devices } from '@playwright/test';

// Ports kept off the core-api (3000) and web dev (3000) defaults so an e2e run
// never collides with a running dev stack.
const WEB_PORT = Number(process.env.WEB_E2E_PORT ?? 3100);
const STUB_PORT = Number(process.env.STUB_API_PORT ?? 3101);
const baseURL = `http://localhost:${WEB_PORT}`;
const isCI = !!process.env.CI;

// The /appointments page is a Server Component that reads core-api at request
// time, so browser request mocking cannot reach it. Instead the web server is
// pointed at a deterministic stub API (see src/support/stub-core-api.mjs): this
// exercises the real RSC -> DTO-validation -> mapper -> view pipeline end to end
// without a database.
export default defineConfig({
  testDir: './src',
  testMatch: '**/*.spec.ts',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI
    ? [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]]
    : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: [
    {
      command: 'node ./src/support/stub-core-api.mjs',
      env: { PORT: String(STUB_PORT) },
      url: `http://localhost:${STUB_PORT}/health`,
      reuseExistingServer: !isCI,
      timeout: 30_000,
    },
    {
      command: `../../node_modules/.bin/next start ../web -p ${WEB_PORT}`,
      env: {
        CORE_API_URL: `http://localhost:${STUB_PORT}`,
        CORE_API_TOKEN: 'e2e-token',
      },
      url: `${baseURL}/appointments`,
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
  ],
});
