const GROUPS = {
  Surfaces: ['bg', 'pane', 'control', 'hover', 'row-alt', 'tile', 'chip', 'pill', 'code'],
  Text: ['ink', 'ink-2', 'muted', 'faint', 'label', 'note', 'heading-ink', 'caption-ink'],
  Lines: ['line', 'line-soft', 'control-line'],
  Accent: ['accent', 'accent-ink', 'accent-soft', 'accent-line', 'on-accent'],
  'Header bar': [
    'header',
    'header-2',
    'header-line',
    'header-ink',
    'header-muted',
    'header-accent',
  ],
  Status: ['ok', 'ok-bg', 'ok-ink', 'warn', 'warn-bg', 'warn-ink', 'err-bg', 'err-ink'],
  Diffs: ['diff-del-bg', 'diff-del-mark', 'diff-add-bg', 'diff-add-mark', 'diff-change-bg'],
  'Code syntax': ['hl-keyword', 'hl-builtin', 'hl-string', 'hl-number', 'hl-comment', 'hl-title'],
  'Search matches': ['match-mark', 'match-current', 'match-row'],
  Chrome: ['scrollbar', 'focus-ring'],
};

const value = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();

const render = () => {
  document.getElementById('tokenGroups').innerHTML = Object.entries(GROUPS)
    .map(
      ([group, names]) => `
        <h3 class="wb-pane-head">${group}</h3>
        <div class="demo-lib-swatches">${names
          .map(
            (name) => `
              <div class="demo-lib-swatch">
                <span style="background: var(--${name})"></span>
                <code>--${name}</code>
                <code class="demo-lib-swatch-value">${value(name)}</code>
              </div>`,
          )
          .join('')}</div>`,
    )
    .join('');
};

render();
// Values differ by palette
document.addEventListener('colormode', render);
