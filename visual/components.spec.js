import { expect, test } from '@playwright/test';
import { openDemo } from './demo-page.js';

// The components in a real browser, through the demo page: what jsdom can't
// do (native <dialog> focus, pointer drags, the clipboard, layout).

test.beforeEach(({ page }) => openDemo(page, 'light', { paused: false }));

const filesWidth = (page) => page.locator('#filesPane').evaluate((el) => el.offsetWidth);

test('confirm dialog: focus starts on Cancel, stays inside, Escape gives it back', async ({
  page,
}) => {
  const opener = page.getByRole('button', { name: 'Delete…' });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Delete Q3 report?' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
  // Tab goes round the dialog's buttons and never reaches the page behind it.
  // (Past the last button Chrome moves on to its own toolbar, which leaves the
  // page's activeElement as <body>.)
  for (let i = 0; i < 6; i += 1) {
    await page.keyboard.press('Tab');
    const where = await page.evaluate(() =>
      document.activeElement === document.body
        ? 'browser'
        : document.activeElement.closest('dialog')
          ? 'dialog'
          : 'page',
    );
    expect(where).not.toBe('page');
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  await expect(page.locator('.wb-toast')).toHaveCount(0);
});

test('confirm dialog: Delete resolves yes', async ({ page }) => {
  await page.getByRole('button', { name: 'Delete…' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await expect(page.locator('.wb-toast-content')).toHaveText('Deleted (not really).');
});

test('splitter: drag, keys, collapse, and remembered after a reload', async ({ page }) => {
  const handle = page.getByRole('separator', { name: 'Files pane width' });
  expect(await filesWidth(page)).toBe(200);

  const box = await handle.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + 100);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 60, box.y + 100, { steps: 5 });
  await page.mouse.up();
  expect(await filesWidth(page)).toBe(260);

  await handle.focus();
  await page.keyboard.press('ArrowLeft');
  expect(await filesWidth(page)).toBe(244);
  await expect(handle).toHaveAttribute('aria-valuenow', '244');

  // Collapsed from the header bar: hidden, and out of the tab order
  const toggle = page.getByRole('button', { name: 'Files pane' });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(await filesWidth(page)).toBe(0);
  await expect(page.getByRole('button', { name: 'Roadmap' })).toBeHidden();

  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('button', { name: 'Files pane' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  // Clicking the collapsed handle brings it back, at its old size
  await page.getByRole('separator', { name: 'Files pane width' }).click();
  expect(await filesWidth(page)).toBe(244);
});

test('copy button: copies the code and says so', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const button = page.getByRole('button', { name: 'Copy' });
  await button.click();
  await expect(page.locator('#copyCode')).toHaveText('Copied');
  await expect(page.locator('.wb-copy-live')).toHaveText('Copied');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toBe(await page.locator('#code').textContent());
  await expect(page.locator('#copyCode')).toHaveText('Copy', { timeout: 3000 });
});

test('pane toggle: folds the Tokens pane, and remembers', async ({ page }) => {
  const toggle = page.getByRole('button', { name: 'Tokens' });
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await toggle.click();
  await expect(page.locator('#swatches')).toBeHidden();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Tokens' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  await expect(page.locator('#swatches')).toBeHidden();
});

test('message bar: its × removes it', async ({ page }) => {
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(page.locator('#message')).toHaveCount(0);
});

test('footers: the bar sits at the bottom of the window, the columns at the end of the page', async ({
  page,
}) => {
  const bar = page.locator('footer.wb-footer');
  const box = await bar.boundingBox();
  const viewport = page.viewportSize();
  expect(Math.round(box.y + box.height)).toBe(viewport.height);

  await bar.getByRole('link', { name: 'Overview' }).click();
  await expect(page).toHaveURL(/overview\.html$/);
  const columns = page.locator('footer.wb-footer-columns');
  // After the content, not over it
  const mainBottom = await page.locator('main').evaluate((el) => el.getBoundingClientRect().bottom);
  const footerTop = await columns.evaluate((el) => el.getBoundingClientRect().top);
  expect(footerTop).toBeGreaterThanOrEqual(mainBottom);
  // Every stacked link is at least 24px tall
  const heights = await columns
    .locator('.wb-footer-group a')
    .evaluateAll((links) => links.map((a) => a.getBoundingClientRect().height));
  expect(heights.length).toBe(9);
  for (const height of heights) expect(height).toBeGreaterThanOrEqual(24);
});
