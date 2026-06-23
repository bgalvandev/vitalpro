import nextEslintPluginNext from '@next/eslint-plugin-next';
import nx from '@nx/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
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
  // React Compiler / Rules-of-React lint. eslint-plugin-react-hooks v7 ships the
  // compiler diagnostics (purity, set-state-in-render, preserve-manual-memoization,
  // immutability, ...) as errors via `recommended-latest`. The nx react preset does
  // not register this plugin, so we register it explicitly. Its own `plugins` map is
  // malformed (keys under '0'), so we apply only its `rules`.
  {
    files: ['**/*.{ts,tsx,jsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs['recommended-latest'].rules,
  },
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
