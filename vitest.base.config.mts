import { defineConfig } from 'vitest/config';

export function createVitestConfig(config: any = {}) {
  return defineConfig({
    test: {
      watch: false,
      globals: true,
      environment: 'node',
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: ['node_modules/**', 'dist/**'],
      reporters: ['default'],
      passWithNoTests: true,
      coverage: {
        enabled: false,
      },
      ...config.test,
    },
    ...config,
  });
}
