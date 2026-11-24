import { describe, expect, it } from 'vitest';
import { COMPONENTS, renderNav } from '../demo/components/nav.js';

const render = (current) => {
  const nav = document.createElement('nav');
  renderNav(nav, current);
  return nav;
};

describe('renderNav', () => {
  it('lists every component under its group, in order', () => {
    const nav = render('buttons');
    const heads = [...nav.querySelectorAll('.wb-pane-head')].map((h) => h.textContent);
    expect(heads).toEqual([...new Set(COMPONENTS.map((c) => c.group))]);
    const links = [...nav.querySelectorAll('.wb-list-item')];
    expect(links.map((a) => a.textContent)).toEqual(COMPONENTS.map((c) => c.label));
    expect(links.map((a) => a.getAttribute('href'))).toEqual(COMPONENTS.map((c) => `#${c.id}`));
  });

  it('keeps Foundations first, then sorts groups and components A to Z', () => {
    const groups = [...new Set(COMPONENTS.map((c) => c.group))];
    const az = (a, b) => a.localeCompare(b);
    expect(groups[0]).toBe('Foundations');
    expect(groups.slice(1)).toEqual([...groups.slice(1)].sort(az));
    for (const group of groups) {
      const labels = COMPONENTS.filter((c) => c.group === group).map((c) => c.label);
      expect(labels).toEqual([...labels].sort(az));
    }
  });

  it('marks only the current page', () => {
    const current = [...render('tabs').querySelectorAll('[aria-current="page"]')];
    expect(current.map((a) => a.textContent)).toEqual(['Tabs']);
  });

  it('marks nothing for an id not in the list', () => {
    expect(render('nope').querySelector('[aria-current]')).toBeNull();
  });
});
