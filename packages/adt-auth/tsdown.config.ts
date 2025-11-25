import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/plugins/basic.ts'],
  format: ['esm'],
  clean: true,
  dts: true,
  sourcemap: true,
});
