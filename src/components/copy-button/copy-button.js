/**
 * Copies text to the clipboard and briefly shows "Copied" (also announced to
 * screen readers). Only a .wb-copy-label child changes, if present.
 */

const LIVE_CLASS = 'wb-copy-live';

/** Shared live region for all copy buttons */
function announce(message) {
  let live = document.querySelector(`.${LIVE_CLASS}`);
  if (!live) {
    live = document.createElement('div');
    live.className = `${LIVE_CLASS} sr-only`;
    live.setAttribute('role', 'status');
    document.body.append(live);
  }
  // Clear first so screen readers re-announce a repeated message
  live.textContent = '';
  setTimeout(() => {
    live.textContent = message;
  }, 50);
}

export class CopyButton {
  /**
   * @param {HTMLButtonElement} button
   * @param {Object} options
   * @param {string} [options.text]
   * @param {() => string} [options.getText] - Called on each click; overrides text
   * @param {string} [options.copiedLabel] - Default 'Copied'.
   * @param {string} [options.failedLabel] - Default "Couldn't copy".
   * @param {number} [options.duration] - In ms. Default 1500.
   * @param {(text: string) => void} [options.onCopy]
   * @param {(error: unknown) => void} [options.onError]
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
