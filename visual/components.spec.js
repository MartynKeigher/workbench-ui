import { expect, test } from '@playwright/test';
import { openComponent, openDemo } from './demo-page.js';

// Things jsdom can't test: dialog focus, dragging, the clipboard and layout.

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
  // Tab stays inside the dialog (Chrome's own toolbar shows up as <body>)
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

test('popover opens next to its button and closes on Escape', async ({ page }) => {
  await openComponent(page, 'popover', 'light', { paused: false });
  const button = page.getByRole('button', { name: 'Owner: Team A' });
  await button.click();
  const panel = page.locator('#ownerInfo');
  await expect(panel).toBeVisible();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  const [b, p] = await Promise.all([button.boundingBox(), panel.boundingBox()]);
  expect(Math.abs(p.y - (b.y + b.height + 6))).toBeLessThan(2);
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(button).toHaveAttribute('aria-expanded', 'false');
});

test('dropdown menu: keyboard in, choose, focus back on the button', async ({ page }) => {
  await openComponent(page, 'menu', 'light', { paused: false });
  const button = page.getByRole('button', { name: 'Actions ▾' });
  await button.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: 'Rename' })).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(page.getByRole('menuitem', { name: 'Delete' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menu')).toBeHidden();
  await expect(button).toBeFocused();
});
