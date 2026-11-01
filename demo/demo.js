import { ColorMode, Tabs, toast } from '../src/index.js';

new ColorMode(document.getElementById('colorMode'));

const showing = document.getElementById('showing');
const show = (id) => {
  showing.textContent = id ? tabs.tabs.find((tab) => tab.id === id).title : 'Home';
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
let count = 0;
const addTab = () => {
  count += 1;
  tabs.open(`doc-${count}`, `Document ${count}`);
  show(`doc-${count}`);
};
['one', 'two', 'three'].forEach(addTab);
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

document.getElementById('scroll').textContent = Array.from(
  { length: 40 },
  (_, i) => `line ${i + 1}`,
).join('\n');
document.getElementById('scroll').style.whiteSpace = 'pre';
