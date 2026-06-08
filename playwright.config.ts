import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config — smoke suite for shreyachanth.com
 *
 * The webServer rebuilds with Cloudflare's always-pass test site key
 * (1x00000000000000000000AA) so the Turnstile widget auto-completes in headless
 * Chromium without user interaction. The mocked /contact endpoint is then
 * reachable in the contact form tests.
 *
 * Production uses the real VITE_TURNSTILE_SITE_KEY from .env.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Build with the always-pass Turnstile test key so CI headless tests can
    // submit the form. Production .env is NOT used here — the override ensures
    // the Turnstile widget resolves without user interaction in headless Chromium.
    command:
      'VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000, // allow up to 2 min for build + server start
  },
})
