import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },

  // Application source: full type-aware linting.
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Numbers in template literals are safe and ubiquitous; the strict default
      // banning them forces noisy .toString() everywhere for no real safety gain.
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      // Empty arrow functions are common as intentional no-ops in React effect
      // cleanups and promise catch handlers.
      '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
      'func-style': ['error', 'expression'],
    },
  },

  // Build/config files run in Node, outside the app tsconfig.
  {
    files: ['*.{js,ts}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node },
  },
)
