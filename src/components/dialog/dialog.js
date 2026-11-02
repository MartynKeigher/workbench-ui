/**
 * Dialogs. Any <dialog class="wb-dialog"> works with the browser's own
 * showModal() (see dialog.css). confirmDialog() builds a yes / no one.
 *
 *   import { confirmDialog } from '@martynkeigher/workbench-ui';
 *
 *   if (await confirmDialog({
 *     title: 'Delete Q3 report?',
 *     message: 'It goes for everyone. This can't be undone.',
 *     confirmLabel: 'Delete',
 *     danger: true,
 *   })) remove();
 *
 * Text is set as text, never as HTML.
 */

let count = 0;

/**
 * Ask a yes / no question in a modal dialog.
 * @param {Object} options
 * @param {string} options.title - The question
 * @param {string} [options.message] - More about it. Line breaks are kept.
 * @param {string} [options.confirmLabel] - The yes button. Default 'OK'.
 * @param {string} [options.cancelLabel] - The no button. Default 'Cancel'.
 * @param {boolean} [options.danger] - Yes deletes or discards: a danger button, and the
 *   focus starts on Cancel. Default false.
 * @returns {Promise<boolean>} true for yes; false for no, the ×, or Escape
 */
export function confirmDialog({
  title,
  message = '',
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  danger = false,
}) {
  count += 1;
  const id = `wb-dialog-${count}`;
  const dialog = document.createElement('dialog');
  dialog.className = 'wb-dialog';
  dialog.setAttribute('aria-labelledby', `${id}-title`);
  dialog.innerHTML = `
    <form method="dialog">
      <div class="wb-dialog-head">
        <h2 class="wb-dialog-title" id="${id}-title"></h2>
        <button class="wb-dialog-close" value="cancel" aria-label="Close">×</button>
      </div>
      <div class="wb-dialog-body" id="${id}-body"></div>
      <div class="wb-dialog-actions">
        <button class="wb-btn" value="cancel"></button>
        <button class="wb-btn ${danger ? 'wb-btn-danger' : 'wb-btn-primary'}" value="confirm"></button>
      </div>
    </form>`;
  dialog.querySelector('.wb-dialog-title').textContent = title;
  const body = dialog.querySelector('.wb-dialog-body');
  if (message) {
    body.textContent = message;
    dialog.setAttribute('aria-describedby', body.id);
  } else {
    body.remove();
  }
  const [cancel, confirm] = dialog.querySelectorAll('.wb-dialog-actions button');
  cancel.textContent = cancelLabel;
  confirm.textContent = confirmLabel;
  // Where the focus starts: on the safe choice when yes is destructive
  (danger ? cancel : confirm).autofocus = true;

  document.body.append(dialog);
  return new Promise((resolve) => {
    dialog.addEventListener('close', () => {
      resolve(dialog.returnValue === 'confirm');
      dialog.remove();
    });
    dialog.showModal();
  });
}
