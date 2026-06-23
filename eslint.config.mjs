import nxPlugin from '@nx/eslint-plugin';
import securityPlugin from 'eslint-plugin-security';
import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  ...nxPlugin.configs['flat/base'],
  // Node security linting, scoped to the request-handling backend runtime
  // (core-api + domain/data libraries) where untrusted input flows. Not applied to
  // apps/web (browser/React — these rules target Node APIs) nor to tools/scripts
  // (local build tooling that legitimately does fs I/O with computed paths).
  // `detect-object-injection` is disabled: it flags every computed member access
  // (obj[key]) and is too noisy to be a useful gate.
  {
    files: ['apps/core-api/**/*.ts', 'libs/**/*.ts'],
    plugins: { security: securityPlugin },
    rules: {
      ...securityPlugin.configs.recommended.rules,
      'security/detect-object-injection': 'off',
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
      },
    },
    plugins: {
      '@typescript-eslint': tsEslintPlugin,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'surface:core',
              onlyDependOnLibsWithTags: ['surface:core', 'scope:shared'],
            },
            {
              sourceTag: 'surface:health',
              onlyDependOnLibsWithTags: [
                'surface:health',
                'surface:core',
                'scope:shared',
              ],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      '**/vitest.config.*.timestamp*',
    ],
  },
  {
    files: ['**/*.json'],
    // Override or add rules here
    rules: {},
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
];
