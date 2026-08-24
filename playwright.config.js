// @ts-check
const { defineConfig, devices } = require('@playwright/test');

// Points at whatever is already running (`npm run dev` on 3000, the Rails
// API from docker-compose on 3010 via NEXT_PUBLIC_API_URL in .env) rather
// than starting its own servers — this suite is meant to be run against a
// dev environment you already have up, per docs/E2E.md.
module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
