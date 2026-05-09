import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'core-api-integration',
    environment: 'node',
    include: ['src/**/*.integration.spec.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
