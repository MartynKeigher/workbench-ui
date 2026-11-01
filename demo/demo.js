import { ColorMode, Tabs, toast } from '../src/index.js';

new ColorMode(document.getElementById('colorMode'));

const showing = document.getElementById('showing');
const show = (id) => {
  showing.textContent = id ? tabs.tabs.find((tab) => tab.id === id).title : 'Overview';
};
const tabs = new Tabs({
  element: document.querySelector('.wb-tabs'),
  onSelect: (id) => {
    tabs.activate(id);
    show(id);
  },
  onClose: (id) => show(tabs.close(id)),
  onHome: () => {
    tabs.activate(null);
    show(null);
  },
});
tabs.setHome(true);
const titles = ['Project plan', 'Release notes', 'Q3 report', 'Meeting notes', 'Roadmap'];
let count = 0;
const addTab = () => {
  const title = titles[count] ?? `Untitled ${count + 1}`;
  count += 1;
  tabs.open(`doc-${count}`, title);
  show(`doc-${count}`);
};
[1, 2, 3].forEach(addTab);
tabs.togglePin('doc-1');
document.getElementById('addTab').addEventListener('click', addTab);

const messages = {
  success: 'Your changes were saved.',
  error: 'That file could not be read.',
  info: 'Three items were skipped.',
};
document.querySelectorAll('[data-toast]').forEach((button) => {
  button.addEventListener('click', () =>
    toast.show(messages[button.dataset.toast], { type: button.dataset.toast }),
  );
});
document.getElementById('primary').addEventListener('click', () => toast.info('Primary action.'));

const tokens = ['bg', 'pane', 'ink', 'muted', 'line', 'accent', 'accent-soft', 'header'].concat([
  'header-accent',
  'ok',
  'ok-bg',
  'err-ink',
  'err-bg',
  'highlight',
  'code',
  'chip',
]);
document.getElementById('swatches').innerHTML = tokens
  .map(
    (name) =>
      `<div class="demo-swatch"><span style="background: var(--${name})"></span>--${name}</div>`,
  )
  .join('');
