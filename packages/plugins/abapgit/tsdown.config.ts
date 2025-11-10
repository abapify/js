import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  tsconfig: 'tsconfig.lib.json',
  platform: 'node',
  target: 'esnext',
  format: ['esm'],
  dts: { build: true },
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  exports: true,
});
