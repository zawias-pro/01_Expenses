import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const config = defineConfig([
  globalIgnores(['.yarn', '*.config.{js,ts}']),
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['cypress/**'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportNamedDeclaration[declaration!=null]',
          message: 'Inline exports are not allowed. Use a single export block at the end of the file instead.',
        },
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Default exports are not allowed. Use named exports instead.',
        },
      ],
      'semi': ['error', 'never'],
    },
  },
  {
    files: ['cypress/**/*.{ts,js}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        cy: 'readonly',
        Cypress: 'readonly',
      },
    },
  },
])

export default config
