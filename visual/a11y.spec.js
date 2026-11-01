import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openDemo, openTabMenu } from './demo-page.js';

// axe-core over the demo page, light and dark, closed and with a toast or the
// tab menu open. Any WCAG 2.2 A / AA or axe best-practice violation fails.

/** The demo's success toast, held on screen (axe needs running timers). */
const showToast = (page) =>
  page.evaluate(async () => {
    const { toast } = await import('/src/index.js');
    toast.success('Your changes were saved.', { duration: 600_000 });
  });

/**
 * Known exceptions, each with its reason. A violation is dropped only when
 * every element it names matches.
 */
const EXCEPTIONS = [
  {
    // The open tab menu is a fixed popup on <body>, outside the landmarks, like
    // a native context menu. It takes the focus when it opens and hands it back
    // when it closes, so nobody has to find it by landmark.
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
  ['a toast', (page) => showToast(page).then(() => page.locator('.wb-toast.show').waitFor())],
  ['the tab menu open', openTabMenu],
];

for (const mode of ['light', 'dark']) {
  for (const [name, setUp] of STATES) {
    test(`${mode}, ${name}`, async ({ page }) => {
      await openDemo(page, mode, { paused: false });
      await setUp(page);
      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .analyze();
      // Rule, then each failing element and why: readable in the CI log
      const report = violations
        .filter((v) => !excepted(v))
        .map((v) => ({
          rule: `${v.id} (${v.impact}): ${v.help}`,
          nodes: v.nodes.map((n) => `${n.target.join(' ')}: ${n.failureSummary}`),
        }));
      expect(report).toEqual([]);
    });
  }
}
