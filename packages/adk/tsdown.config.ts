// tsdown.config.ts
import { defineConfig } from 'tsdown';

export default defineConfig({
  sourcemap: false,
  tsconfig: 'tsconfig.lib.json',
  skipNodeModulesBundle: true,
  external: ['fast-xml-parser', 'fxmlp', 'vitest'],
  dts: false,
  minify: false,
});
