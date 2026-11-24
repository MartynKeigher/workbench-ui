import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TabPanels } from '../src/components/tab-panels/tab-panels.js';

const tab = (id, selected = false) =>
  `<button role="tab" id="t-${id}" aria-controls="p-${id}" aria-selected="${selected}">${id}</button>`;

describe('TabPanels', () => {
  let tablist;
  let onChange;
  const panel = (id) => document.getElementById(`p-${id}`);
  const key = (name) =>
    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: name, bubbles: true }),
    );

  beforeEach(() => {
    document.body.innerHTML = `
      <div role="tablist">${tab('a')}${tab('b', true)}${tab('c')}</div>
      <div role="tabpanel" id="p-a"></div>
      <div role="tabpanel" id="p-b"></div>
      <div role="tabpanel" id="p-c"></div>`;
    tablist = document.querySelector('[role="tablist"]');
    onChange = vi.fn();
    new TabPanels(tablist, { onChange });
  });

  it('starts on the tab marked selected and hides the other panels', () => {
    expect(panel('b').hidden).toBe(false);
    expect(panel('a').hidden).toBe(true);
    expect(panel('c').hidden).toBe(true);
  });

  it('keeps only the selected tab in the Tab order', () => {
    const order = [...tablist.children].map((t) => t.tabIndex);
    expect(order).toEqual([-1, 0, -1]);
  });

  it('selects a clicked tab and reports it', () => {
    document.getElementById('t-c').click();
    expect(panel('c').hidden).toBe(false);
    expect(panel('b').hidden).toBe(true);
    expect(document.getElementById('t-c').getAttribute('aria-selected')).toBe('true');
    expect(onChange).toHaveBeenCalledWith(document.getElementById('t-c'), panel('c'));
  });

  it('moves with the arrow keys, wrapping round, and Home / End', () => {
    document.getElementById('t-b').focus();
    key('ArrowRight');
    expect(document.activeElement.id).toBe('t-c');
    key('ArrowRight');
    expect(document.activeElement.id).toBe('t-a');
    key('End');
    expect(document.activeElement.id).toBe('t-c');
    key('Home');
    expect(document.activeElement.id).toBe('t-a');
    expect(panel('a').hidden).toBe(false);
  });

  it('does not report re-selecting the current tab', () => {
    document.getElementById('t-b').click();
    expect(onChange).not.toHaveBeenCalled();
  });
});
