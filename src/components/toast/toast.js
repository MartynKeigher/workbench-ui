/**
 * Toasts: short notes that float in the corner, then go.
 *
 *   import { toast } from '@martynkeigher/workbench-ui';
 *   toast.success('Saved.');
 *   toast.error('Could not read the file.', { duration: 6000 });
 *   toast.show('3 files exported.', { title: 'Exported' });
 *
 * Text is set as text, never as HTML, so it is safe to pass anything in.
 */

/** @typedef {'success'|'error'|'info'} ToastType */

/**
 * @typedef {Object} ToastOptions
 * @property {ToastType} [type] - Its kind: sets the icon, colour and default title. Default 'success'.
 * @property {string} [title] - Heading over the message. Defaults by type.
 * @property {number} [duration] - How long it shows, in milliseconds. Default 3000.
 */

export const DEFAULT_TITLES = { success: 'Done', error: 'Something went wrong', info: 'Note' };

const svg = (path) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
const ICONS = {
  success: svg('<path d="M20 6 9 17l-5-5"></path>'),
  error: svg('<circle cx="12" cy="12" r="9"></circle><path d="M12 8v5M12 16.5v.01"></path>'),
  info: svg('<circle cx="12" cy="12" r="9"></circle><path d="M12 11v5M12 7.5v.01"></path>'),
};

export class Toaster {
  /**
   * @param {Object} [options]
   * @param {HTMLElement} [options.container] - Where toasts go. Default: a
   *   `.wb-toast-container` element on the page, made if there is none.
   * @param {Partial<Record<ToastType, string>>} [options.titles] - Default titles by type
   */
  constructor({ container, titles } = {}) {
    this.container = container ?? null;
    this.titles = { ...DEFAULT_TITLES, ...titles };
  }

  /** @returns {HTMLElement} */
  ensureContainer() {
    if (this.container?.isConnected) return this.container;
    this.container = document.querySelector('.wb-toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'wb-toast-container';
      this.container.setAttribute('role', 'status');
      this.container.setAttribute('aria-live', 'polite');
      document.body.append(this.container);
    }
    return this.container;
  }

  /**
   * Show a toast.
   * @param {string} message
   * @param {ToastOptions} [options]
   * @returns {HTMLElement} The toast (hide it early with `hide`)
   */
  show(message, { type = 'success', title, duration = 3000 } = {}) {
    const kind = ICONS[type] ? type : 'success';
    const element = document.createElement('div');
    element.className = 'wb-toast';
    element.dataset.type = kind;
    element.innerHTML = `
      <span class="wb-toast-icon" aria-hidden="true">${ICONS[kind]}</span>
      <div class="wb-toast-body">
        <div class="wb-toast-title"></div>
        <div class="wb-toast-content"></div>
      </div>`;
    element.querySelector('.wb-toast-title').textContent = title ?? this.titles[kind];
    element.querySelector('.wb-toast-content').textContent = String(message ?? '');

    this.ensureContainer().append(element);
    // Next frame, so the entry transition runs
    setTimeout(() => element.classList.add('show'), 10);
    setTimeout(() => this.hide(element), duration);
    return element;
  }

  /** @param {string} message @param {Omit<ToastOptions, 'type'>} [options] */
  success(message, options) {
    return this.show(message, { ...options, type: 'success' });
  }

  /** @param {string} message @param {Omit<ToastOptions, 'type'>} [options] */
  error(message, options) {
    return this.show(message, { ...options, type: 'error' });
  }

  /** @param {string} message @param {Omit<ToastOptions, 'type'>} [options] */
  info(message, options) {
    return this.show(message, { ...options, type: 'info' });
  }

  /**
   * Hide a toast now.
   * @param {HTMLElement} element
   */
  hide(element) {
    if (!element?.isConnected) return;
    element.classList.remove('show');
    setTimeout(() => element.remove(), 300);
  }
}

/** One toaster for the page */
export const toast = new Toaster();
