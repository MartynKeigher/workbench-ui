// Regenerates the README screenshots in docs/.
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
} finally {
  await browser.close();
  await server.close();
}
