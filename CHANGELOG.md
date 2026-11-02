# Changelog

Every release, newest first. Versions follow [semantic versioning](https://semver.org/):

- **Patch** (0.1.**1**): fixes. Nothing to change on your side.
- **Minor** (0.**2**.0): new components, tokens or options. Nothing to change on your side.
- **Major** (**1**.0.0): something renamed or removed. Each one lists what to change.

While the version is 0.x, a minor release may still rename things; it says so here when it does.

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
