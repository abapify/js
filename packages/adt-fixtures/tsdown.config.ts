import { defineConfig } from 'tsdown';
import { cpSync } from 'node:fs';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  onSuccess: () => {
    // Copy fixtures to dist (XML files aren't bundled by tsdown)
    cpSync('src/fixtures', 'dist/fixtures', { recursive: true });
  },
});
