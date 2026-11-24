import { confirmDialog, toast } from '../../src/index.js';

document.getElementById('confirmDelete').addEventListener('click', async () => {
  const yes = await confirmDialog({
    title: 'Delete Q3 report?',
    message: "It goes for everyone with access. This can't be undone.",
    confirmLabel: 'Delete',
    danger: true,
  });
  toast.info(yes ? 'You chose Delete.' : 'You chose Cancel.');
});

const exportDialog = document.getElementById('exportDialog');
document.getElementById('openExport').addEventListener('click', () => exportDialog.showModal());
exportDialog.addEventListener('close', () =>
  toast.info(`Closed with "${exportDialog.returnValue}".`),
);
