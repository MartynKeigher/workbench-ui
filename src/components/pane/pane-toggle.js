/**
 * Pane toggle: a button that folds a pane down to its heading, and back.
 * For a pane that collapses out of the way sideways, use Splitter instead.
 *
 *   <section class="wb-pane" id="details">
 *     <h2 class="wb-pane-head">
 *       Details
 *       <button type="button" class="wb-pane-toggle" aria-label="Details"></button>
 *     </h2>
 *     …
 *   </section>
 *
 *   new PaneToggle(document.querySelector('#details .wb-pane-toggle'), {
 *     pane: document.getElementById('details'),
 *     storageKey: 'detailsCollapsed',
 *   });
 *
 * It sets aria-expanded on the button and data-collapsed on the pane, which
 * hides everything in the pane but its headings.
 */

export class PaneToggle {
  /**
   * @param {HTMLButtonElement} button
   * @param {Object} options
   * @param {HTMLElement} options.pane
   * @param {boolean} [options.collapsed] - Start collapsed, when nothing is saved. Default false.
   * @param {string} [options.storageKey] - Remember the choice in this browser under this key
   * @param {(collapsed: boolean) => void} [options.onChange] - After the user toggles it
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
      // No storage: use the default
    }
    this.set(saved === null ? collapsed : saved === 'true');
    this.onClick = () => {
      this.set(!this.collapsed);
      try {
        if (storageKey) localStorage.setItem(storageKey, String(this.collapsed));
      } catch {
        // Not remembered; it still applies now
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
