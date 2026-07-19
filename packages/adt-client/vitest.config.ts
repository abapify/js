import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // These are compile-time/node:test fixtures from the pre-Vitest package
    // layout. `tsc --noEmit` remains their quality gate.
    exclude: [
      ...configDefaults.exclude,
      'tests/type-inference.test.ts',
      'tests/**/*-type-inference.test.ts',
    ],
  },
});
