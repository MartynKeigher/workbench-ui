import { PaneToggle } from '../../src/index.js';

new PaneToggle(document.querySelector('#foldDetails .wb-pane-toggle'), {
  pane: document.getElementById('foldDetails'),
});
