import { Tabs } from '../../src/index.js';

const strip = (id, options = {}) => {
  const tabs = new Tabs({
    element: document.getElementById(id),
    onSelect: (tab) => tabs.activate(tab),
    onClose: (tab) => tabs.close(tab),
    onHome: () => tabs.activate(null),
    ...options,
  });
  return tabs;
};

const openPlain = () => {
  plain.open('plan', 'Project plan');
  plain.open('notes', 'Release notes');
  plain.open('q3', 'Q3 report');
};
const plain = strip('tabsPlain', {
  empty: { text: 'No open files.', action: 'Reopen them', onAction: openPlain },
});
openPlain();

const home = strip('tabsHome');
home.setHome(true);
home.open('q3', 'Q3 report');
home.activate(null);

const pinned = strip('tabsPinned', {
  empty: {
    text: 'No open documents.',
    action: 'Reopen them',
    onAction: () => {
      pinned.open('guide', 'Style guide');
      pinned.togglePin('guide');
      pinned.open('roadmap', 'Roadmap');
    },
  },
});
pinned.open('guide', 'Style guide');
pinned.togglePin('guide');
pinned.open('roadmap', 'Roadmap');
