import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import {
  collapseFiles,
  openComponent,
  openDemo,
  openDialog,
  openOverview,
  openTabMenu,
} from './demo-page.js';
import { COMPONENTS } from '../demo/components/nav.js';

// Runs axe over the demo pages in light and dark. Any WCAG 2.2 A / AA issue fails.

// A toast that stays up while axe runs
const showToast = (page) =>
  page.evaluate(async () => {
    const { toast } = await import('/src/index.js');
    toast.success('Your changes were saved.', { duration: 600_000 });
  });

// axe rules we skip on purpose
const EXCEPTIONS = [
  {
    // The tab menu is a popup like a native context menu, so it sits outside the landmarks
    rule: 'region',
    selector: '.wb-tab-menu',
  },
];
const excepted = (violation) =>
  EXCEPTIONS.some(
    ({ rule, selector }) =>
      violation.id === rule && violation.nodes.every((n) => n.target.join(' ') === selector),
  );

const STATES = [
  ['closed', async () => {}],
  [
    'a toast',
    async (page) => {
      await showToast(page);
      // Wait for the fade-in, or axe sees low contrast
      await page
        .locator('.wb-toast.show')
        .evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
    },
  ],
  ['the tab menu open', openTabMenu],
  ['a dialog open', openDialog],
  ['the Files pane collapsed', collapseFiles],
];

const COMPONENT_IDS = COMPONENTS.map((c) => c.id);

const check = async (page) => {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze();
  // Easy to read in the CI log
  return violations
    .filter((v) => !excepted(v))
    .map((v) => ({
      rule: `${v.id} (${v.impact}): ${v.help}`,
      nodes: v.nodes.map((n) => `${n.target.join(' ')}: ${n.failureSummary}`),
    }));
};

for (const mode of ['light', 'dark']) {
  test(`overview page, ${mode}`, async ({ page }) => {
    await openOverview(page, mode, { paused: false });
    expect(await check(page)).toEqual([]);
  });

  for (const id of COMPONENT_IDS) {
    test(`components #${id}, ${mode}`, async ({ page }) => {
      await openComponent(page, id, mode, { paused: false });
      expect(await check(page)).toEqual([]);
    });
  }

  for (const [name, setUp] of STATES) {
    test(`${mode}, ${name}`, async ({ page }) => {
      await openDemo(page, mode, { paused: false });
      await setUp(page);
      expect(await check(page)).toEqual([]);
    });
  }
}
