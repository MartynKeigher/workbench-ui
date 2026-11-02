import { expect, test } from '@playwright/test';
import { collapseFiles, openDemo, openDialog, openTabMenu, showToast } from './demo-page.js';

// The demo page in each mode, plus open states: a toast in light (also
// docs/screenshot-light.png), the tab menu in dark (also
// docs/screenshot-dark.png), a dialog, and the Files pane collapsed.

test('light', async ({ page }) => {
  await openDemo(page, 'light');
  await expect(page).toHaveScreenshot('light.png');
});

test('dark', async ({ page }) => {
  await openDemo(page, 'dark');
  await expect(page).toHaveScreenshot('dark.png');
});

test('light, with a toast', async ({ page }) => {
  await openDemo(page, 'light');
  await showToast(page);
  await expect(page).toHaveScreenshot('light-toast.png');
});

test('dark, with the tab menu open', async ({ page }) => {
  await openDemo(page, 'dark');
  await openTabMenu(page);
  await expect(page).toHaveScreenshot('dark-tab-menu.png');
});

test('light, with a dialog open', async ({ page }) => {
  await openDemo(page, 'light');
  await openDialog(page);
  await expect(page).toHaveScreenshot('light-dialog.png');
});

test('dark, with the Files pane collapsed', async ({ page }) => {
  await openDemo(page, 'dark');
  await collapseFiles(page);
  await expect(page).toHaveScreenshot('dark-collapsed.png');
});
