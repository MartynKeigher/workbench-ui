/**
 * Collapses a pane to its heading and back. Sets aria-expanded on the button
 * and data-collapsed on the pane. For sideways collapsing use Splitter.
 */

export class PaneToggle {
  /**
   * @param {HTMLButtonElement} button
   * @param {Object} options
   * @param {HTMLElement} options.pane
   * @param {boolean} [options.collapsed] - Initial state if nothing is saved. Default false.
   * @param {string} [options.storageKey] - localStorage key
   * @param {(collapsed: boolean) => void} [options.onChange]
   */
  constructor(button, { pane, collapsed = false, storageKey, onChange = () => {} }) {
    this.button = button;
    this.pane = pane;
    this.storageKey = storageKey;
    if (pane.id) button.setAttribute('aria-controls', pane.id);
    let saved = null;
    try {
      if (storageKey) saved = localStorage.getItem(storageKey);
    } catch {
      // storage unavailable
    }
    this.set(saved === null ? collapsed : saved === 'true');
    this.onClick = () => {
      this.set(!this.collapsed);
      try {
        if (storageKey) localStorage.setItem(storageKey, String(this.collapsed));
      } catch {
        // storage unavailable
      }
      onChange(this.collapsed);
    };
    button.addEventListener('click', this.onClick);
  }

  /** @param {boolean} collapsed */
  set(collapsed) {
    this.collapsed = collapsed;
    this.button.setAttribute('aria-expanded', String(!collapsed));
    this.pane.toggleAttribute('data-collapsed', collapsed);
  }

  destroy() {
    this.button.removeEventListener('click', this.onClick);
  }
}
