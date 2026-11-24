// Every component, in nav order. Each id matches a section in index.html.
export const COMPONENTS = [
  { group: 'Foundations', id: 'base', label: 'Base styles' },
  { group: 'Foundations', id: 'tokens', label: 'Design tokens' },
  { group: 'Actions & feedback', id: 'buttons', label: 'Buttons' },
  { group: 'Actions & feedback', id: 'copy-button', label: 'Copy button' },
  { group: 'Actions & feedback', id: 'empty-state', label: 'Empty state' },
  { group: 'Actions & feedback', id: 'light-dark', label: 'Light / dark toggle' },
  { group: 'Actions & feedback', id: 'loading', label: 'Loading' },
  { group: 'Actions & feedback', id: 'message-bar', label: 'Message bar' },
  { group: 'Actions & feedback', id: 'toasts', label: 'Toasts' },
  { group: 'App chrome', id: 'footer', label: 'Footer' },
  { group: 'App chrome', id: 'header-bar', label: 'Header bar' },
  { group: 'App chrome', id: 'splitter', label: 'Splitter' },
  { group: 'App chrome', id: 'status-bar', label: 'Status bar' },
  { group: 'App chrome', id: 'tabs', label: 'Tabs' },
  { group: 'Content', id: 'accordion', label: 'Accordion' },
  { group: 'Content', id: 'avatar', label: 'Avatar and badges' },
  { group: 'Content', id: 'table', label: 'Data table' },
  { group: 'Content', id: 'key-value', label: 'Key–value list' },
  { group: 'Content', id: 'kbd', label: 'Keyboard keys' },
  { group: 'Content', id: 'panes', label: 'Panes' },
  { group: 'Content', id: 'list', label: 'Selectable list' },
  { group: 'Content', id: 'pills', label: 'Status pills' },
  { group: 'Content', id: 'tiles', label: 'Summary tiles' },
  { group: 'Content', id: 'tags', label: 'Tags' },
  { group: 'Forms', id: 'checkbox-radio', label: 'Checkbox and radio' },
  { group: 'Forms', id: 'form-layout', label: 'Form layout' },
  { group: 'Forms', id: 'search', label: 'Search field' },
  { group: 'Forms', id: 'select', label: 'Select' },
  { group: 'Forms', id: 'switch', label: 'Switch' },
  { group: 'Forms', id: 'text-input', label: 'Text input' },
  { group: 'Navigation', id: 'breadcrumbs', label: 'Breadcrumbs' },
  { group: 'Navigation', id: 'tab-panels', label: 'In-page tabs' },
  { group: 'Navigation', id: 'pagination', label: 'Pagination' },
  { group: 'Navigation', id: 'segmented', label: 'Segmented control' },
  { group: 'Overlays', id: 'dialog', label: 'Dialog' },
  { group: 'Overlays', id: 'drawer', label: 'Drawer' },
  { group: 'Overlays', id: 'menu', label: 'Dropdown menu' },
  { group: 'Overlays', id: 'hint', label: 'Help & info icons' },
  { group: 'Overlays', id: 'popover', label: 'Popover' },
  { group: 'Overlays', id: 'tooltip', label: 'Tooltip' },
];

export function renderNav(nav, current) {
  const groups = [...new Set(COMPONENTS.map((c) => c.group))];
  nav.replaceChildren(
    ...groups.flatMap((group) => {
      const head = document.createElement('h2');
      head.className = 'wb-pane-head';
      head.textContent = group;
      const list = document.createElement('ul');
      list.className = 'wb-list';
      for (const { id, label } of COMPONENTS.filter((c) => c.group === group)) {
        const link = document.createElement('a');
        link.className = 'wb-list-item';
        link.href = `#${id}`;
        link.textContent = label;
        if (id === current) link.setAttribute('aria-current', 'page');
        const item = document.createElement('li');
        item.append(link);
        list.append(item);
      }
      return [head, list];
    }),
  );
}
