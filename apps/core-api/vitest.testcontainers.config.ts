import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'core-api-testcontainers',
    environment: 'node',
    include: ['src/**/*.testcontainers.spec.ts'],
    testTimeout: 120000,
    hookTimeout: 120000,
  },
});
