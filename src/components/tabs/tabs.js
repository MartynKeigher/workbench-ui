/**
 * Tabs: a strip of tabs, one per open item, as in a browser.
 *
 * Selecting a tab tells you which; its × closes it. Tabs can be dragged into
 * a different order (or moved with Ctrl+Shift+←/→). Right-clicking a tab (or
 * Shift+F10 / the menu key on it) opens a menu: pin or unpin it, close it,
 * close the others or close those to its right, or sort the unpinned tabs
 * A to Z. Pinned tabs sit first, have no ×, and stay when others or those to
 * the right are closed.
 *
 * An optional Home tab (an icon) can sit first, always. It can't be closed,
 * moved or unpinned, and has no menu. It is active when no other tab is.
 *
 * The strip keeps no content itself: you decide what each tab id shows.
 *
 *   <nav class="wb-tabs" aria-label="Open files"></nav>
 *
 *   const tabs = new Tabs({
 *     element: document.querySelector('.wb-tabs'),
 *     onSelect: (id) => show(id),
 *     onClose: (id) => { const next = tabs.close(id); show(next); },
 *   });
 *   tabs.open('a', 'First file');
 */

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

/** @typedef {{id: string, title: string, pinned?: boolean}} Tab */

export class Tabs {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.element - The tab strip
   * @param {(id: string) => void} options.onSelect - A tab was picked
   * @param {(id: string) => void} options.onClose - A tab's × (or its menu) asked to close it.
   *   Call `close(id)` to remove it.
   * @param {() => void} [options.onHome] - The Home tab was picked
   * @param {string} [options.homeTitle] - Tooltip of the Home tab. Default 'Home'.
   * @param {string} [options.menuLabel] - Accessible name of the tab menu. Default 'Tab'.
   */
  constructor({
    element,
    onSelect,
    onClose,
    onHome = () => {},
    homeTitle = 'Home',
    menuLabel = 'Tab',
  }) {
    this.element = element;
    this.onSelect = onSelect;
    this.onClose = onClose;
    this.homeTitle = homeTitle;
    /** Whether the Home tab shows */
    this.home = false;
    /** @type {Tab[]} */
    this.tabs = [];
    /** @type {string|null} */
    this.activeId = null;
    this.draggedId = null;
    this.menu = this.createMenu(menuLabel);

    const on = (target, type, handler, options) => {
      target.addEventListener(type, handler, options);
      this.cleanup.push(() => target.removeEventListener(type, handler, options));
    };
    /** @type {(() => void)[]} */
    this.cleanup = [];

    on(element, 'contextmenu', (event) => {
      const tab = event.target.closest('.wb-tab[data-tab-id]');
      if (!tab) return;
      event.preventDefault();
      // From the keyboard there's no pointer: open it under the tab
      const box = tab.getBoundingClientRect();
      const fromKeys = event.button !== 2 || (!event.clientX && !event.clientY);
      this.openMenu(
        tab.dataset.tabId,
        fromKeys ? box.left : event.clientX,
        fromKeys ? box.bottom : event.clientY,
      );
    });

    on(element, 'click', (event) => {
      if (event.target.closest('.wb-tab-home')) {
        onHome();
        return;
      }
      const tab = event.target.closest('.wb-tab[data-tab-id]');
      if (!tab) return;
      if (event.target.closest('.wb-tab-close')) onClose(tab.dataset.tabId);
      else onSelect(tab.dataset.tabId);
    });

    // Drag a tab to reorder: it drops before or after the tab under the
    // pointer, whichever half the pointer is over
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

    // Any press elsewhere, a scroll or a resize closes the menu
    const dismiss = () => this.closeMenu(false);
    on(document, 'pointerdown', (event) => {
      if (!this.menu.hidden && !this.menu.contains(event.target)) dismiss();
    });
    on(window, 'resize', dismiss);
    on(window, 'blur', dismiss);
    on(document, 'scroll', dismiss, true);

    this.render();
  }

  /** The menu a tab's right-click opens; one, shared by every tab */
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

  /**
   * Open the menu for a tab at a point on screen.
   * @param {string} id
   * @param {number} x
   * @param {number} y
   */
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
    // Kept on screen
    const { width, height } = this.menu.getBoundingClientRect();
    this.menu.style.left = `${Math.max(4, Math.min(x, window.innerWidth - width - 4))}px`;
    this.menu.style.top = `${Math.max(4, Math.min(y, window.innerHeight - height - 4))}px`;
    item('pin').focus();
  }

  /** @param {boolean} refocus - Put the focus back on the tab the menu was for */
  closeMenu(refocus) {
    if (this.menu.hidden) return;
    this.menu.hidden = true;
    if (refocus) this.focusTab(this.menuTabId);
  }

  /** @param {string} id */
  focusTab(id) {
    this.tabElement(id)?.querySelector('.wb-tab-select')?.focus();
  }

  /**
   * @param {string} id
   * @returns {HTMLElement|undefined} The tab's element in the strip
   */
  tabElement(id) {
    return [...this.element.querySelectorAll('.wb-tab[data-tab-id]')].find(
      (tab) => tab.dataset.tabId === id,
    );
  }

  /**
   * Do what a menu item says, for a tab.
   * @param {'pin'|'close'|'others'|'right'|'sort'} action
   * @param {string} id
   */
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
      // The tab the menu was for stays on show, so no closed tab is shown on the way
      if (closing.includes(this.activeId)) this.onSelect(id);
      closing.forEach((other) => this.onClose(other));
      this.focusTab(id);
    }
  }

  /** Put the unpinned tabs in A to Z order by title; pinned tabs keep theirs */
  sortUnpinned() {
    const byTitle = (a, b) =>
      a.title.localeCompare(b.title, undefined, { sensitivity: 'base', numeric: true });
    this.tabs = [
      ...this.tabs.filter((tab) => tab.pinned),
      ...this.tabs.filter((tab) => !tab.pinned).sort(byTitle),
    ];
    this.render();
  }

  /**
   * Pin a tab (it moves to the end of the pinned tabs, at the start) or unpin
   * it (it goes just after them).
   * @param {string} id
   */
  togglePin(id) {
    const index = this.tabs.findIndex((tab) => tab.id === id);
    if (index === -1) return;
    const [tab] = this.tabs.splice(index, 1);
    tab.pinned = !tab.pinned;
    const firstUnpinned = this.tabs.findIndex((t) => !t.pinned);
    this.tabs.splice(firstUnpinned === -1 ? this.tabs.length : firstUnpinned, 0, tab);
    this.render();
  }

  /**
   * Where a dragged tab would drop: beside the tab under the pointer.
   * @param {DragEvent} event
   * @returns {{id: string, after: boolean}|null} Null when no tab is being dragged
   */
  dropTarget(event) {
    if (!this.draggedId) return null;
    const tab = event.target.closest?.('.wb-tab[data-tab-id]');
    if (!tab || tab.dataset.tabId === this.draggedId) return null;
    const box = tab.getBoundingClientRect();
    return { id: tab.dataset.tabId, after: event.clientX > box.left + box.width / 2 };
  }

  /** Show where a drop would land, or clear it with null. */
  markDrop(drop) {
    this.element.querySelectorAll('.drop-before, .drop-after').forEach((tab) => {
      tab.classList.remove('drop-before', 'drop-after');
    });
    if (!drop) return;
    this.tabElement(drop.id)?.classList.add(drop.after ? 'drop-after' : 'drop-before');
  }

  /**
   * Move a tab next to another.
   * @param {string} id - The tab to move
   * @param {string} targetId - The tab to put it beside
   * @param {boolean} after - After the target, else before it
   */
  move(id, targetId, after) {
    const from = this.tabs.findIndex((tab) => tab.id === id);
    if (from === -1 || id === targetId) return;
    const [tab] = this.tabs.splice(from, 1);
    const to = this.tabs.findIndex((t) => t.id === targetId);
    if (to === -1) this.tabs.splice(from, 0, tab);
    else this.tabs.splice(after ? to + 1 : to, 0, tab);
    // Pinned tabs stay first, whatever was moved past them
    this.tabs = [...this.tabs.filter((t) => t.pinned), ...this.tabs.filter((t) => !t.pinned)];
    this.render();
  }

  /**
   * Add a tab (or retitle an existing one) and make it the active tab.
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
   * Remove a tab.
   * @param {string} id
   * @returns {string|null} The tab to show next when the active tab was closed, else null
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

  /**
   * Show or hide the Home tab.
   * @param {boolean} show
   */
  setHome(show) {
    if (show === this.home) return;
    this.home = show;
    this.render();
  }

  /**
   * Make a tab the active one, or none (null: Home is active).
   * @param {string|null} id
   */
  activate(id) {
    this.activeId = id;
    this.render();
  }

  /** @param {string} id */
  has(id) {
    return this.tabs.some((tab) => tab.id === id);
  }

  render() {
    this.element.hidden = this.tabs.length === 0 && !this.home;
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
          // A pinned tab shows a pin and no ×; its menu still closes it
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

  /** Remove the menu and every listener this strip added */
  destroy() {
    this.cleanup.forEach((undo) => undo());
    this.cleanup = [];
    this.menu.remove();
  }
}
