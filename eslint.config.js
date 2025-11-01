import js from '@eslint/js'
import react from 'eslint-plugin-react'
import prettier from 'eslint-plugin-prettier'
import configPrettier from 'eslint-config-prettier'
import globals from 'globals'
import babelParser from '@babel/eslint-parser'

export default [
  {
    ignores: [
      'dist/**',
      'public/**',
      'node_modules/**',
      'test*.js',
      'test-*.js',
      'test/**',
      'implement-features.*',
    ],
  },
  js.configs.recommended,
  configPrettier,
  {
    files: ['**/*.{js,jsx}'],
    plugins: { react, prettier },
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        requireConfigFile: false,
        babelOptions: { presets: ['@babel/preset-react'] },
      },
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'prettier/prettier': ['error', { singleQuote: true, semi: false, trailingComma: 'es5' }],
      'react/react-in-jsx-scope': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-unused-vars': 'off',
    },
    settings: { react: { version: 'detect' } },
  },
]
