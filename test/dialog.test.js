import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { confirmDialog } from '../src/components/dialog/dialog.js';

// jsdom has no showModal / close: enough of them for these tests
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
    this.querySelector('[autofocus]')?.focus();
  };
  HTMLDialogElement.prototype.close = function (value) {
    if (value !== undefined) this.returnValue = value;
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
});

const dialog = () => document.querySelector('dialog.wb-dialog');
const button = (text) =>
  [...dialog().querySelectorAll('button')].find((b) => b.textContent === text);

describe('confirmDialog', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('opens a labelled modal dialog with the text set as text', () => {
    confirmDialog({ title: '<b>Delete?</b>', message: 'Line one\nLine two' });
    expect(dialog().open).toBe(true);
    const title = dialog().querySelector('.wb-dialog-title');
    expect(title.textContent).toBe('<b>Delete?</b>');
    expect(title.querySelector('b')).toBeNull();
    expect(dialog().getAttribute('aria-labelledby')).toBe(title.id);
    const body = dialog().querySelector('.wb-dialog-body');
    expect(body.textContent).toBe('Line one\nLine two');
    expect(dialog().getAttribute('aria-describedby')).toBe(body.id);
  });

  it('resolves true for the confirm button, then removes itself', async () => {
    const answer = confirmDialog({ title: 'Go?', confirmLabel: 'Go' });
    dialog().close(button('Go').value);
    expect(await answer).toBe(true);
    expect(dialog()).toBeNull();
  });

  it('resolves false for Cancel, the × and Escape', async () => {
    let answer = confirmDialog({ title: 'Go?' });
    dialog().close(button('Cancel').value);
    expect(await answer).toBe(false);

    answer = confirmDialog({ title: 'Go?' });
    dialog().close(dialog().querySelector('.wb-dialog-close').value);
    expect(await answer).toBe(false);

    // Escape closes with no return value
    answer = confirmDialog({ title: 'Go?' });
    dialog().close();
    expect(await answer).toBe(false);
  });

  it('focuses the confirm button, or Cancel when confirming is dangerous', () => {
    confirmDialog({ title: 'Save?', confirmLabel: 'Save' });
    expect(document.activeElement).toBe(button('Save'));
    expect(button('Save').classList).toContain('wb-btn-primary');
    dialog().close();

    confirmDialog({ title: 'Delete?', confirmLabel: 'Delete', danger: true });
    expect(document.activeElement).toBe(button('Cancel'));
    expect(button('Delete').classList).toContain('wb-btn-danger');
  });

  it('leaves out the body when there is no message', () => {
    confirmDialog({ title: 'Go?' });
    expect(dialog().querySelector('.wb-dialog-body')).toBeNull();
    expect(dialog().hasAttribute('aria-describedby')).toBe(false);
  });
});
