// .eslintrc.cjs
module.exports = {
    root: true,
    env: {
      browser: true,
      es2020: true,
      jest: true
    },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended'
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['react-refresh', 'simple-import-sort'],
    rules: {
      'react-refresh/only-export-components': 'warn',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-console': 'warn'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }