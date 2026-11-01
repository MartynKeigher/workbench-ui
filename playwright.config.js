import { defineConfig } from '@playwright/test';
import { BASE_URL, PORT, SCALE, VIEWPORT } from './visual/demo-page.js';

// Browser tests of the demo page: screenshots compared with the committed
// ones in visual/*-snapshots/ (demo.spec.js), and axe-core (a11y.spec.js). Pixels depend on the OS, so the
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
    // Renders in the Playwright image are pixel-identical run to run, so any
    // colour change in a pixel counts (threshold 0: the default lets small
    // token changes through), and up to 100 changed pixels are allowed for
    // stray antialiasing. A real change, even of one token, moves thousands.
    toHaveScreenshot: { threshold: 0, maxDiffPixels: 100 },
  },
  webServer: {
    command: `npx vite --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `${BASE_URL}/demo/`,
    reuseExistingServer: !process.env.CI,
  },
});
