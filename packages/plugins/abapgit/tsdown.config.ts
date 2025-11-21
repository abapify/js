import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  tsconfig: 'tsconfig.lib.json',
  platform: 'node',
  target: 'esnext',
  format: ['esm'],
  dts: { build: false }, // Temporarily disabled due to rolldown-plugin-dts bug with ADK types
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  exports: true,
  external: [
    // External all node built-ins and npm packages to avoid bundling issues
    /^node:/,
    /^@abapify\//,
    'fast-xml-parser',
  ],
});
