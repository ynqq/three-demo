const ruleValue = process.env.NODE_ENV === 'production' ? 2 : 1; //0:close;1:warning;2:open
module.exports = {
  root: true,
  env: {
    node: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-recommended',
    'prettier',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/ban-types': 'off',
    'no-console': ruleValue,
    'no-debugger': ruleValue,
    'no-alert': ruleValue,
    'no-constant-condition': ruleValue,
    'no-dupe-keys': ruleValue,
    'no-dupe-args': ruleValue,
    'no-empty': ruleValue,
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [ruleValue, { varsIgnorePattern: '[_]' }],
    'no-inline-comments': 0,
    'no-var': 2,
    '@typescript-eslint/explicit-module-boundary-types': [0],
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/no-explicit-any': 0,
  },
};
