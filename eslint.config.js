import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['node_modules/', 'coverage/', 'dist/'] },
  js.configs.recommended,
  { files: ['src/**/*.js', 'demo/**/*.js'], languageOptions: { globals: globals.browser } },
  {
    files: ['test/**/*.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  { files: ['*.config.js'], languageOptions: { globals: globals.node } },
  prettier,
];
