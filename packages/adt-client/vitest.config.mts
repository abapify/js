import { createVitestConfig } from '../../vitest.base.config.mjs';

export default createVitestConfig({
  test: {
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
