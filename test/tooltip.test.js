import { beforeEach, describe, expect, it } from 'vitest';
import { Tooltip } from '../src/components/tooltip/tooltip.js';

describe('Tooltip', () => {
  let button;
  let tooltip;
  const tip = () => document.querySelector('.wb-tooltip');

  beforeEach(() => {
    document.body.innerHTML = '<button type="button">Save</button>';
    button = document.querySelector('button');
    tooltip = new Tooltip(button, { text: 'Ctrl+S' });
  });

  it('links the element to the tooltip and starts hidden', () => {
    expect(tip().getAttribute('role')).toBe('tooltip');
    expect(button.getAttribute('aria-describedby')).toBe(tip().id);
    expect(tip().hidden).toBe(true);
  });

  it('shows on focus and hover, hides on blur and leave', () => {
    button.dispatchEvent(new FocusEvent('focus'));
    expect(tip().hidden).toBe(false);
    button.dispatchEvent(new FocusEvent('blur'));
    expect(tip().hidden).toBe(true);
    button.dispatchEvent(new MouseEvent('mouseenter'));
    expect(tip().hidden).toBe(false);
    button.dispatchEvent(new MouseEvent('mouseleave'));
    expect(tip().hidden).toBe(true);
  });

  it('hides on Escape', () => {
    button.dispatchEvent(new FocusEvent('focus'));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(tip().hidden).toBe(true);
  });

  it('sets text as text, not HTML', () => {
    tooltip.setText('<b>x</b>');
    expect(tip().textContent).toBe('<b>x</b>');
    expect(tip().querySelector('b')).toBeNull();
  });

  it('cleans up on destroy', () => {
    tooltip.destroy();
    expect(tip()).toBeNull();
    expect(button.hasAttribute('aria-describedby')).toBe(false);
  });
});

describe('Tooltip.attach', () => {
  it('adds a tooltip to each [data-tooltip] element', () => {
    document.body.innerHTML = `
      <a class="wb-help" href="/help" data-tooltip="Exports help">?</a>
      <button type="button" class="wb-info" data-tooltip="Kept 30 days">i</button>
      <button type="button">Plain</button>`;
    const tips = Tooltip.attach();
    expect(tips).toHaveLength(2);
    const texts = [...document.querySelectorAll('[aria-describedby]')].map(
      (el) => document.getElementById(el.getAttribute('aria-describedby')).textContent,
    );
    expect(texts).toEqual(['Exports help', 'Kept 30 days']);
  });
});
