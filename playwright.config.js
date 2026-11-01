import { defineConfig } from '@playwright/test';
import { BASE_URL, PORT, SCALE, VIEWPORT } from './visual/demo-page.js';

// Visual regression tests: screenshots of the demo page, compared with the
// committed ones in visual/*-snapshots/. Pixels depend on the OS, so the
// committed images come from the Playwright Docker image CI runs in (see the
// README's "Visual tests").
export default defineConfig({
  testDir: 'visual',
  snapshotPathTemplate: '{testDir}/{testFileName}-snapshots/{arg}{ext}',
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    browserName: 'chromium',
    viewport: VIEWPORT,
    deviceScaleFactor: SCALE,
    colorScheme: 'light',
    locale: 'en-GB',
    timezoneId: 'UTC',
  },
  expect: {
    // Room for antialiasing noise only: a real change moves far more pixels
    toHaveScreenshot: { maxDiffPixels: 100, threshold: 0.2 },
  },
  webServer: {
    command: `npx vite --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `${BASE_URL}/demo/`,
    reuseExistingServer: !process.env.CI,
  },
});
