import { CopyButton } from '../../src/index.js';

new CopyButton(document.getElementById('copyPlain'), { text: 'https://example.com/q3-report' });
new CopyButton(document.getElementById('copyIcon'), { getText: () => 'Q3-2026-114' });
