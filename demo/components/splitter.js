import { Splitter } from '../../src/index.js';

new Splitter(document.querySelector('.demo-lib-split .wb-splitter'), {
  target: document.getElementById('splitFiles'),
  size: 180,
  min: 120,
  max: 360,
});
