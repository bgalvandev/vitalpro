import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'health-domain',
    environment: 'node',
    include: ['src/**/*.spec.ts']
  }
});
