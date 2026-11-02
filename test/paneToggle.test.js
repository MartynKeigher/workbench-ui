import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PaneToggle } from '../src/components/pane/pane-toggle.js';

describe('PaneToggle', () => {
  let pane, button, toggle;
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `<section class="wb-pane" id="details">
      <h2 class="wb-pane-head">Details <button class="wb-pane-toggle"></button></h2><p>Body</p></section>`;
    pane = document.getElementById('details');
    button = pane.querySelector('button');
  });
  afterEach(() => toggle?.destroy());

  it('folds the pane and says so on the button', () => {
    const onChange = vi.fn();
    toggle = new PaneToggle(button, { pane, onChange });
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.getAttribute('aria-controls')).toBe('details');
    button.click();
    expect(pane.hasAttribute('data-collapsed')).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(onChange).toHaveBeenCalledWith(true);
    button.click();
    expect(pane.hasAttribute('data-collapsed')).toBe(false);
  });

  it('starts collapsed when asked, and remembers the choice', () => {
    toggle = new PaneToggle(button, { pane, collapsed: true, storageKey: 'details' });
    expect(pane.hasAttribute('data-collapsed')).toBe(true);
    button.click();
    toggle.destroy();
    toggle = new PaneToggle(button, { pane, collapsed: true, storageKey: 'details' });
    expect(pane.hasAttribute('data-collapsed')).toBe(false);
  });

  it('stops listening after destroy', () => {
    toggle = new PaneToggle(button, { pane });
    toggle.destroy();
    button.click();
    expect(pane.hasAttribute('data-collapsed')).toBe(false);
  });
});
