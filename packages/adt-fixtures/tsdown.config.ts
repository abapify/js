import { defineConfig } from 'tsdown';
import { cpSync } from 'node:fs';
import { baseOptions } from '../../tsdown.config.ts';

export default defineConfig({
  ...baseOptions,
  entry: ['src/index.ts'],
  onSuccess: () => {
    // Copy fixtures to dist (XML files aren't bundled by tsdown)
    cpSync('src/fixtures', 'dist/fixtures', { recursive: true });
  },
});
