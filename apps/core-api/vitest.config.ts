import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'core-api',
    environment: 'node',
    include: ['src/**/*.spec.ts']
  }
});
