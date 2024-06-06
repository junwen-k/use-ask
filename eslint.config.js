import { fixupConfigRules } from '@eslint/compat'
import { FlatCompat } from '@eslint/eslintrc'
import eslint from '@eslint/js'
import nextPlugin from '@next/eslint-plugin-next'
import turbo from 'eslint-config-turbo'
import importPlugin from 'eslint-plugin-import'
import prettier from 'eslint-plugin-prettier/recommended'
import reactPlugin from 'eslint-plugin-react'
import reactJSXRuntime from 'eslint-plugin-react/configs/jsx-runtime.js'
import reactRecommended from 'eslint-plugin-react/configs/recommended.js'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

const compat = new FlatCompat()

export default tseslint.config(
  {
    ignores: ['node_modules/', 'packages/**/dist/'],
  },
  {
    files: ['examples/shadcn-ui/**/*.{js?(x),mjs,ts?(x),mdx}'],
    extends: [...fixupConfigRules(compat.config(nextPlugin.configs['core-web-vitals']))],
    settings: {
      next: {
        rootDir: ['apps/*/'],
      },
    },
  },
  {
    files: ['**/*.{js?(x),mjs,ts?(x),mdx}'],
    extends: [
      eslint.configs.recommended,
      ...fixupConfigRules(compat.config(importPlugin.configs.recommended)),
      ...fixupConfigRules(compat.config(importPlugin.configs.typescript)),
      ...fixupConfigRules(compat.config(turbo)),
    ],
    rules: {
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['sibling', 'parent'], 'index', 'unknown'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/namespace': 'off',
      'import/no-named-as-default-member': 'off',
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: ['examples/*/tsconfig.json', 'packages/*/tsconfig.json'],
        },
      },
    },
  },
  {
    files: ['**/*.ts?(x)'],
    extends: [...tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/array-type': ['error', { default: 'generic' }],
    },
  },
  {
    files: ['**/*.{js?(x),ts?(x)}'],
    ...reactRecommended,
    ...reactJSXRuntime,
    rules: {
      ...reactRecommended.rules,
      ...reactJSXRuntime.rules,
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
    },
    languageOptions: {
      ...reactRecommended.languageOptions,
      ...reactJSXRuntime.languageOptions,
    },
    plugins: {
      react: reactPlugin,
    },
    extends: [
      ...compat.config(reactHooksPlugin.configs.recommended),
      ...fixupConfigRules(compat.config(importPlugin.configs.react)),
    ],
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  prettier
)
