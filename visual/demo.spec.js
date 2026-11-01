import { expect, test } from '@playwright/test';
import { openDemo, openTabMenu, showToast } from './demo-page.js';

// The demo page in each mode, plus one open state in each: a toast in light
// (also docs/screenshot-light.png) and the tab menu in dark (also
// docs/screenshot-dark.png).

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
