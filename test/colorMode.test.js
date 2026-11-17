import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ColorMode,
  applySavedColorMode,
  savedColorMode,
} from '../src/components/color-mode/color-mode.js';

const html = document.documentElement;

describe('ColorMode', () => {
  let button;
  beforeEach(() => {
    localStorage.clear();
    delete html.dataset.colorMode;
    document.body.innerHTML = '<button type="button"></button>';
    button = document.querySelector('button');
  });
  afterEach(() => vi.restoreAllMocks());

  it('starts light and fills an empty button with both icons', () => {
    new ColorMode(button);
    expect(html.dataset.colorMode).toBe('light');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.querySelector('.wb-icon-moon').hasAttribute('hidden')).toBe(false);
    expect(button.querySelector('.wb-icon-sun').hasAttribute('hidden')).toBe(true);
    expect(button.getAttribute('aria-label')).toBe('Dark mode');
  });

  it('toggles, remembers the choice and reports it', () => {
    const onChange = vi.fn();
    const mode = new ColorMode(button, { onChange });
    button.click();
    expect(html.dataset.colorMode).toBe('dark');
    expect(mode.mode).toBe('dark');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.title).toBe('Switch to light mode');
    expect(localStorage.getItem('colorMode')).toBe('dark');
    expect(onChange).toHaveBeenCalledWith('dark');
  });

  it('restores the saved choice, under its own key', () => {
    localStorage.setItem('myKey', 'dark');
    new ColorMode(button, { storageKey: 'myKey' });
    expect(html.dataset.colorMode).toBe('dark');
  });

  it('keeps icons the button already has', () => {
    button.innerHTML = '<i class="wb-icon-moon"></i><i class="wb-icon-sun"></i>';
    new ColorMode(button);
    expect(button.querySelectorAll('i')).toHaveLength(2);
  });

  it('works without storage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(savedColorMode()).toBe('light');
    new ColorMode(button);
    button.click();
    expect(html.dataset.colorMode).toBe('dark');
  });

  it('applySavedColorMode sets <html> before any button exists', () => {
    localStorage.setItem('colorMode', 'dark');
    applySavedColorMode();
    expect(html.dataset.colorMode).toBe('dark');
  });

  it('destroy stops listening', () => {
    const mode = new ColorMode(button);
    mode.destroy();
    button.click();
    expect(html.dataset.colorMode).toBe('light');
  });
});
