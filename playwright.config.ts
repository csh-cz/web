/**
 * Playwright config pro UI testy `csh-cz/web`.
 *
 * Default běží proti ostrým Cloudflare Pages URL. Pro lokální vývoj:
 *   PLAYWRIGHT_BASE_HODINARIUM=http://127.0.0.1:4321 \
 *   PLAYWRIGHT_BASE_HOROLOGIE=http://127.0.0.1:4322 \
 *   pnpm test:e2e
 *
 * Test soubory:
 *   tests/regression/   — testy konkrétních opravených bugů (Issue #N)
 *   tests/smoke/        — broad coverage (nav, layout, klíčové komponenty)
 */
import { defineConfig, devices } from 'playwright/test';

const HODINARIUM = process.env.PLAYWRIGHT_BASE_HODINARIUM ?? 'https://hodinarium-eu.pages.dev';
const HOROLOGIE = process.env.PLAYWRIGHT_BASE_HOROLOGIE ?? 'https://horologie-cz.pages.dev';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    /* Default theme tmavá — odpovídá CSS :root (default = dark, light je
       pod @media prefers-color-scheme: light). Bez tohoto Chromium v CI
       dostane light theme a barevné testy nav-contrast padnou. */
    colorScheme: 'dark',
  },
  projects: [
    {
      name: 'hodinarium-chromium',
      use: { ...devices['Desktop Chrome'], baseURL: HODINARIUM },
      testMatch: /.*hodinarium\.spec\.ts$/,
    },
    {
      name: 'horologie-chromium',
      use: { ...devices['Desktop Chrome'], baseURL: HOROLOGIE },
      testMatch: /.*horologie\.spec\.ts$/,
    },
    // Mobilní vrstva — kontrola layoutu na malém viewportu (Mobile Chrome,
    // ne webkit, ať nepotřebujeme druhý browser engine)
    {
      name: 'hodinarium-mobile',
      use: { ...devices['Pixel 5'], baseURL: HODINARIUM },
      testMatch: /.*hodinarium\.spec\.ts$/,
    },
  ],
});
