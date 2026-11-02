// The package's shape: entry points, what workbench.css pulls in, and class
// names. Apps depend on all three.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');
const pkg = JSON.parse(read('package.json'));

/** Every .css file under src/, relative to the repo root */
const cssFiles = (dir = 'src') =>
  readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const file = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) return cssFiles(file);
    return file.endsWith('.css') ? [file] : [];
  });

// State classes that go with a wb- class (`.wb-tab.active`), and .sr-only
const UNPREFIXED = ['active', 'show', 'pinned', 'dragging', 'drop-before', 'drop-after', 'sr-only'];

/** Class names a stylesheet's selectors use */
const classNames = (css) => {
  const rules = css
    .replace(/\/\*[\s\S]*?\*\//g, '') // comments
    .replace(/@import[^;]*;/g, '')
    .replace(/url\([^)]*\)/g, '')
    .replace(/\{[^{}]*\}/g, '{}'); // declarations: no selectors in there
  return [...rules.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((match) => match[1]);
};

describe('package', () => {
  it('has a file for every entry point', () => {
    for (const [entry, file] of Object.entries(pkg.exports)) {
      expect(existsSync(path.join(root, file)), `${entry} → ${file}`).toBe(true);
    }
  });

  it('exports every stylesheet', () => {
    const exported = Object.values(pkg.exports).map((file) => file.replace(/^\.\//, ''));
    for (const file of cssFiles()) expect(exported).toContain(file);
  });

  it('pulls every component stylesheet into workbench.css, in the right order', () => {
    const imports = [...read('src/workbench.css').matchAll(/@import '\.\/([^']+)'/g)].map((match) =>
      path.posix.join('src', match[1]),
    );
    const expected = cssFiles().filter(
      (file) => !['src/workbench.css', 'src/fonts.css'].includes(file),
    );
    expect([...imports].sort()).toEqual([...expected].sort());
    // Tokens first: everything else uses them
    expect(imports[0]).toBe('src/tokens.css');
  });

  it('starts every class name with wb-', () => {
    for (const file of cssFiles()) {
      const stray = classNames(read(file)).filter(
        (name) => !name.startsWith('wb-') && !UNPREFIXED.includes(name),
      );
      expect(stray, file).toEqual([]);
    }
  });
});
