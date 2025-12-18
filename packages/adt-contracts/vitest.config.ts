import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '#base': resolve(__dirname, 'src/base.ts'),
      '#schemas': resolve(__dirname, 'src/schemas.ts'),
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
