return {
  extends: 'react-app',
  overrides: {
    files: ['**/*.ts', '**/*.tsx'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true
      },

      // typescript-eslint specific options
      warnOnUnsupportedTypeScriptVersion: true
    },
    plugins: ['@typescript-eslint'],

    rules: {
      '@typescript-eslint/no-unused-vars': 'off'
    }
  }
};
