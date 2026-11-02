/**
 * Copy button: copies text to the clipboard and says so.
 *
 *   <button type="button" class="wb-btn" id="copy">Copy</button>
 *
 *   new CopyButton(document.getElementById('copy'), {
 *     getText: () => editor.value,
 *   });
 *
 * After a click the label reads "Copied" (or "Couldn't copy") for a moment,
 * and screen readers hear the same. A button with icons can keep them: put
 * the words in an element with the class wb-copy-label and only that changes.
 */

const LIVE_CLASS = 'wb-copy-live';

/** One polite live region for every copy button on the page */
function announce(message) {
  let live = document.querySelector(`.${LIVE_CLASS}`);
  if (!live) {
    live = document.createElement('div');
    live.className = `${LIVE_CLASS} sr-only`;
    live.setAttribute('role', 'status');
    document.body.append(live);
  }
  // Cleared first, so saying the same thing twice is still heard
  live.textContent = '';
  setTimeout(() => {
    live.textContent = message;
  }, 50);
}

export class CopyButton {
  /**
   * @param {HTMLButtonElement} button
   * @param {Object} options
   * @param {string} [options.text] - The text to copy
   * @param {() => string} [options.getText] - Or: called on each click for the text to copy
   * @param {string} [options.copiedLabel] - Shown after copying. Default 'Copied'.
   * @param {string} [options.failedLabel] - Shown when copying failed. Default "Couldn't copy".
   * @param {number} [options.duration] - How long that shows, in milliseconds. Default 1500.
   * @param {(text: string) => void} [options.onCopy] - After a copy
   * @param {(error: unknown) => void} [options.onError] - When copying failed
   */
  constructor(
    button,
    {
      text,
      getText,
      copiedLabel = 'Copied',
      failedLabel = "Couldn't copy",
      duration = 1500,
      onCopy = () => {},
      onError = () => {},
    } = {},
  ) {
    this.button = button;
    this.label = button.querySelector('.wb-copy-label') ?? button;
    this.restingLabel = this.label.textContent;
    this.timer = null;
    this.onClick = async () => {
      let value;
      try {
        value = String(getText ? getText() : (text ?? ''));
        if (!navigator.clipboard?.writeText) throw new Error('No clipboard here');
        await navigator.clipboard.writeText(value);
      } catch (error) {
        this.flash(failedLabel, 'failed', duration);
        onError(error);
        return;
      }
      this.flash(copiedLabel, 'copied', duration);
      onCopy(value);
    };
    button.addEventListener('click', this.onClick);
  }

  /** Show a label for a while, then go back to the usual one */
  flash(label, state, duration) {
    clearTimeout(this.timer);
    this.label.textContent = label;
    this.button.dataset.copyState = state;
    announce(label);
    this.timer = setTimeout(() => this.reset(), duration);
  }

  reset() {
    clearTimeout(this.timer);
    this.label.textContent = this.restingLabel;
    delete this.button.dataset.copyState;
  }

  destroy() {
    this.reset();
    this.button.removeEventListener('click', this.onClick);
  }
}
