// Browser-style tabs with pinning, drag to reorder and a right-click menu.

const HOME_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"></path><path d="M5 9.5V20h5v-6h4v6h5V9.5"></path></svg>`;

const MENU_ITEMS = [
  ['pin', 'Pin Tab'],
  ['close', 'Close Tab'],
  ['others', 'Close other tabs'],
  ['right', 'Close tabs to the right'],
  ['sort', 'Sort Tabs Alphabetically'],
];

const escapeHtml = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

export class Tabs {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.element - The tab strip
   * @param {(id: string) => void} options.onSelect - A tab was picked
   * @param {(id: string) => void} options.onClose - A tab's × (or its menu) asked to close it. Call `close(id)` to remove it.
   * @param {() => void} [options.onHome] - The Home tab was picked
   * @param {string} [options.homeTitle] - Tooltip of the Home tab. Default 'Home'.
   * @param {string} [options.menuLabel] - Accessible name of the tab menu. Default 'Tab'.
   * @param {{text: string, action?: string, onAction?: () => void}} [options.empty] - What the strip shows with no tabs open, with an optional button. Without it the strip hides.
   */
  constructor({
    element,
    onSelect,
    onClose,
    onHome = () => {},
    homeTitle = 'Home',
    menuLabel = 'Tab',
    empty = null,
  }) {
    this.element = element;
    this.onSelect = onSelect;
    this.onClose = onClose;
    this.homeTitle = homeTitle;
    this.empty = empty;
    this.home = false;
    this.tabs = [];
    this.activeId = null;
    this.draggedId = null;
    this.menu = this.createMenu(menuLabel);

    const on = (target, type, handler, options) => {
      target.addEventListener(type, handler, options);
      this.cleanup.push(() => target.removeEventListener(type, handler, options));
    };
    this.cleanup = [];

    on(element, 'contextmenu', (event) => {
      const tab = event.target.closest('.wb-tab[data-tab-id]');
      if (!tab) return;
      event.preventDefault();
      // Opened from the keyboard: no pointer position, so anchor under the tab
      const box = tab.getBoundingClientRect();
      const fromKeys = event.button !== 2 || (!event.clientX && !event.clientY);
      this.openMenu(
        tab.dataset.tabId,
        fromKeys ? box.left : event.clientX,
        fromKeys ? box.bottom : event.clientY,
      );
    });

    on(element, 'click', (event) => {
      if (event.target.closest('.wb-tabs-empty button')) {
        this.empty.onAction?.();
        return;
      }
      if (event.target.closest('.wb-tab-home')) {
        onHome();
        return;
      }
      const tab = event.target.closest('.wb-tab[data-tab-id]');
      if (!tab) return;
      if (event.target.closest('.wb-tab-close')) onClose(tab.dataset.tabId);
      else onSelect(tab.dataset.tabId);
    });

    // Drag to reorder
    on(element, 'dragstart', (event) => {
      const tab = event.target.closest('.wb-tab[data-tab-id]');
      if (!tab) return;
      this.draggedId = tab.dataset.tabId;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', tab.dataset.tabId);
      tab.classList.add('dragging');
    });
    on(element, 'dragover', (event) => {
      const drop = this.dropTarget(event);
      if (!drop) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      this.markDrop(drop);
    });
    on(element, 'dragleave', (event) => {
      if (!element.contains(event.relatedTarget)) this.markDrop(null);
    });
    on(element, 'drop', (event) => {
      const drop = this.dropTarget(event);
      if (!drop) return;
      event.preventDefault();
      this.move(this.draggedId, drop.id, drop.after);
    });
    on(element, 'dragend', () => {
      this.draggedId = null;
      this.render();
    });

    on(element, 'keydown', (event) => {
      if (!event.ctrlKey || !event.shiftKey) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      const tab = event.target.closest('.wb-tab[data-tab-id]');
      if (!tab) return;
      event.preventDefault();
      const index = this.tabs.findIndex((t) => t.id === tab.dataset.tabId);
      const other = this.tabs[index + (event.key === 'ArrowLeft' ? -1 : 1)];
      if (!other) return;
      this.move(tab.dataset.tabId, other.id, event.key === 'ArrowRight');
      this.focusTab(tab.dataset.tabId);
    });

    // Close the menu on outside click, scroll, resize or blur
    const dismiss = () => this.closeMenu(false);
    on(document, 'pointerdown', (event) => {
      if (!this.menu.hidden && !this.menu.contains(event.target)) dismiss();
    });
    on(window, 'resize', dismiss);
    on(window, 'blur', dismiss);
    on(document, 'scroll', dismiss, true);

    this.render();
  }

  // One menu shared by all tabs
  createMenu(label) {
    const menu = document.createElement('div');
    menu.className = 'wb-tab-menu';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', label);
    menu.hidden = true;
    menu.innerHTML = MENU_ITEMS.map(
      ([action, text]) =>
        `<button type="button" role="menuitem" tabindex="-1" data-tab-action="${action}">${text}</button>`,
    ).join('');
    document.body.append(menu);

    menu.addEventListener('click', (event) => {
      const item = event.target.closest('[data-tab-action]');
      if (!item || item.disabled) return;
      const id = this.menuTabId;
      this.closeMenu(false);
      this.act(item.dataset.tabAction, id);
    });
    menu.addEventListener('keydown', (event) => {
      const items = [...menu.querySelectorAll('[role="menuitem"]:not(:disabled)')];
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
        this.closeMenu(true);
      } else if (event.key === 'Tab') {
        this.closeMenu(false);
      }
    });
    return menu;
  }

  openMenu(id, x, y) {
    const index = this.tabs.findIndex((tab) => tab.id === id);
    if (index === -1) return;
    this.menuTabId = id;
    const item = (action) => this.menu.querySelector(`[data-tab-action="${action}"]`);
    item('pin').textContent = this.tabs[index].pinned ? 'Unpin Tab' : 'Pin Tab';
    item('others').disabled = !this.tabs.some((tab) => tab.id !== id && !tab.pinned);
    item('right').disabled = !this.tabs.slice(index + 1).some((tab) => !tab.pinned);
    item('sort').disabled = this.tabs.filter((tab) => !tab.pinned).length < 2;
    this.menu.hidden = false;
    // Clamp to the viewport
    const { width, height } = this.menu.getBoundingClientRect();
    this.menu.style.left = `${Math.max(4, Math.min(x, window.innerWidth - width - 4))}px`;
    this.menu.style.top = `${Math.max(4, Math.min(y, window.innerHeight - height - 4))}px`;
    item('pin').focus();
  }

  closeMenu(refocus) {
    if (this.menu.hidden) return;
    this.menu.hidden = true;
    if (refocus) this.focusTab(this.menuTabId);
  }

  focusTab(id) {
    this.tabElement(id)?.querySelector('.wb-tab-select')?.focus();
  }

  tabElement(id) {
    return [...this.element.querySelectorAll('.wb-tab[data-tab-id]')].find(
      (tab) => tab.dataset.tabId === id,
    );
  }

  act(action, id) {
    const index = this.tabs.findIndex((tab) => tab.id === id);
    if (index === -1) return;
    if (action === 'pin') {
      this.togglePin(id);
      this.focusTab(id);
    } else if (action === 'close') {
      this.onClose(id);
    } else if (action === 'sort') {
      this.sortUnpinned();
      this.focusTab(id);
    } else {
      const others = action === 'others' ? this.tabs : this.tabs.slice(index + 1);
      const closing = others.filter((tab) => tab.id !== id && !tab.pinned).map((tab) => tab.id);
      // Select the kept tab first so a closing one never flashes up
      if (closing.includes(this.activeId)) this.onSelect(id);
      closing.forEach((other) => this.onClose(other));
      this.focusTab(id);
    }
  }

  // Pinned tabs keep their order
  sortUnpinned() {
    const byTitle = (a, b) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: 'base', numeric: true });
    this.tabs = [
      ...this.tabs.filter((tab) => tab.pinned),
      ...this.tabs.filter((tab) => !tab.pinned).sort(byTitle),
    ];
    this.render();
  }

  // Moves the tab to the edge of the pinned group
  togglePin(id) {
    const index = this.tabs.findIndex((tab) => tab.id === id);
    if (index === -1) return;
    const [tab] = this.tabs.splice(index, 1);
    tab.pinned = !tab.pinned;
    const firstUnpinned = this.tabs.findIndex((t) => !t.pinned);
    this.tabs.splice(firstUnpinned === -1 ? this.tabs.length : firstUnpinned, 0, tab);
    this.render();
  }

  // Which tab we're over, and which half of it
  dropTarget(event) {
    if (!this.draggedId) return null;
    const tab = event.target.closest?.('.wb-tab[data-tab-id]');
    if (!tab || tab.dataset.tabId === this.draggedId) return null;
    const box = tab.getBoundingClientRect();
    return { id: tab.dataset.tabId, after: event.clientX > box.left + box.width / 2 };
  }

  markDrop(drop) {
    this.element.querySelectorAll('.drop-before, .drop-after').forEach((tab) => {
      tab.classList.remove('drop-before', 'drop-after');
    });
    if (!drop) return;
    this.tabElement(drop.id)?.classList.add(drop.after ? 'drop-after' : 'drop-before');
  }

  move(id, targetId, after) {
    const from = this.tabs.findIndex((tab) => tab.id === id);
    if (from === -1 || id === targetId) return;
    const [tab] = this.tabs.splice(from, 1);
    const to = this.tabs.findIndex((t) => t.id === targetId);
    if (to === -1) this.tabs.splice(from, 0, tab);
    else this.tabs.splice(after ? to + 1 : to, 0, tab);
    // Keep pinned tabs first
    this.tabs = [...this.tabs.filter((t) => t.pinned), ...this.tabs.filter((t) => !t.pinned)];
    this.render();
  }

  /**
   * Add a tab (or retitle an existing one) and activate it.
   * @param {string} id
   * @param {string} title
   */
  open(id, title) {
    const existing = this.tabs.find((tab) => tab.id === id);
    if (existing) existing.title = title;
    else this.tabs.push({ id, title });
    this.activeId = id;
    this.render();
  }

  /**
   * @param {string} id
   * @returns {string|null} Tab to show next if the active tab was closed, else null
   */
  close(id) {
    const index = this.tabs.findIndex((tab) => tab.id === id);
    if (index === -1) return null;
    this.tabs.splice(index, 1);
    let next = null;
    if (this.activeId === id) {
      next = (this.tabs[index] ?? this.tabs[index - 1])?.id ?? null;
      this.activeId = next;
    }
    this.render();
    return next;
  }

  /** @param {boolean} show */
  setHome(show) {
    if (show === this.home) return;
    this.home = show;
    this.render();
  }

  /** @param {string|null} id - null makes Home active */
  activate(id) {
    this.activeId = id;
    this.render();
  }

  has(id) {
    return this.tabs.some((tab) => tab.id === id);
  }

  render() {
    const none = this.tabs.length === 0 && !this.home;
    this.element.hidden = none && !this.empty;
    if (none && this.empty) {
      const { text, action } = this.empty;
      const button = action ? ` <button type="button">${escapeHtml(action)}</button>` : '';
      this.element.innerHTML = `<p class="wb-tabs-empty">${escapeHtml(text)}${button}</p>`;
      return;
    }
    const homeActive = this.home && !this.activeId;
    const home = this.home
      ? `<div class="wb-tab-home${homeActive ? ' active' : ''}"><button type="button" class="wb-tab-home-select" aria-label="Home" title="${escapeHtml(this.homeTitle)}"${homeActive ? ' aria-current="page"' : ''}>${HOME_ICON}</button></div>`
      : '';
    this.element.innerHTML =
      home +
      this.tabs
        .map(({ id, title, pinned }) => {
          const active = id === this.activeId;
          const name = escapeHtml(title);
          const pin = pinned ? '<span class="wb-tab-pin" aria-hidden="true"></span>' : '';
          const close = pinned
            ? ''
            : `<button type="button" class="wb-tab-close" aria-label="Close ${name}">×</button>`;
          return `<div class="wb-tab${active ? ' active' : ''}${pinned ? ' pinned' : ''}" data-tab-id="${escapeHtml(id)}" draggable="true">
            <button type="button" class="wb-tab-select" title="${name}${pinned ? ' (pinned)' : ''}"${active ? ' aria-current="page"' : ''}>${pin}${name}</button>
            ${close}
          </div>`;
        })
        .join('');
  }

  /** Remove the menu and all listeners */
  destroy() {
    this.cleanup.forEach((undo) => undo());
    this.cleanup = [];
    this.menu.remove();
  }
}
