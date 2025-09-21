import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // ensures reflect-metadata is loaded
    setupFiles: ['reflect-metadata'],
  },
  plugins: [
    swc.vite({
      // Configure SWC parser to allow decorators
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
        },
        transform: {
          decoratorMetadata: true,
        },
      },
    }),
  ],
  esbuild: false, // so it's not used where we need metadata
});
