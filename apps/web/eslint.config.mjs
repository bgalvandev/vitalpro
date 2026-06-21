import nextEslintPluginNext from '@next/eslint-plugin-next';
import nx from '@nx/eslint-plugin';
import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import baseConfig from '../../eslint.config.mjs';

export default [
  { plugins: { '@next/next': nextEslintPluginNext } },
  // The flat/react-typescript preset applies @typescript-eslint rules to all
  // of ts/cts/mts/tsx/js/cjs/mjs/jsx but does not register the plugin; the base
  // config only registers it for **/*.ts. Register it for the remaining file
  // types here (no overlap with the base **/*.ts block, so no "redefine plugin").
  {
    files: [
      '**/*.cts',
      '**/*.mts',
      '**/*.tsx',
      '**/*.js',
      '**/*.cjs',
      '**/*.mjs',
      '**/*.jsx',
    ],
    plugins: { '@typescript-eslint': tsEslintPlugin },
  },
  ...nx.configs['flat/react-typescript'],
  ...baseConfig,
  // The base config wires the TS parser for **/*.ts only; TSX/JSX need it too,
  // with JSX parsing enabled.
  {
    files: ['**/*.tsx', '**/*.jsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
      },
    },
  },
  {
    // Lint runs from the workspace root, so ignore the generated Next output
    // with a root-relative glob (a bare '.next/**' would not match here).
    ignores: ['**/.next/**'],
  },
];
