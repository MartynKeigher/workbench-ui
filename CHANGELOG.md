# Changelog

Every release, newest first. Versions follow [semantic versioning](https://semver.org/):

- **Patch** (0.1.**1**): fixes. Nothing to change on your side.
- **Minor** (0.**2**.0): new components, tokens or options. Nothing to change on your side.
- **Major** (**1**.0.0): something renamed or removed. Each one lists what to change.

While the version is 0.x, a minor release may still rename things; it says so here when it does.

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
