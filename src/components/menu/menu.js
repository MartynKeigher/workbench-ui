// Dropdown menu opened from a button.
// Items: { id, label, danger?, disabled? }, or '-' for a separator.
export class Menu {
  /**
   * @param {HTMLButtonElement} button
   * @param {Object} options
   * @param {Array<{id: string, label: string, danger?: boolean, disabled?: boolean}|'-'>} options.items
   * @param {(id: string) => void} options.onSelect
   * @param {string} [options.label] - Accessible name. Default: the button's text.
   */
  constructor(button, { items, onSelect, label }) {
    this.button = button;
    this.onSelect = onSelect;
    this.menu = document.createElement('div');
    this.menu.className = 'wb-menu';
    this.menu.setAttribute('role', 'menu');
    this.menu.setAttribute('aria-label', label ?? button.textContent.trim());
    this.menu.hidden = true;
    this.menu.id = `wb-menu-${++Menu.count}`;
    this.setItems(items);
    document.body.append(this.menu);

    button.setAttribute('aria-haspopup', 'menu');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', this.menu.id);

    this.cleanup = [];
    const on = (target, type, handler, options) => {
      target.addEventListener(type, handler, options);
      this.cleanup.push(() => target.removeEventListener(type, handler, options));
    };
    on(button, 'click', () => (this.menu.hidden ? this.open() : this.close(false)));
    on(button, 'keydown', (event) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      event.preventDefault();
      this.open(event.key === 'ArrowUp' ? -1 : 0);
    });
    on(this.menu, 'click', (event) => {
      const item = event.target.closest('[role="menuitem"]');
      if (!item || item.disabled) return;
      this.close(true);
      this.onSelect(item.dataset.id);
    });
    on(this.menu, 'keydown', (event) => this.onKey(event));
    on(document, 'pointerdown', (event) => {
      if (
        !this.menu.hidden &&
        !this.menu.contains(event.target) &&
        !button.contains(event.target)
      ) {
        this.close(false);
      }
    });
    on(window, 'resize', () => this.close(false));
    on(document, 'scroll', () => this.close(false), true);
  }

  /** Replace the items. */
  setItems(items) {
    this.menu.replaceChildren(
      ...items.map((item) => {
        if (item === '-') {
          const line = document.createElement('div');
          line.setAttribute('role', 'separator');
          return line;
        }
        const el = document.createElement('button');
        el.type = 'button';
        el.setAttribute('role', 'menuitem');
        el.tabIndex = -1;
        el.dataset.id = item.id;
        el.textContent = item.label;
        el.disabled = Boolean(item.disabled);
        if (item.danger) el.classList.add('wb-menu-danger');
        return el;
      }),
    );
  }

  items() {
    return [...this.menu.querySelectorAll('[role="menuitem"]:not(:disabled)')];
  }

  /** @param {number} [focusIndex] - Item to focus; -1 for the last */
  open(focusIndex = 0) {
    this.menu.hidden = false;
    this.button.setAttribute('aria-expanded', 'true');
    const box = this.button.getBoundingClientRect();
    const { width, height } = this.menu.getBoundingClientRect();
    const below = box.bottom + 4 + height <= window.innerHeight;
    this.menu.style.left = `${Math.max(4, Math.min(box.left, window.innerWidth - width - 4))}px`;
    this.menu.style.top = `${below ? box.bottom + 4 : Math.max(4, box.top - height - 4)}px`;
    this.items().at(focusIndex)?.focus();
  }

  /** @param {boolean} refocus - Put focus back on the button */
  close(refocus) {
    if (this.menu.hidden) return;
    this.menu.hidden = true;
    this.button.setAttribute('aria-expanded', 'false');
    if (refocus) this.button.focus();
  }

  onKey(event) {
    const items = this.items();
    const at = items.indexOf(document.activeElement);
    const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
    if (step) {
      event.preventDefault();
      items[(at + step + items.length) % items.length]?.focus();
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      (event.key === 'Home' ? items[0] : items.at(-1))?.focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.close(true);
    } else if (event.key === 'Tab') {
      this.close(false);
    }
  }

  destroy() {
    this.cleanup.forEach((undo) => undo());
    this.cleanup = [];
    this.menu.remove();
  }
}

Menu.count = 0;
