import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Menu } from '../src/components/menu/menu.js';

describe('Menu', () => {
  let button;
  let menu;
  let onSelect;
  const key = (target, name) =>
    target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
  const items = () => [...document.querySelectorAll('.wb-menu [role="menuitem"]')];

  beforeEach(() => {
    document.body.innerHTML = '<button type="button">Actions</button>';
    button = document.querySelector('button');
    onSelect = vi.fn();
    menu = new Menu(button, {
      items: [
        { id: 'rename', label: 'Rename' },
        { id: 'move', label: 'Move', disabled: true },
        '-',
        { id: 'delete', label: 'Delete', danger: true },
      ],
      onSelect,
    });
  });

  afterEach(() => menu.destroy());

  it('starts closed and wires the button to it', () => {
    const el = document.querySelector('.wb-menu');
    expect(el.hidden).toBe(true);
    expect(el.getAttribute('aria-label')).toBe('Actions');
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
    expect(button.getAttribute('aria-controls')).toBe(el.id);
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('builds items, a separator and a danger item', () => {
    expect(items().map((i) => i.textContent)).toEqual(['Rename', 'Move', 'Delete']);
    expect(document.querySelectorAll('.wb-menu [role="separator"]')).toHaveLength(1);
    expect(items()[2].classList.contains('wb-menu-danger')).toBe(true);
  });

  it('opens on click with focus on the first item', () => {
    button.click();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement.textContent).toBe('Rename');
  });

  it('skips disabled items with the arrow keys and wraps', () => {
    button.click();
    key(document.activeElement, 'ArrowDown');
    expect(document.activeElement.textContent).toBe('Delete');
    key(document.activeElement, 'ArrowDown');
    expect(document.activeElement.textContent).toBe('Rename');
  });

  it('reports the chosen item, closes and refocuses the button', () => {
    button.click();
    items()[2].click();
    expect(onSelect).toHaveBeenCalledWith('delete');
    expect(document.querySelector('.wb-menu').hidden).toBe(true);
    expect(document.activeElement).toBe(button);
  });

  it('ignores disabled items', () => {
    button.click();
    items()[1].click();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('closes on Escape, back to the button', () => {
    button.click();
    key(document.activeElement, 'Escape');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(button);
  });

  it('opens on ArrowUp with focus on the last item', () => {
    key(button, 'ArrowUp');
    expect(document.activeElement.textContent).toBe('Delete');
  });

  it('removes the menu on destroy', () => {
    menu.destroy();
    expect(document.querySelector('.wb-menu')).toBeNull();
  });
});
