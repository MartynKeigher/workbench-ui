/**
 * Splitter: a handle between two panes that resizes one of them, by dragging
 * or from the keyboard, collapses it out of the way, and remembers both.
 *
 * It writes the size to a CSS custom property (default --wb-split) on the
 * layout element (default: the handle's parent), so your grid or flex layout
 * decides how to use it:
 *
 *   <main class="layout">
 *     <aside class="wb-pane" id="files">…</aside>
 *     <div class="wb-splitter"></div>
 *     <section class="wb-pane">…</section>
 *   </main>
 *
 *   .layout { display: grid; grid-template-columns: var(--wb-split, 240px) 8px 1fr; }
 *
 *   new Splitter(document.querySelector('.wb-splitter'), {
 *     target: document.getElementById('files'),
 *     min: 160,
 *     max: 480,
 *     storageKey: 'filesWidth',
 *   });
 *
 * The pane it sizes (target) can sit before or after the handle: dragging
 * toward it shrinks it. Arrow keys move it 16px (Shift: 64px), Home and End
 * go to the smallest and largest, and Enter or a double-click collapses it
 * or brings it back. A collapsed pane is hidden and inert, with a size of 0;
 * clicking or dragging the handle brings it back.
 */

const KEYS = {
  vertical: { ArrowLeft: -1, ArrowRight: 1 },
  horizontal: { ArrowUp: -1, ArrowDown: 1 },
};

export class Splitter {
  /**
   * @param {HTMLElement} handle - The element between the panes (class wb-splitter)
   * @param {Object} options
   * @param {HTMLElement} options.target - The pane to size
   * @param {HTMLElement} [options.container] - Where the property goes. Default: the handle's parent.
   * @param {string} [options.property] - The custom property. Default '--wb-split'.
   * @param {'vertical'|'horizontal'} [options.orientation] - Of the handle: 'vertical' (a
   *   column between side-by-side panes; sizes the width) or 'horizontal' (sizes the
   *   height). Default 'vertical'.
   * @param {number} [options.min] - Smallest size in px. Default 120.
   * @param {number} [options.max] - Largest size in px. Default 600.
   * @param {number} [options.size] - Starting size in px, when nothing is saved.
   *   Default: the target's size now.
   * @param {number} [options.step] - Arrow key step in px. Default 16.
   * @param {boolean} [options.collapsible] - Whether it can collapse. Default true.
   * @param {string} [options.storageKey] - Remember size and collapsed state in this
   *   browser under this key. Default: not remembered.
   * @param {string} [options.label] - What the handle is called. Default 'Resize'.
   * @param {HTMLElement[]} [options.toggles] - Buttons elsewhere (outside the target) that
   *   collapse it or bring it back
   * @param {(size: number, collapsed: boolean) => void} [options.onResize] - After a change
   */
  constructor(
    handle,
    {
      target,
      container = handle.parentElement,
      property = '--wb-split',
      orientation = 'vertical',
      min = 120,
      max = 600,
      size,
      step = 16,
      collapsible = true,
      storageKey,
      label = 'Resize',
      toggles = [],
      onResize = () => {},
    },
  ) {
    Object.assign(this, { handle, target, container, property, orientation, min, max, step });
    Object.assign(this, { collapsible, storageKey, toggles, onResize });
    this.vertical = orientation === 'vertical';
    // Dragging toward the target shrinks it
    this.sign = handle.compareDocumentPosition(target) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1;

    handle.classList.add('wb-splitter');
    handle.setAttribute('role', 'separator');
    handle.setAttribute('aria-orientation', orientation);
    handle.setAttribute('aria-valuemin', String(collapsible ? 0 : min));
    handle.setAttribute('aria-valuemax', String(max));
    handle.tabIndex = 0;
    if (!handle.hasAttribute('aria-label')) handle.setAttribute('aria-label', label);
    if (target.id) handle.setAttribute('aria-controls', target.id);
    for (const button of toggles) if (target.id) button.setAttribute('aria-controls', target.id);

    const saved = this.load();
    const measured = this.vertical ? target.offsetWidth : target.offsetHeight;
    this.size = this.clamp(saved?.size ?? size ?? (measured || min));
    this.collapsed = collapsible && Boolean(saved?.collapsed);
    this.apply();

    this.cleanup = [];
    const on = (element, type, listener) => {
      element.addEventListener(type, listener);
      this.cleanup.push(() => element.removeEventListener(type, listener));
    };
    on(handle, 'pointerdown', (event) => this.startDrag(event));
    on(handle, 'keydown', (event) => this.onKey(event));
    on(handle, 'dblclick', () => this.toggle());
    for (const button of toggles) on(button, 'click', () => this.toggle());
  }

  /** @param {number} px */
  clamp(px) {
    return Math.round(Math.min(this.max, Math.max(this.min, px)));
  }

  /** Set the size in px (kept between min and max). Brings a collapsed pane back. */
  setSize(px) {
    this.size = this.clamp(px);
    this.collapsed = false;
    this.commit();
  }

  collapse() {
    if (!this.collapsible || this.collapsed) return;
    this.collapsed = true;
    this.commit();
  }

  expand() {
    if (!this.collapsed) return;
    this.collapsed = false;
    this.commit();
  }

  toggle() {
    if (this.collapsed) this.expand();
    else this.collapse();
  }

  /** Apply, remember, tell */
  commit() {
    this.apply();
    this.save();
    this.onResize(this.size, this.collapsed);
  }

  apply() {
    const shown = this.collapsed ? 0 : this.size;
    this.container.style.setProperty(this.property, `${shown}px`);
    this.handle.setAttribute('aria-valuenow', String(shown));
    this.handle.toggleAttribute('data-collapsed', this.collapsed);
    this.target.toggleAttribute('data-split-collapsed', this.collapsed);
    this.target.inert = this.collapsed;
    for (const button of this.toggles) {
      button.setAttribute('aria-expanded', String(!this.collapsed));
    }
  }

  onKey(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.toggle();
      return;
    }
    const base = this.collapsed ? 0 : this.size;
    const direction = KEYS[this.orientation][event.key];
    let next;
    if (direction) next = base + direction * this.sign * this.step * (event.shiftKey ? 4 : 1);
    else if (event.key === 'Home') next = this.min;
    else if (event.key === 'End') next = this.max;
    else return;
    event.preventDefault();
    this.setSize(next);
  }

  startDrag(event) {
    if (event.button !== 0) return;
    event.preventDefault(); // no text selection while dragging
    const start = this.vertical ? event.clientX : event.clientY;
    const from = this.collapsed ? 0 : this.size;
    let moved = false;
    this.handle.setPointerCapture?.(event.pointerId);
    this.handle.classList.add('dragging');
    const move = (e) => {
      const delta = (this.vertical ? e.clientX : e.clientY) - start;
      if (!moved && Math.abs(delta) < 3) return;
      moved = true;
      this.size = this.clamp(from + delta * this.sign);
      this.collapsed = false;
      this.apply();
    };
    const end = () => {
      this.handle.removeEventListener('pointermove', move);
      this.handle.removeEventListener('pointerup', end);
      this.handle.removeEventListener('pointercancel', end);
      this.handle.classList.remove('dragging');
      // A click on a collapsed pane's handle brings it back
      if (!moved && this.collapsed) this.expand();
      else if (moved) this.commit();
    };
    this.handle.addEventListener('pointermove', move);
    this.handle.addEventListener('pointerup', end);
    this.handle.addEventListener('pointercancel', end);
  }

  load() {
    if (!this.storageKey) return null;
    try {
      const value = JSON.parse(localStorage.getItem(this.storageKey) ?? 'null');
      return value && typeof value === 'object' ? value : null;
    } catch {
      return null;
    }
  }

  save() {
    if (!this.storageKey) return;
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({ size: this.size, collapsed: this.collapsed }),
      );
    } catch {
      // Not remembered; it still applies now
    }
  }

  destroy() {
    for (const undo of this.cleanup) undo();
    this.cleanup = [];
  }
}
