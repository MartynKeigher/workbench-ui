/**
 * Regenerates the README screenshots in docs/ (1200px wide at 2x).
 * Run in the Playwright Docker image, or via the "Update screenshots" workflow,
 * for output that matches CI.
 */
import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import {
  PORT,
  SCALE,
  VIEWPORT,
  openDemo,
  openOverview,
  openTabMenu,
  showToast,
} from '../visual/demo-page.js';

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
const newPage = () =>
  browser.newPage({
    viewport: VIEWPORT,
    deviceScaleFactor: SCALE,
    colorScheme: 'light',
    locale: 'en-GB',
    timezoneId: 'UTC',
  });
try {
  for (const [mode, setUp] of SHOTS) {
    const page = await newPage();
    await openDemo(page, mode);
    await setUp(page);
    const file = `docs/screenshot-${mode}.png`;
    await page.screenshot({ path: file, animations: 'disabled', caret: 'hide' });
    await page.close();
    console.log(`Wrote ${file}`);
  }
  const FOOTERS = [
    ['bar', openDemo, 'footer.wb-footer'],
    ['columns', openOverview, 'footer.wb-footer-columns'],
  ];
  for (const [name, open, selector] of FOOTERS) {
    for (const mode of ['light', 'dark']) {
      const page = await newPage();
      await open(page, mode);
      const file = `docs/screenshot-footer-${name}-${mode}.png`;
      await page
        .locator(selector)
        .screenshot({ path: file, animations: 'disabled', caret: 'hide' });
      await page.close();
      console.log(`Wrote ${file}`);
    }
  }
} finally {
  await browser.close();
  await server.close();
}
