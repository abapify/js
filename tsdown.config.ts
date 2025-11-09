import { defineConfig } from 'tsdown';

export default defineConfig({
  platform: 'node',
  target: 'esnext',
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  exports: true,
});
