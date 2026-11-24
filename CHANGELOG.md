# Changelog

Every release, newest first. Versions follow [semantic versioning](https://semver.org/):

- **Patch** (0.7.**1**): fixes. Nothing to change on your side.
- **Minor** (0.**8**.0): new components, tokens or options. Nothing to change on your side.
- **Major** (**1**.0.0): something renamed or removed. Each one lists what to change.

While the version is 0.x, a minor release may still rename things; it says so here when it does.

## 0.7.0

First release.

Foundations:

- Design tokens (`tokens.css`): surfaces, text, lines, accent, header bar, status, warning, diff, code syntax and search-match colors, heading, caption, strong and status bar ink, focus ring, shadows and fonts. The light palette has parchment panes and a deep green header bar, to match [Workbench for Obsidian](https://github.com/MartynKeigher/obsidian-workbench); the dark palette sits under `data-color-mode="dark"`.
- Base styles (`base.css`): page defaults, one keyboard focus ring, `.sr-only`, `.wb-scroll` for panes that always show their scrollbar, and headings and `b` / `strong` in their ink colors at zero specificity (`:where()`), so any class of yours still wins.
- `ColorMode`: a light / dark toggle that remembers the choice.

Page frame:

- Header bar (`header.css`): `.wb-header`, `.wb-bar`, `.wb-brand`, `.wb-actions`, `.wb-hbtn` (plus `-icon` and `-primary`) and `.wb-file-input`.
- `Tabs` (`tabs.css`): a tab strip with an optional Home tab, pinning, drag to reorder, keyboard moves, a right-click menu, and an `empty` option shown when no tabs are open.
- Status bar (`statusbar.css`): `.wb-statusbar`, `.wb-statusbar-item` and `.wb-statusbar-end`.
- Page footers (`footer.css`): `.wb-footer`, a dark bar to match the header bar, and `.wb-footer.wb-footer-columns`, a lighter, taller footer for overview pages. Its links are at least 24px tall (WCAG 2.2 target size). A page with a footer should make its status bar a named region (`<section class="wb-statusbar" aria-label="Status">`), since a page has one `<footer>`.

Content:

- Panes (`pane.css`): `.wb-pane`, `.wb-pane-head` and `.wb-count`, and `PaneToggle` to fold a pane to its headings.
- `Splitter` (`splitter.css`): resizes a side pane by dragging or from the keyboard, collapses it, and remembers both.
- Selectable lists (`list.css`), summary tiles (`tiles.css`), data tables (`table.css`, with `.wb-num` for number columns) and status pills (`pill.css`).
- Buttons (`button.css`): `.wb-btn`, `.wb-btn-primary`, `.wb-btn-danger` and `.wb-btn-row`.
- Forms (`form.css`): `.wb-input` for text inputs, textareas and selects (`.wb-select` adds the chevron), `.wb-check`, `.wb-switch`, `.wb-search`, `.wb-fieldset`, and `.wb-field`, `.wb-form` and `.wb-form-row` for layout, with hints and errors.
- Navigation: breadcrumbs (`breadcrumbs.css`), pagination (`pagination.css`), a segmented control (`segmented.css`) and in-page tabs (`tab-panels.css`, `TabPanels`).
- Data display: avatars, status dots and count badges (`avatar.css`), an accordion (`accordion.css`), key–value lists (`key-value.css`), tags (`tag.css`) and keyboard keys (`kbd.css`).

Feedback:

- `Toaster` / `toast` (`toast.css`): success, error and info toasts, tinted in their type's color.
- Message bars (`message.css`): `.wb-message` with `-ok`, `-warn` and `-err` (info is the default), outlined in their kind's color, each with an icon so color is never the only cue.
- A spinner, progress bar and skeletons (`progress.css`), and empty states (`empty-state.css`).
- `CopyButton` (`copy-button.css`): copies text and says "Copied", to screen readers too.

Overlays:

- Dialogs (`dialog.css`, `confirmDialog`): styles for a native `<dialog class="wb-dialog">`, and `confirmDialog()`, a yes / no question that resolves `true` or `false`.
- A dropdown menu (`menu.css`, `Menu`), tooltips (`tooltip.css`, `Tooltip`, with `Tooltip.attach()` for `data-tooltip`), popovers (`popover.css`, `Popover`), drawers (`drawer.css`), and help and info icons (`hint.css`).

`workbench.css` includes every style. Each also has its own entry point, as do the scripts (`./toast`, `./tabs`, `./color-mode`, `./copy-button`, `./dialog`, `./splitter`, `./pane-toggle`, `./tab-panels`, `./menu`, `./tooltip` and `./popover`).

The demo (`npm run dev`) shows every component on one page, with an overview page and a component library (`demo/components/`) of each component's variants and markup to copy.
