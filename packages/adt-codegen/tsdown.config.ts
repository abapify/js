import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts', 'src/plugins/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  shims: true,
  platform: 'node',
  target: 'node18',
  outDir: 'dist',
});
