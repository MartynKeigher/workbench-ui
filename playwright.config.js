import { defineConfig } from '@playwright/test';
import { BASE_URL, PORT, SCALE, VIEWPORT } from './visual/demo-page.js';

// Browser tests: axe and component behavior.
export default defineConfig({
  testDir: 'visual',
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
  webServer: {
    command: `npx vite --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `${BASE_URL}/demo/`,
    reuseExistingServer: !process.env.CI,
  },
});
