import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toaster } from '../src/components/toast/toast.js';

describe('Toaster', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('makes a live-region container on first use', () => {
    new Toaster().success('Saved.');
    const container = document.querySelector('.wb-toast-container');
    expect(container.getAttribute('role')).toBe('status');
    expect(container.getAttribute('aria-live')).toBe('polite');
  });

  it('uses a container already on the page', () => {
    document.body.innerHTML = '<div class="wb-toast-container" id="mine"></div>';
    new Toaster().info('Hi');
    expect(document.querySelectorAll('.wb-toast-container')).toHaveLength(1);
    expect(document.querySelector('#mine .wb-toast')).not.toBeNull();
  });

  it('shows the type, its default title and the message', () => {
    const toaster = new Toaster();
    const el = toaster.error('Could not read it.');
    expect(el.dataset.type).toBe('error');
    expect(el.querySelector('.wb-toast-title').textContent).toBe('Something went wrong');
    expect(el.querySelector('.wb-toast-content').textContent).toBe('Could not read it.');
  });

  it('takes a custom title, and default titles per toaster', () => {
    const toaster = new Toaster({ titles: { success: 'Nice' } });
    expect(toaster.success('a').querySelector('.wb-toast-title').textContent).toBe('Nice');
    const custom = toaster.show('b', { title: 'Exported' });
    expect(custom.querySelector('.wb-toast-title').textContent).toBe('Exported');
  });

  it('sets text, never HTML', () => {
    const el = new Toaster().show('<img src=x onerror=alert(1)>', { title: '<b>t</b>' });
    expect(el.querySelector('img')).toBeNull();
    expect(el.querySelector('b')).toBeNull();
    expect(el.querySelector('.wb-toast-content').textContent).toBe('<img src=x onerror=alert(1)>');
  });

  it('falls back to success for an unknown type', () => {
    expect(new Toaster().show('x', { type: 'nope' }).dataset.type).toBe('success');
  });

  it('shows, then goes after its duration', () => {
    const el = new Toaster().show('x', { duration: 1000 });
    vi.advanceTimersByTime(10);
    expect(el.classList.contains('show')).toBe(true);
    vi.advanceTimersByTime(990);
    expect(el.classList.contains('show')).toBe(false);
    vi.advanceTimersByTime(300);
    expect(el.isConnected).toBe(false);
  });
});
