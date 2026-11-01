/**
 * Puts the demo page into a known state for the visual tests and for
 * `npm run screenshots`, so the two always show the same thing.
 *
 * - No network: the Google Fonts request in src/fonts.css is answered with
 *   the same typefaces from @fontsource (dev dependencies), and any other
 *   outside request is refused. Rendering doesn't depend on what a CDN
 *   serves today.
 * - Frozen timers: a toast stays until the shot is taken.
 * - Fonts loaded before anything is captured.
 */
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

export const VIEWPORT = { width: 1200, height: 600 };
export const SCALE = 2;
export const PORT = 5179;
export const BASE_URL = `http://127.0.0.1:${PORT}`;

const require = createRequire(import.meta.url);
const FONT_HOST = 'https://fonts.gstatic.com/workbench-local';
// The families and weights src/fonts.css asks for
const FONTS = [
  ['Source Sans 3', '@fontsource/source-sans-3', 'source-sans-3', [400, 500, 600, 700]],
  ['Source Code Pro', '@fontsource/source-code-pro', 'source-code-pro', [400, 500, 600]],
];

const fontCss = FONTS.flatMap(([family, , slug, weights]) =>
  weights.map(
    (weight) => `@font-face {
  font-family: '${family}';
  font-style: normal;
  font-weight: ${weight};
  font-display: block;
  src: url(${FONT_HOST}/${slug}-latin-${weight}-normal.woff2) format('woff2');
}`,
  ),
).join('\n');

const fontFile = (name) => {
  const [, pkg] = FONTS.find(([, , slug]) => name.startsWith(`${slug}-`)) ?? [];
  if (!pkg) return null;
  return path.join(path.dirname(require.resolve(`${pkg}/package.json`)), 'files', name);
};

/** Serve the fonts locally and block every other outside request. */
export async function offline(page) {
  await page.route(
    (url) => url.origin !== BASE_URL,
    async (route) => {
      const url = new URL(route.request().url());
      if (url.hostname === 'fonts.googleapis.com') {
        return route.fulfill({ contentType: 'text/css', body: fontCss });
      }
      if (url.href.startsWith(`${FONT_HOST}/`)) {
        const file = fontFile(path.basename(url.pathname));
        if (file) {
          return route.fulfill({
            contentType: 'font/woff2',
            headers: { 'access-control-allow-origin': '*' },
            body: await readFile(file),
          });
        }
      }
      return route.abort();
    },
  );
}

/**
 * Open the demo page in a colour mode, with timers paused.
 * @param {import('playwright').Page} page
 * @param {'light'|'dark'} mode
 */
export async function openDemo(page, mode) {
  await offline(page);
  await page.clock.install({ time: new Date('2026-01-01T09:00:00Z') });
  // The same way a saved choice arrives: ColorMode reads it on start
  await page.addInitScript((value) => localStorage.setItem('colorMode', value), mode);
  await page.goto(`${BASE_URL}/demo/`);
  await page.clock.pauseAt(new Date('2026-01-01T09:00:01Z'));
  await page.evaluate(() => document.fonts.ready);
  await page.locator(`html[data-color-mode="${mode}"]`).waitFor({ state: 'attached' });
}

/** Show the success toast from the demo's Toasts pane. */
export async function showToast(page) {
  await page.getByRole('button', { name: 'Success', exact: true }).click();
  // Let the entry timer fire; the 3 s hide timer doesn't, because time is paused
  await page.clock.runFor(500);
  await page.locator('.wb-toast.show').waitFor();
}

/** Open the right-click menu on the "Release notes" tab. */
export async function openTabMenu(page) {
  const tab = page.locator('.wb-tab', { hasText: 'Release notes' }).locator('.wb-tab-select');
  // Near the bottom edge, so the menu opens below the tab rather than over its label
  const box = await tab.boundingBox();
  await tab.click({ button: 'right', position: { x: 60, y: box.height - 2 } });
  await page.locator('.wb-tab-menu').waitFor();
}
