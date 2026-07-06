import { defineConfig } from 'vitest/config';

/**
 * Minimal vitest config for astro-core. Node environment (adapters are pure
 * functions, no DOM), snapshots colocated next to the tests under tests/.
 */
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    globals: false,
  },
});
