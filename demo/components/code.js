import { CopyButton } from '../../src/index.js';

// innerHTML writes these as checked="", which nobody types
const BOOLEAN_ATTRS =
  / (checked|disabled|selected|hidden|required|readonly|multiple|open|autofocus|inert|popover)=""/g;

// Trim blank lines and the shared indent
export function formatMarkup(html) {
  const lines = html.replace(/^\s*\n|\n\s*$/g, '').split('\n');
  const indents = lines.filter((line) => line.trim()).map((line) => line.match(/^ */)[0].length);
  const indent = Math.min(...indents);
  return lines.map((line) => line.slice(indent).trimEnd().replace(BOOLEAN_ATTRS, ' $1')).join('\n');
}

function withCopyButton(pre) {
  const wrap = document.createElement('div');
  wrap.className = 'demo-code-wrap';
  const copy = document.createElement('button');
  copy.type = 'button';
  copy.className = 'wb-btn demo-copy';
  copy.textContent = 'Copy';
  pre.replaceWith(wrap);
  wrap.append(copy, pre);
  new CopyButton(copy, { getText: () => pre.textContent });
  return wrap;
}

// Add a copyable code block after each [data-example]
export function addCodeBlocks(root) {
  for (const example of root.querySelectorAll('[data-example]')) {
    const pre = document.createElement('pre');
    pre.className = 'demo-code wb-scroll';
    pre.tabIndex = 0;
    pre.textContent = formatMarkup(example.innerHTML);
    example.after(pre);
    withCopyButton(pre);
  }
  for (const pre of root.querySelectorAll('pre[data-code]')) withCopyButton(pre);
}
