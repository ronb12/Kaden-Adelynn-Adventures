import js from '@eslint/js'
import react from 'eslint-plugin-react'
import prettier from 'eslint-plugin-prettier'
import configPrettier from 'eslint-config-prettier'

export default [
  js.configs.recommended,
  configPrettier,
  {
    files: ['**/*.{js,jsx}'],
    plugins: { react, prettier },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module'
    },
    rules: {
      'prettier/prettier': ['error', { singleQuote: true, semi: false, trailingComma: 'es5' }],
      'react/react-in-jsx-scope': 'off'
    }
  }
]
