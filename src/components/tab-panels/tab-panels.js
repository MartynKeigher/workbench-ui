// In-page tabs over panels. Arrow keys, Home and End move between tabs.
export class TabPanels {
  /**
   * @param {HTMLElement} tablist - The element with role="tablist"
   * @param {Object} [options]
   * @param {(tab: HTMLElement, panel: HTMLElement) => void} [options.onChange]
   */
  constructor(tablist, { onChange = () => {} } = {}) {
    this.tablist = tablist;
    this.onChange = onChange;
    this.tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const selected = this.tabs.find((tab) => tab.getAttribute('aria-selected') === 'true');
    this.show(selected ?? this.tabs[0]);

    this.onClick = (event) => {
      const tab = event.target.closest('[role="tab"]');
      if (tab && this.tabs.includes(tab)) this.select(tab);
    };
    this.onKey = (event) => {
      const at = this.tabs.indexOf(document.activeElement);
      if (at === -1) return;
      const count = this.tabs.length;
      const next = {
        ArrowRight: (at + 1) % count,
        ArrowLeft: (at - 1 + count) % count,
        Home: 0,
        End: count - 1,
      }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      this.select(this.tabs[next]);
      this.tabs[next].focus();
    };
    tablist.addEventListener('click', this.onClick);
    tablist.addEventListener('keydown', this.onKey);
  }

  /** @param {HTMLElement|number} tab - A tab, or its index */
  select(tab) {
    const target = typeof tab === 'number' ? this.tabs[tab] : tab;
    if (!target || target === this.selected) return;
    this.show(target);
    this.onChange(target, this.panelOf(target));
  }

  show(target) {
    this.selected = target;
    for (const tab of this.tabs) {
      const on = tab === target;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      const panel = this.panelOf(tab);
      if (panel) panel.hidden = !on;
    }
  }

  panelOf(tab) {
    return document.getElementById(tab.getAttribute('aria-controls'));
  }

  destroy() {
    this.tablist.removeEventListener('click', this.onClick);
    this.tablist.removeEventListener('keydown', this.onKey);
  }
}
