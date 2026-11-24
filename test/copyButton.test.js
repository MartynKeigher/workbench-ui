import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CopyButton } from '../src/components/copy-button/copy-button.js';

describe('CopyButton', () => {
  let button, copy, writeText;
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = '<button type="button">Copy</button>';
    button = document.querySelector('button');
    writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  });
  afterEach(() => {
    copy?.destroy();
    vi.useRealTimers();
  });

  const click = async () => {
    button.click();
    await vi.advanceTimersByTimeAsync(0);
  };

  it('copies the text, says Copied, then goes back', async () => {
    const onCopy = vi.fn();
    copy = new CopyButton(button, { text: 'hello', onCopy });
    await click();
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(onCopy).toHaveBeenCalledWith('hello');
    expect(button.textContent).toBe('Copied');
    expect(button.dataset.copyState).toBe('copied');
    await vi.advanceTimersByTimeAsync(1500);
    expect(button.textContent).toBe('Copy');
    expect(button.dataset.copyState).toBeUndefined();
  });

  it('asks getText on every click', async () => {
    let n = 0;
    copy = new CopyButton(button, { getText: () => `v${++n}` });
    await click();
    await click();
    expect(writeText.mock.calls).toEqual([['v1'], ['v2']]);
  });

  it('tells screen readers', async () => {
    copy = new CopyButton(button, { text: 'x' });
    await click();
    await vi.advanceTimersByTimeAsync(50);
    const live = document.querySelector('.wb-copy-live');
    expect(live.getAttribute('role')).toBe('status');
    expect(live.textContent).toBe('Copied');
  });

  it("says it couldn't copy, and why", async () => {
    const error = new Error('denied');
    writeText.mockImplementation(() => Promise.reject(error));
    const onError = vi.fn();
    copy = new CopyButton(button, { text: 'x', onError });
    await click();
    expect(button.textContent).toBe("Couldn't copy");
    expect(button.dataset.copyState).toBe('failed');
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('fails cleanly with no clipboard', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    const onError = vi.fn();
    copy = new CopyButton(button, { text: 'x', onError });
    await click();
    expect(onError).toHaveBeenCalled();
    expect(button.textContent).toBe("Couldn't copy");
  });

  it('changes only .wb-copy-label, keeping icons', async () => {
    button.innerHTML = '<svg></svg><span class="wb-copy-label">Copy</span>';
    copy = new CopyButton(button, { text: 'x', copiedLabel: 'Done' });
    await click();
    expect(button.querySelector('svg')).not.toBeNull();
    expect(button.querySelector('.wb-copy-label').textContent).toBe('Done');
  });

  it('stops listening after destroy', async () => {
    copy = new CopyButton(button, { text: 'x' });
    copy.destroy();
    await click();
    expect(writeText).not.toHaveBeenCalled();
  });
});
