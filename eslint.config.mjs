import { eslint } from '@siberiacancode/eslint';

export default eslint(
  {
    typescript: true,
    ignores: ['**/node_modules', 'dist/**', 'coverage/**', 'schema.json', '**/*.md', '**/*.md/**']
  },

  // The shared config applies these to every language it parses, and they throw
  // on JSON/YAML ("rules do not support the language jsonc/x").
  {
    name: 'jazzer/data-files',
    files: ['**/*.json', '**/*.jsonc', '**/*.yaml', '**/*.yml'],
    rules: {
      'arrow-body-style': 'off',
      'import/newline-after-import': 'off',
      'no-console': 'off',
      'prefer-template': 'off',
      'unicorn/no-typeof-undefined': 'off',
      'unicorn/no-useless-spread': 'off'
    }
  },

  {
    name: 'jazzer/typescript',
    files: ['**/*.?([cm])[jt]s?(x)', '**/*.vue'],
    rules: {
      'ts/consistent-type-definitions': ['error', 'type'],
      'ts/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
      'node/prefer-global/process': 'off'
    }
  },

  // French typography puts a no-break space before ":" and "?" and inside « ».
  {
    name: 'jazzer/locales',
    files: ['src/core/i18n/locales/*.json'],
    rules: {
      'no-irregular-whitespace': 'off'
    }
  },

  {
    name: 'jazzer/manifests',
    files: ['**/package.json', '**/tsconfig*.json'],
    rules: {
      'jsonc/sort-keys': 'off'
    }
  },

  // Commitizen loads the adapter with require(), so the shim has to stay CommonJS.
  {
    name: 'jazzer/commonjs-shim',
    files: ['index.cjs'],
    rules: {
      'unicorn/prefer-module': 'off'
    }
  },

  // Console is the output channel of build scripts.
  {
    name: 'jazzer/scripts',
    files: ['scripts/**'],
    rules: {
      'no-console': 'off',
      'antfu/no-top-level-await': 'off'
    }
  }
);
