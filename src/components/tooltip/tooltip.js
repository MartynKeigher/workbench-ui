// Tooltip shown on hover and focus. Keep the text short: no links.
export class Tooltip {
  /**
   * @param {HTMLElement} element
   * @param {Object} options
   * @param {string} options.text
   * @param {'top'|'bottom'} [options.placement] - Preferred side. Default 'top'.
   */
  constructor(element, { text, placement = 'top' }) {
    this.element = element;
    this.placement = placement;
    this.tip = document.createElement('div');
    this.tip.className = 'wb-tooltip';
    this.tip.setAttribute('role', 'tooltip');
    this.tip.id = `wb-tooltip-${++Tooltip.count}`;
    this.tip.hidden = true;
    this.tip.textContent = text;
    document.body.append(this.tip);
    element.setAttribute('aria-describedby', this.tip.id);

    this.show = () => this.place();
    this.hide = () => {
      this.tip.hidden = true;
    };
    this.onKey = (event) => {
      if (event.key === 'Escape') this.hide();
    };
    for (const type of ['mouseenter', 'focus']) element.addEventListener(type, this.show);
    for (const type of ['mouseleave', 'blur']) element.addEventListener(type, this.hide);
    document.addEventListener('keydown', this.onKey);
  }

  /** @param {string} text */
  setText(text) {
    this.tip.textContent = text;
  }

  place() {
    this.tip.hidden = false;
    const box = this.element.getBoundingClientRect();
    const { width, height } = this.tip.getBoundingClientRect();
    const fitsAbove = box.top - height - 6 >= 0;
    const fitsBelow = box.bottom + height + 6 <= window.innerHeight;
    const above = this.placement === 'top' ? fitsAbove || !fitsBelow : !fitsBelow && fitsAbove;
    const left = box.left + box.width / 2 - width / 2;
    this.tip.style.left = `${Math.max(4, Math.min(left, window.innerWidth - width - 4))}px`;
    this.tip.style.top = `${above ? box.top - height - 6 : box.bottom + 6}px`;
  }

  destroy() {
    for (const type of ['mouseenter', 'focus']) this.element.removeEventListener(type, this.show);
    for (const type of ['mouseleave', 'blur']) this.element.removeEventListener(type, this.hide);
    document.removeEventListener('keydown', this.onKey);
    this.element.removeAttribute('aria-describedby');
    this.tip.remove();
  }
}

Tooltip.count = 0;

/**
 * Give every [data-tooltip] element in root a tooltip with that text.
 * @param {ParentNode} [root]
 * @returns {Tooltip[]}
 */
Tooltip.attach = (root = document) =>
  [...root.querySelectorAll('[data-tooltip]')].map(
    (element) => new Tooltip(element, { text: element.dataset.tooltip }),
  );
