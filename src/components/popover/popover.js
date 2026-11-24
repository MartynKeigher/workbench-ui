// Positions a popover next to its button. The browser handles Escape and outside clicks.
export class Popover {
  /**
   * @param {HTMLButtonElement} button - The button with popovertarget
   * @param {HTMLElement} panel - The element with the popover attribute
   */
  constructor(button, panel) {
    this.button = button;
    this.panel = panel;
    this.onToggle = (event) => {
      const open = event.newState === 'open';
      button.setAttribute('aria-expanded', String(open));
      if (open) this.place();
    };
    button.setAttribute('aria-expanded', 'false');
    panel.addEventListener('toggle', this.onToggle);
  }

  place() {
    const box = this.button.getBoundingClientRect();
    const { width, height } = this.panel.getBoundingClientRect();
    const below = box.bottom + 6 + height <= window.innerHeight;
    this.panel.style.left = `${Math.max(8, Math.min(box.left, window.innerWidth - width - 8))}px`;
    this.panel.style.top = `${below ? box.bottom + 6 : Math.max(8, box.top - height - 6)}px`;
  }

  destroy() {
    this.panel.removeEventListener('toggle', this.onToggle);
  }
}
