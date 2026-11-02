# Changelog

Every release, newest first. Versions follow [semantic versioning](https://semver.org/):

- **Patch** (0.1.**1**): fixes. Nothing to change on your side.
- **Minor** (0.**2**.0): new components, tokens or options. Nothing to change on your side.
- **Major** (**1**.0.0): something renamed or removed. Each one lists what to change.

While the version is 0.x, a minor release may still rename things; it says so here when it does.

## 0.3.0

New components. Nothing renamed or removed.

- Warning tokens: `--warn`, `--warn-bg`, `--warn-ink` and `--warn-line`, light and dark, and
  `.wb-pill-warn`.
- Buttons (`button.css`): `.wb-btn`, `.wb-btn-primary`, `.wb-btn-danger` and `.wb-btn-row`, for
  the page under the header bar.
- Message bars (`message.css`): `.wb-message` with `-ok`, `-warn` and `-err` (info is the
  default), plus `.wb-message-body`, `.wb-message-title` and `.wb-message-close`.
- Status bar (`statusbar.css`): `.wb-statusbar`, `.wb-statusbar-item` and `.wb-statusbar-end`.
- Dialogs (`dialog.css`, `confirmDialog`): styles for a native `<dialog class="wb-dialog">` and
  its parts, and `confirmDialog()`, a yes / no question that resolves `true` or `false`.
- `CopyButton` (`copy-button.css`): copies text and says "Copied", to screen readers too.
- `Splitter` (`splitter.css`): resizes a side pane by dragging or from the keyboard, collapses
  it, and remembers both. It writes the size to a CSS custom property (`--wb-split`).
- `PaneToggle`: folds a pane to its headings, with a `.wb-pane-toggle` chevron button.

`workbench.css` includes all the new styles. Each also has its own entry point, as do
`./copy-button`, `./dialog`, `./splitter` and `./pane-toggle`.

## 0.2.0

Classes for the content under the header. Nothing renamed or removed.

- Panes (`pane.css`): `.wb-pane`, `.wb-pane-head` and `.wb-count`.
- Selectable lists (`list.css`): `.wb-list` and `.wb-list-item`. Items are buttons or links; the
  selected one has `aria-current="true"` or `aria-selected="true"`.
- Summary tiles (`tiles.css`): `.wb-tiles`, `.wb-tile`, `.wb-tile-value` and `.wb-tile-label`.
- Data tables (`table.css`): `.wb-table`, with `.wb-num` for number columns.
- Status pills (`pill.css`): `.wb-pill`, plus `.wb-pill-ok`, `.wb-pill-err` and
  `.wb-pill-accent`.

`workbench.css` includes all five. Each also has its own entry point.

## 0.1.0

First release.

- Design tokens (`tokens.css`): surfaces, text, lines, accent, header bar, status, diff, code
  syntax and search-match colours, focus ring, shadows and fonts, with a dark palette under
  `data-color-mode="dark"`.
- Base styles (`base.css`): page defaults, one keyboard focus ring, `.sr-only`, and `.wb-scroll`
  for panes that always show their scrollbar.
- Header bar (`header.css`): `.wb-header`, `.wb-bar`, `.wb-brand`, `.wb-actions`, `.wb-hbtn`
  (plus `-icon` and `-primary`) and `.wb-file-input`.
- `Toaster` / `toast`: success, error and info toasts.
- `Tabs`: a tab strip with an optional Home tab, pinning, drag to reorder, keyboard moves and a
  right-click menu.
- `ColorMode`: a light / dark toggle that remembers the choice.
