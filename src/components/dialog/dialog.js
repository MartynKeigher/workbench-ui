/**
 * Dialog helpers. Any <dialog class="wb-dialog"> works with native showModal();
 * confirmDialog() builds a yes/no one. Text is set as text, never HTML.
 */

let count = 0;

/**
 * @param {Object} options
 * @param {string} options.title
 * @param {string} [options.message] - Line breaks are kept.
 * @param {string} [options.confirmLabel] - Default 'OK'.
 * @param {string} [options.cancelLabel] - Default 'Cancel'.
 * @param {boolean} [options.danger] - Danger styling; focus starts on Cancel. Default false.
 * @returns {Promise<boolean>} true if confirmed; false on cancel, × or Escape
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
  // Start on the safe choice when confirming is destructive
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
