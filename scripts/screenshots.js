/**
 * Regenerates docs/screenshot-light.png and docs/screenshot-dark.png from the
 * demo page: 1200x600 at 2x, fonts loaded, in the same states as the visual
 * tests' light-toast and dark-tab-menu shots.
 *
 *   npm run screenshots
 *
 * Text renders a little differently on each OS. For images that match CI's,
 * run it in the Playwright Docker image, or use the "Update screenshots"
 * workflow (see the README).
 */
import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import { PORT, SCALE, VIEWPORT, openDemo, openTabMenu, showToast } from '../visual/demo-page.js';

const SHOTS = [
  ['light', showToast],
  ['dark', openTabMenu],
];

const server = await createServer({
  server: { host: '127.0.0.1', port: PORT, strictPort: true, open: false },
  logLevel: 'warn',
});
await server.listen();
const browser = await chromium.launch();
try {
  for (const [mode, setUp] of SHOTS) {
    const page = await browser.newPage({
      viewport: VIEWPORT,
      deviceScaleFactor: SCALE,
      colorScheme: 'light',
      locale: 'en-GB',
      timezoneId: 'UTC',
    });
    await openDemo(page, mode);
    await setUp(page);
    const file = `docs/screenshot-${mode}.png`;
    await page.screenshot({ path: file, animations: 'disabled', caret: 'hide' });
    await page.close();
    console.log(`Wrote ${file}`);
  }
} finally {
  await browser.close();
  await server.close();
}
