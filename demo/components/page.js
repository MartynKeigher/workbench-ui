import { ColorMode } from '../../src/index.js';
import { addCodeBlocks } from './code.js';
import { COMPONENTS, renderNav } from './nav.js';

export const headerColorMode = new ColorMode(document.getElementById('colorMode'), {
  onChange: (mode) => document.dispatchEvent(new CustomEvent('colormode', { detail: mode })),
});

// Before any component script fills its examples, so the blocks show the markup you write
addCodeBlocks(document);

const nav = document.getElementById('componentNav');
const main = document.querySelector('.demo-lib-page');

/** Show the component the URL names, or the first one. */
function show() {
  const id = location.hash.slice(1);
  const current = COMPONENTS.some((c) => c.id === id) ? id : COMPONENTS[0].id;
  for (const section of main.querySelectorAll('.demo-lib-component')) {
    section.hidden = section.id !== current;
  }
  renderNav(nav, current);
  const { label } = COMPONENTS.find((c) => c.id === current);
  document.title = `${label} · Components · Workbench UI`;
  main.scrollTop = 0;
}

// Example links point at "#"; following one would leave this component
main.addEventListener('click', (event) => {
  if (event.target.closest('a[href="#"]')) event.preventDefault();
});

show();
nav.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest' });
window.addEventListener('hashchange', show);
