import {
  ColorMode,
  CopyButton,
  PaneToggle,
  Splitter,
  Tabs,
  confirmDialog,
  toast,
} from '../src/index.js';

new ColorMode(document.getElementById('colorMode'));

const showing = document.getElementById('showing');
const statusDoc = document.getElementById('statusDoc');
const files = [...document.querySelectorAll('#files .wb-list-item')];
// A tab's id is its title. Show it, and select it in the file list if it's there.
const show = (id) => {
  showing.textContent = id ?? 'Overview';
  statusDoc.textContent = id ?? 'Overview';
  for (const item of files) {
    if (item.textContent === id) item.setAttribute('aria-current', 'true');
    else item.removeAttribute('aria-current');
  }
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
const open = (title) => {
  tabs.open(title, title);
  show(title);
};
tabs.setHome(true);
['Project plan', 'Release notes', 'Q3 report'].forEach(open);
tabs.togglePin('Project plan');

// Picking a file opens it in a tab, or goes to its tab
files.forEach((item) => item.addEventListener('click', () => open(item.textContent)));

let untitled = 0;
document.getElementById('addTab').addEventListener('click', () => {
  untitled += 1;
  open(`Untitled ${untitled}`);
});

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

// Delete… asks first
document.getElementById('confirm').addEventListener('click', async () => {
  const yes = await confirmDialog({
    title: 'Delete Q3 report?',
    message: 'It goes for everyone with access. This is placeholder data, so nothing is lost.',
    confirmLabel: 'Delete',
    danger: true,
  });
  if (yes) toast.success('Deleted (not really).');
});

// The message bar's ×
const message = document.getElementById('message');
message.querySelector('.wb-message-close').addEventListener('click', () => message.remove());

document
  .getElementById('warnings')
  .addEventListener('click', () => toast.info('Two rows have no owner.', { title: '2 warnings' }));

new CopyButton(document.getElementById('copyCode'), {
  getText: () => document.getElementById('code').textContent,
});

new Splitter(document.querySelector('.demo-splitter'), {
  target: document.getElementById('filesPane'),
  size: 200,
  min: 160,
  max: 360,
  storageKey: 'demoFilesWidth',
  toggles: [document.getElementById('toggleFiles')],
});

const tokensPane = document.getElementById('tokensPane');
new PaneToggle(tokensPane.querySelector('.wb-pane-toggle'), {
  pane: tokensPane,
  storageKey: 'demoTokensCollapsed',
});

const tokens = ['bg', 'pane', 'ink', 'muted', 'line', 'accent', 'accent-soft', 'header'].concat([
  'header-accent',
  'ok',
  'ok-bg',
  'warn',
  'warn-bg',
  'err-ink',
  'err-bg',
  'chip',
]);
document.getElementById('swatches').innerHTML = tokens
  .map(
    (name) =>
      `<div class="demo-swatch"><span style="background: var(--${name})"></span>--${name}</div>`,
  )
  .join('');
