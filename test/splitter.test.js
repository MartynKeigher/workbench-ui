import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Splitter } from '../src/components/splitter/splitter.js';

const key = (element, name, init = {}) =>
  element.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, ...init }));
const pointer = (element, type, clientX) =>
  element.dispatchEvent(new PointerEvent(type, { clientX, clientY: 0, button: 0, bubbles: true }));

describe('Splitter', () => {
  let layout, files, handle, doc, splitter, onResize;
  const size = () => layout.style.getPropertyValue('--wb-split');

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `<main><aside id="files"></aside><div class="h"></div><section></section></main>
      <button id="toggle">Files</button>`;
    layout = document.querySelector('main');
    [files, handle, doc] = layout.children;
    onResize = vi.fn();
  });
  afterEach(() => splitter?.destroy());

  const make = (options = {}) => {
    splitter = new Splitter(handle, {
      target: files,
      size: 200,
      min: 100,
      max: 400,
      onResize,
      ...options,
    });
    return splitter;
  };

  it('makes the handle a focusable separator and writes the size', () => {
    make();
    expect(handle.classList).toContain('wb-splitter');
    expect(handle.getAttribute('role')).toBe('separator');
    expect(handle.getAttribute('aria-orientation')).toBe('vertical');
    expect(handle.getAttribute('aria-controls')).toBe('files');
    expect(handle.getAttribute('aria-label')).toBe('Resize');
    expect(handle.tabIndex).toBe(0);
    expect(handle.getAttribute('aria-valuenow')).toBe('200');
    expect(handle.getAttribute('aria-valuemax')).toBe('400');
    expect(size()).toBe('200px');
  });

  it('moves with the arrow keys, Shift for bigger steps, Home and End', () => {
    make();
    key(handle, 'ArrowRight');
    expect(size()).toBe('216px');
    key(handle, 'ArrowLeft', { shiftKey: true });
    expect(size()).toBe('152px');
    key(handle, 'End');
    expect(size()).toBe('400px');
    key(handle, 'Home');
    expect(size()).toBe('100px');
    key(handle, 'ArrowLeft');
    expect(size()).toBe('100px'); // not below min
    expect(onResize).toHaveBeenLastCalledWith(100, false);
  });

  it('reverses for a pane after the handle', () => {
    splitter = new Splitter(handle, { target: doc, size: 300, min: 100, max: 500 });
    key(handle, 'ArrowRight');
    expect(size()).toBe('284px');
  });

  it('uses Up and Down for a horizontal handle, and another property and element', () => {
    const outer = document.body;
    make({ orientation: 'horizontal', property: '--rows', container: outer });
    key(handle, 'ArrowDown');
    expect(outer.style.getPropertyValue('--rows')).toBe('216px');
    key(handle, 'ArrowRight');
    expect(outer.style.getPropertyValue('--rows')).toBe('216px');
  });

  it('follows a drag, and ignores a twitch', () => {
    make();
    pointer(handle, 'pointerdown', 500);
    pointer(handle, 'pointermove', 502);
    expect(size()).toBe('200px');
    pointer(handle, 'pointermove', 560);
    expect(size()).toBe('260px');
    expect(handle.classList).toContain('dragging');
    pointer(handle, 'pointermove', 2000);
    expect(size()).toBe('400px');
    pointer(handle, 'pointerup', 2000);
    expect(handle.classList).not.toContain('dragging');
    expect(onResize).toHaveBeenCalledTimes(1);
    expect(onResize).toHaveBeenCalledWith(400, false);
  });

  it('collapses with Enter or a double-click, and comes back the same size', () => {
    make();
    key(handle, 'ArrowRight');
    key(handle, 'Enter');
    expect(size()).toBe('0px');
    expect(splitter.collapsed).toBe(true);
    expect(files.inert).toBe(true);
    expect(files.hasAttribute('data-split-collapsed')).toBe(true);
    expect(handle.hasAttribute('data-collapsed')).toBe(true);
    expect(handle.getAttribute('aria-valuenow')).toBe('0');
    handle.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(size()).toBe('216px');
    expect(files.inert).toBe(false);
    expect(files.hasAttribute('data-split-collapsed')).toBe(false);
  });

  it('comes back when its collapsed handle is clicked', () => {
    make();
    splitter.collapse();
    pointer(handle, 'pointerdown', 10);
    pointer(handle, 'pointerup', 10);
    expect(splitter.collapsed).toBe(false);
    expect(size()).toBe('200px');
  });

  it('wires toggle buttons elsewhere on the page', () => {
    const toggle = document.getElementById('toggle');
    make({ toggles: [toggle] });
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-controls')).toBe('files');
    toggle.click();
    expect(splitter.collapsed).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it("can't collapse when collapsible is false", () => {
    make({ collapsible: false });
    expect(handle.getAttribute('aria-valuemin')).toBe('100');
    key(handle, 'Enter');
    expect(splitter.collapsed).toBe(false);
  });

  it('remembers size and collapsed state', () => {
    make({ storageKey: 'split' });
    key(handle, 'End');
    key(handle, 'Enter');
    splitter.destroy();
    make({ storageKey: 'split' });
    expect(splitter.collapsed).toBe(true);
    splitter.expand();
    expect(size()).toBe('400px');
  });

  it('ignores a broken saved value', () => {
    localStorage.setItem('split', '{nope');
    make({ storageKey: 'split' });
    expect(size()).toBe('200px');
  });

  it('stops listening after destroy', () => {
    make();
    splitter.destroy();
    key(handle, 'ArrowRight');
    expect(size()).toBe('200px');
  });
});
