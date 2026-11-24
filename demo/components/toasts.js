import { toast } from '../../src/index.js';

const messages = {
  success: ['Saved.'],
  error: ['That file could not be read.', { duration: 6000 }],
  info: ['Three rows were skipped.', { title: 'Heads up' }],
};
for (const button of document.querySelectorAll('[data-toast]')) {
  button.addEventListener('click', () =>
    toast[button.dataset.toast](...messages[button.dataset.toast]),
  );
}
document
  .getElementById('toastCustom')
  .addEventListener('click', () =>
    toast.show('Report saved as PDF.', { type: 'success', title: 'Exported' }),
  );
