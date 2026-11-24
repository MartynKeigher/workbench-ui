import { ColorMode } from '../../src/index.js';
import { headerColorMode } from './page.js';

// Two toggles on one page: keep each one's icon in step with the other
const example = new ColorMode(document.getElementById('colorModeExample'), {
  onChange: (mode) => headerColorMode.apply(mode === 'dark'),
});
document.addEventListener('colormode', (event) => example.apply(event.detail === 'dark'));
