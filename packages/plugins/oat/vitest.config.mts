import { createVitestConfig } from '../../../vitest.base.config.mjs';
import { resolve } from 'path';

export default createVitestConfig({
  test: {
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
