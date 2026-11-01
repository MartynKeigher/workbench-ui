# Workbench UI

A calm, dense UI kit for tool-style web apps: the kind with a dark header bar, tabs of open
documents and panes of detail underneath.

- **Design tokens** for every colour, font and shadow, with a matching dark palette
- **Header bar**, **tabs** and **toasts**, ready to drop in
- **Light / dark toggle** that remembers the choice
- **Plain JavaScript and CSS.** No framework and no build step, so it works with any bundler or
  framework, or with none.

Run `npm run dev` to open the demo page with every component on it.

## Install

The package installs straight from this repository's release tags:

```bash
npm install github:MartynKeigher/workbench-ui#v0.1.0
```

In `package.json` that reads:

```json
"dependencies": {
  "@martynkeigher/workbench-ui": "github:MartynKeigher/workbench-ui#v0.1.0"
}
```

`#v0.1.0` pins one release, so every install of your project gets exactly the same kit. See
[Staying up to date](#staying-up-to-date) to have new releases arrive on their own.

## Use

### Styles

Import the whole kit once, from CSS:

```css
@import '@martynkeigher/workbench-ui/fonts.css'; /* optional: Source Sans 3 and Source Code Pro */
@import '@martynkeigher/workbench-ui/workbench.css';
```

Or from JavaScript, with a bundler such as Vite:

```js
import '@martynkeigher/workbench-ui/workbench.css';
```

To take only some parts, import them one by one. `tokens.css` comes first, because the rest uses
it.

| File         | What's in it                                                    |
| ------------ | --------------------------------------------------------------- |
| `tokens.css` | Every colour, font and shadow, light and dark                   |
| `base.css`   | Page defaults, the focus ring, `.sr-only`, `.wb-scroll`         |
| `header.css` | The header bar and its buttons                                  |
| `tabs.css`   | The tab strip and its menu                                      |
| `toast.css`  | Toasts                                                          |
| `fonts.css`  | The two typefaces, from Google Fonts. Without it, system fonts. |

### Header bar

```html
<header class="wb-header">
  <div class="wb-bar">
    <div class="wb-brand">
      <svg class="wb-brand-mark" width="22" height="22">…</svg>
      <span class="wb-brand-name">My tool</span>
    </div>
    <div class="wb-actions">
      <input class="wb-file-input" id="open" type="file" />
      <label class="wb-hbtn" for="open">Open file</label>
      <button class="wb-hbtn wb-hbtn-primary" type="button">Export</button>
      <button class="wb-hbtn wb-hbtn-icon" type="button" id="colorMode"></button>
    </div>
  </div>
  <nav class="wb-tabs" aria-label="Open files"></nav>
</header>
```

### Toasts

```js
import { toast } from '@martynkeigher/workbench-ui';

toast.success('Saved.');
toast.error('That file could not be read.', { duration: 6000 });
toast.info('Three rows were skipped.', { title: 'Heads up' });
toast.show('Report saved as PDF.', { type: 'success', title: 'Exported' });
```

| Option     | Default                                  |                                  |
| ---------- | ---------------------------------------- | -------------------------------- |
| `type`     | `'success'`                              | `'success'`, `'error'`, `'info'` |
| `title`    | `Done` / `Something went wrong` / `Note` | Heading over the message         |
| `duration` | `3000`                                   | Milliseconds on screen           |

Messages and titles are set as text, never as HTML, so anything can be passed in. Toasts stack
in the top-right corner. Set `--wb-toast-top` to move them below a header:

```css
:root {
  --wb-toast-top: 104px;
}
```

For more than one stack, or other default titles, make your own `new Toaster({ container, titles })`.

### Tabs

```js
import { Tabs } from '@martynkeigher/workbench-ui';

const tabs = new Tabs({
  element: document.querySelector('.wb-tabs'),
  onSelect: (id) => {
    tabs.activate(id);
    show(id);
  },
  onClose: (id) => show(tabs.close(id)), // close() returns the tab to show next
  onHome: () => {
    tabs.activate(null);
    showHome();
  },
  homeTitle: 'Overview',
});

tabs.setHome(true); // optional Home tab, always first
tabs.open('report-1', 'Q3 report');
```

People can pin tabs, drag them into a different order, move them with Ctrl+Shift+← / →, and
right-click (or press Shift+F10) for a menu that pins, closes, closes the others, closes those to
the right, or sorts A to Z. The strip keeps no content: your `onSelect` decides what each id
shows.

| Method                 |                                                       |
| ---------------------- | ----------------------------------------------------- |
| `open(id, title)`      | Add a tab, or retitle an open one, and make it active |
| `close(id)`            | Remove a tab. Returns the id to show next, or `null`  |
| `activate(id \| null)` | Make a tab active (`null`: Home)                      |
| `setHome(show)`        | Show or hide the Home tab                             |
| `has(id)`              | Whether a tab is open                                 |
| `togglePin(id)`        | Pin or unpin                                          |
| `sortUnpinned()`       | Sort unpinned tabs A to Z                             |
| `destroy()`            | Remove the menu and every listener                    |

### Light and dark

```js
import { ColorMode, applySavedColorMode } from '@martynkeigher/workbench-ui';

applySavedColorMode(); // as early as you can, so a dark page never flashes light
new ColorMode(document.getElementById('colorMode'), {
  onChange: (mode) => console.log(mode), // 'light' or 'dark'
});
```

It sets `data-color-mode="light"` or `"dark"` on `<html>` and keeps the choice in
`localStorage` (key `colorMode`; pass `storageKey` to change it). An empty button gets moon and
sun icons. A button with its own `.wb-icon-moon` and `.wb-icon-sun` elements keeps them.

## Theming

Every colour is a custom property. Override any of them after the kit loads, for one palette or
both:

```css
:root {
  --accent: #6b3fd1;
  --accent-ink: #4f2aa6;
  --header-accent: #b49cff;
}

:root[data-color-mode='dark'] {
  --accent: #a58cff;
}
```

The full list, with the role of each one, is in [`src/tokens.css`](src/tokens.css). Your own
styles can use the same tokens (`var(--pane)`, `var(--line)`, `var(--muted)`…), so new screens
match the kit without copying any values.

## Staying up to date

Releases are tagged `vX.Y.Z` and follow [semantic versioning](https://semver.org/). See
[CHANGELOG.md](CHANGELOG.md).

- **Patch and minor** releases (fixes, new components, new options) never need changes on your
  side.
- **Major** releases rename or remove something. The changelog says what to change.

To have new releases arrive without lifting a finger, turn on
[Renovate](https://github.com/apps/renovate) for your project and add this `renovate.json`:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:recommended"],
  "packageRules": [
    {
      "matchDepNames": ["@martynkeigher/workbench-ui"],
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true,
      "minimumReleaseAge": null,
      "schedule": ["at any time"]
    }
  ]
}
```

Renovate watches this repository's tags. Each new patch or minor release opens a pull request
in your project that moves the pinned tag (`#v0.1.0` → `#v0.1.1`). Once your checks pass, it
merges itself. Major releases still open a pull request but wait for you, since they may
need changes. (This needs branch protection with required status checks, so a failing build
blocks the merge.)

## Develop

```bash
npm install
```

```bash
npm run dev
```

```bash
npm test
```

`npm run lint` and `npm run format:check` run in CI with the tests.

### Releasing

1. Bump `version` in `package.json`: patch for fixes, minor for anything new, major for anything
   renamed or removed.
2. Add a section for it at the top of `CHANGELOG.md`.
3. Merge to `main`. The release workflow tags `vX.Y.Z` and makes a GitHub release from the
   changelog section.

## Licence

[MIT](LICENSE)
