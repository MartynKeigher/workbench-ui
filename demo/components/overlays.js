import { Menu, Popover, Tooltip, toast } from '../../src/index.js';

new Menu(document.getElementById('menuButton'), {
  items: [
    { id: 'rename', label: 'Rename' },
    { id: 'duplicate', label: 'Duplicate' },
    { id: 'move', label: 'Move to…', disabled: true },
    '-',
    { id: 'delete', label: 'Delete', danger: true },
  ],
  onSelect: (id) => toast.info(`You chose ${id}.`),
});

new Tooltip(document.getElementById('tipSave'), { text: 'Ctrl+S' });
new Tooltip(document.getElementById('tipShare'), {
  text: 'Anyone with the link can view',
  placement: 'bottom',
});

new Popover(document.getElementById('ownerButton'), document.getElementById('ownerInfo'));

const drawer = document.getElementById('filterDrawer');
document.getElementById('openDrawer').addEventListener('click', () => drawer.showModal());

Tooltip.attach(document.getElementById('hint'));
