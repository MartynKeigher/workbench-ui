/**
 * Colour mode: a light / dark toggle button.
 *
 * Sets data-color-mode on <html> (tokens.css keys its dark palette off it)
 * and remembers the choice in this browser. Light unless the user picked
 * dark; the OS setting doesn't change it.
 *
 *   <button class="wb-hbtn wb-hbtn-icon" id="colorMode" type="button"></button>
 *
 *   import { ColorMode } from '@martynkeigher/workbench-ui';
 *   new ColorMode(document.getElementById('colorMode'));
 *
 * An empty button gets the moon and sun icons. A button that already has
 * elements with the classes wb-icon-moon and wb-icon-sun keeps its own.
 */

export const STORAGE_KEY = 'colorMode';

const icon = (cls, body) =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const MOON_ICON = icon(
  'wb-icon-moon',
  '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"></path>',
);
export const SUN_ICON = icon(
  'wb-icon-sun',
  '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"></path>',
);

/**
 * The mode saved in this browser.
 * @param {string} [storageKey]
 * @returns {'light'|'dark'}
 */
export function savedColorMode(storageKey = STORAGE_KEY) {
  try {
    return localStorage.getItem(storageKey) === 'dark' ? 'dark' : 'light';
  } catch {
    // No storage: light
    return 'light';
  }
}

/**
 * Put the saved mode on <html>. Call it early (before the page paints) to
 * avoid a flash of the light palette for someone who picked dark.
 * @param {string} [storageKey]
 */
export function applySavedColorMode(storageKey = STORAGE_KEY) {
  document.documentElement.dataset.colorMode = savedColorMode(storageKey);
}

export class ColorMode {
  /**
   * @param {HTMLButtonElement} button
   * @param {Object} [options]
   * @param {string} [options.storageKey] - Where the choice is kept. Default 'colorMode'.
   * @param {(mode: 'light'|'dark') => void} [options.onChange] - After the user switches
   */
  constructor(button, { storageKey = STORAGE_KEY, onChange = () => {} } = {}) {
    this.button = button;
    this.storageKey = storageKey;
    if (!button.querySelector('.wb-icon-moon')) button.innerHTML = MOON_ICON + SUN_ICON;
    if (!button.hasAttribute('aria-label')) button.setAttribute('aria-label', 'Dark mode');
    this.apply(savedColorMode(storageKey) === 'dark');
    this.onClick = () => {
      this.apply(!this.dark);
      try {
        localStorage.setItem(storageKey, this.dark ? 'dark' : 'light');
      } catch {
        // Not remembered; it still applies now
      }
      onChange(this.dark ? 'dark' : 'light');
    };
    button.addEventListener('click', this.onClick);
  }

  /** @returns {'light'|'dark'} */
  get mode() {
    return this.dark ? 'dark' : 'light';
  }

  /** @param {boolean} dark */
  apply(dark) {
    this.dark = dark;
    document.documentElement.dataset.colorMode = dark ? 'dark' : 'light';
    this.button.setAttribute('aria-pressed', String(dark));
    this.button.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    // The icon shows the mode a click switches to
    this.button.querySelector('.wb-icon-moon')?.toggleAttribute('hidden', dark);
    this.button.querySelector('.wb-icon-sun')?.toggleAttribute('hidden', !dark);
  }

  destroy() {
    this.button.removeEventListener('click', this.onClick);
  }
}
