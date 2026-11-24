import { beforeEach, describe, expect, it } from 'vitest';
import { addCodeBlocks, formatMarkup } from '../demo/components/code.js';

describe('formatMarkup', () => {
  it('drops blank edges and the shared indent', () => {
    const html = '\n        <div>\n          <b>Hi</b>\n        </div>\n      ';
    expect(formatMarkup(html)).toBe('<div>\n  <b>Hi</b>\n</div>');
  });

  it('writes boolean attributes the way people type them', () => {
    expect(formatMarkup('<input type="checkbox" checked="" disabled="" value="">')).toBe(
      '<input type="checkbox" checked disabled value="">',
    );
  });

  it('ignores blank lines when finding the indent', () => {
    expect(formatMarkup('\n    <a></a>\n\n    <b></b>\n')).toBe('<a></a>\n\n<b></b>');
  });
});

describe('addCodeBlocks', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div data-example>
        <button class="wb-btn">Save &amp; close</button>
      </div>`;
    addCodeBlocks(document);
  });

  it('adds a code block after each example', () => {
    const example = document.querySelector('[data-example]');
    expect(example.nextElementSibling.classList.contains('demo-code-wrap')).toBe(true);
  });

  it('shows the example markup as text, not as elements', () => {
    const pre = document.querySelector('.demo-code');
    expect(pre.textContent).toBe('<button class="wb-btn">Save &amp; close</button>');
    expect(pre.querySelector('button')).toBeNull();
  });

  it('gives each block a copy button', () => {
    const copy = document.querySelector('.demo-code-wrap .demo-copy');
    expect(copy.textContent).toBe('Copy');
  });
});

describe('addCodeBlocks with written code', () => {
  it('adds a copy button to each pre[data-code], keeping its text', () => {
    document.body.innerHTML = '<pre class="demo-code" data-code>tabs.open(1);</pre>';
    addCodeBlocks(document);
    const wrap = document.querySelector('.demo-code-wrap');
    expect(wrap.querySelector('.demo-copy')).not.toBeNull();
    expect(wrap.querySelector('pre').textContent).toBe('tabs.open(1);');
  });
});
