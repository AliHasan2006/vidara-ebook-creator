module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
  ],
  rules: {
    // Disable specific rules that are causing issues
    'jsx-a11y/anchor-is-valid': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'no-restricted-globals': 'off',
  },
  overrides: [
    {
      files: ['**/*.test.tsx', '**/*.test.ts'],
      env: {
        jest: true,
      },
    },
  ],
};
