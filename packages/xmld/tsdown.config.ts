// tsdown.config.ts
import { defineConfig } from 'tsdown';
import baseConfig from '../../tsdown.config.ts';

export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts'],
  sourcemap: true,
  tsconfig: 'tsconfig.lib.json',
  skipNodeModulesBundle: true,
  external: ['vitest'],
  dts: true,
  minify: false,
});
