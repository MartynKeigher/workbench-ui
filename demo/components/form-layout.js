import { toast } from '../../src/index.js';

// Demo only: stay on the page
document.querySelector('[data-example] form').addEventListener('submit', (event) => {
  event.preventDefault();
  toast.success('Saved (not really).');
});
