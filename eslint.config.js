import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const config = defineConfig([
  globalIgnores(['.yarn', '*.config.{js,ts}']),
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.strict,
      tseslint.configs.strictTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: './tsconfig.app.json',
      },
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
        {
          selector: 'FunctionDeclaration',
          message: 'Function declarations are not allowed. Use arrow functions instead.',
        },
      ],
      'eol-last': ['error', 'always'],
      'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 0 }],
      'semi': ['error', 'never'],
    },
  },
  {
    files: ['src/**/*.test.ts'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
      parserOptions: {
        project: './tsconfig.app.json',
      },
    },
    rules: {
      'no-restricted-syntax': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      'semi': ['error', 'never'],
    },
  },
  {
    files: ['cypress/**/*.{ts,js}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        cy: 'readonly',
        Cypress: 'readonly',
      },
      parserOptions: {
        project: './cypress/tsconfig.json',
      },
    },
    rules: {
      'no-restricted-syntax': 'off',
      '@typescript-eslint/no-namespace': 'off',
      'semi': ['error', 'never'],
    },
  },
])

export default config
