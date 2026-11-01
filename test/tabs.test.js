import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tabs } from '../src/components/tabs/tabs.js';

const titles = (strip) => [...strip.querySelectorAll('.wb-tab-select')].map((b) => b.textContent);

describe('Tabs', () => {
  let strip, tabs, onSelect, onClose, onHome;
  beforeEach(() => {
    document.body.innerHTML = '<nav class="wb-tabs"></nav>';
    strip = document.querySelector('.wb-tabs');
    onSelect = vi.fn();
    onClose = vi.fn((id) => tabs.close(id));
    onHome = vi.fn();
    tabs = new Tabs({ element: strip, onSelect, onClose, onHome, homeTitle: 'Overview' });
  });
  afterEach(() => tabs.destroy());

  it('is hidden with no tabs and no Home', () => {
    expect(strip.hidden).toBe(true);
    tabs.open('a', 'Alpha');
    expect(strip.hidden).toBe(false);
  });

  it('opens tabs, makes the newest active, and retitles an open one', () => {
    tabs.open('a', 'Alpha');
    tabs.open('b', 'Beta');
    tabs.open('a', 'Alpha 2');
    expect(titles(strip)).toEqual(['Alpha 2', 'Beta']);
    expect(strip.querySelector('.wb-tab.active').dataset.tabId).toBe('a');
    expect(strip.querySelector('.active .wb-tab-select').getAttribute('aria-current')).toBe('page');
  });

  it('closing the active tab hands back the next one to show', () => {
    tabs.open('a', 'A');
    tabs.open('b', 'B');
    tabs.open('c', 'C');
    tabs.activate('b');
    expect(tabs.close('b')).toBe('c');
    expect(tabs.close('c')).toBe('a');
    expect(tabs.close('zzz')).toBeNull();
  });

  it('clicks select a tab, or close it with its ×', () => {
    tabs.open('a', 'A');
    strip.querySelector('.wb-tab-select').click();
    expect(onSelect).toHaveBeenCalledWith('a');
    strip.querySelector('.wb-tab-close').click();
    expect(onClose).toHaveBeenCalledWith('a');
    expect(tabs.has('a')).toBe(false);
  });

  it('escapes titles and ids', () => {
    tabs.open('"><x', '<img src=x>');
    expect(strip.querySelector('img')).toBeNull();
    expect(titles(strip)).toEqual(['<img src=x>']);
    expect(strip.querySelector('.wb-tab').dataset.tabId).toBe('"><x');
  });

  it('a Home tab sits first, active when no other tab is', () => {
    tabs.open('a', 'A');
    tabs.setHome(true);
    expect(strip.firstElementChild.classList.contains('wb-tab-home')).toBe(true);
    tabs.activate(null);
    const home = strip.querySelector('.wb-tab-home');
    expect(home.classList.contains('active')).toBe(true);
    expect(home.querySelector('button').title).toBe('Overview');
    home.querySelector('button').click();
    expect(onHome).toHaveBeenCalled();
  });

  it('pinning moves a tab first, drops its × and keeps it first when moved past', () => {
    tabs.open('a', 'A');
    tabs.open('b', 'B');
    tabs.open('c', 'C');
    tabs.togglePin('c');
    expect(titles(strip)).toEqual(['C', 'A', 'B']);
    expect(strip.querySelector('[data-tab-id="c"] .wb-tab-close')).toBeNull();
    expect(strip.querySelector('[data-tab-id="c"] .wb-tab-pin')).not.toBeNull();
    tabs.move('b', 'c', false);
    expect(titles(strip)).toEqual(['C', 'B', 'A']);
    tabs.togglePin('c');
    expect(titles(strip)).toEqual(['C', 'B', 'A']);
  });

  it('sorts unpinned tabs A to Z, numbers in order', () => {
    tabs.open('3', 'item 10');
    tabs.open('1', 'Item 2');
    tabs.open('2', 'apple');
    tabs.sortUnpinned();
    expect(titles(strip)).toEqual(['apple', 'Item 2', 'item 10']);
  });

  it('Ctrl+Shift+arrow moves a tab', () => {
    tabs.open('a', 'A');
    tabs.open('b', 'B');
    const select = strip.querySelector('[data-tab-id="a"] .wb-tab-select');
    select.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
      }),
    );
    expect(titles(strip)).toEqual(['B', 'A']);
  });

  describe('menu', () => {
    const menu = () => document.querySelector('.wb-tab-menu');
    const item = (action) => menu().querySelector(`[data-tab-action="${action}"]`);

    beforeEach(() => {
      ['a', 'b', 'c', 'd'].forEach((id) => tabs.open(id, id.toUpperCase()));
    });

    it('opens on right-click with the actions that apply', () => {
      strip
        .querySelector('[data-tab-id="d"]')
        .dispatchEvent(
          new MouseEvent('contextmenu', { bubbles: true, button: 2, clientX: 5, clientY: 5 }),
        );
      expect(menu().hidden).toBe(false);
      expect(item('right').disabled).toBe(true);
      expect(item('others').disabled).toBe(false);
      expect(document.activeElement).toBe(item('pin'));
    });

    it('closes others, but not pinned ones, and keeps the tab on show', () => {
      tabs.togglePin('a');
      tabs.activate('c');
      tabs.openMenu('b', 0, 0);
      item('others').click();
      expect(onSelect).toHaveBeenCalledWith('b');
      expect(titles(strip)).toEqual(['A', 'B']);
      expect(menu().hidden).toBe(true);
    });

    it('closes tabs to the right', () => {
      tabs.openMenu('b', 0, 0);
      item('right').click();
      expect(titles(strip)).toEqual(['A', 'B']);
    });

    it('pins and unpins from the menu', () => {
      tabs.openMenu('c', 0, 0);
      item('pin').click();
      expect(titles(strip)[0]).toBe('C');
      tabs.openMenu('c', 0, 0);
      expect(item('pin').textContent).toBe('Unpin Tab');
    });

    it('Escape closes it and puts focus back on the tab', () => {
      tabs.openMenu('b', 0, 0);
      menu().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(menu().hidden).toBe(true);
      expect(document.activeElement).toBe(strip.querySelector('[data-tab-id="b"] .wb-tab-select'));
    });

    it('a press elsewhere closes it', () => {
      tabs.openMenu('b', 0, 0);
      document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
      expect(menu().hidden).toBe(true);
    });
  });

  it('destroy removes the menu', () => {
    tabs.destroy();
    expect(document.querySelector('.wb-tab-menu')).toBeNull();
    tabs = new Tabs({ element: strip, onSelect, onClose });
  });
});
