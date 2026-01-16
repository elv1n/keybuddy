import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    include: ['src/**/*.{test,spec}.ts'],
    benchmark: {
      include: ['src/**/*.bench.ts'],
    },
  },
});
