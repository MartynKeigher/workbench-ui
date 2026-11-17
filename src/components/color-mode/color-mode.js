/**
 * Light/dark toggle. Sets data-color-mode on <html> and persists the choice.
 * Defaults to light regardless of OS preference. See README.
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
 * @param {string} [storageKey]
 * @returns {'light'|'dark'}
 */
export function savedColorMode(storageKey = STORAGE_KEY) {
  try {
    return localStorage.getItem(storageKey) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/**
 * Apply the saved mode to <html>. Call before first paint to avoid a light flash.
 * @param {string} [storageKey]
 */
export function applySavedColorMode(storageKey = STORAGE_KEY) {
  document.documentElement.dataset.colorMode = savedColorMode(storageKey);
}

export class ColorMode {
  /**
   * @param {HTMLButtonElement} button
   * @param {Object} [options]
   * @param {string} [options.storageKey] - Default 'colorMode'.
   * @param {(mode: 'light'|'dark') => void} [options.onChange]
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
        // storage unavailable
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
    // Icon shows the mode a click switches to
    this.button.querySelector('.wb-icon-moon')?.toggleAttribute('hidden', dark);
    this.button.querySelector('.wb-icon-sun')?.toggleAttribute('hidden', !dark);
  }

  destroy() {
    this.button.removeEventListener('click', this.onClick);
  }
}
