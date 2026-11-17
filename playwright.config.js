import { defineConfig } from '@playwright/test';
import { BASE_URL, PORT, SCALE, VIEWPORT } from './visual/demo-page.js';

// Browser tests against the demo page: visual snapshots, axe-core and component
// behaviour. Snapshots are generated in the Playwright Docker image CI uses.
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
    // Renders are deterministic in the Docker image, so use threshold 0 to catch
    // small token changes, allowing up to 100 pixels of antialiasing noise.
    toHaveScreenshot: { threshold: 0, maxDiffPixels: 100 },
  },
  webServer: {
    command: `npx vite --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `${BASE_URL}/demo/`,
    reuseExistingServer: !process.env.CI,
  },
});
