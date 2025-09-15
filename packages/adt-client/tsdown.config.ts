// tsdown.config.ts
import { defineConfig } from 'tsdown';

export default defineConfig({
  sourcemap: true,
  tsconfig: 'tsconfig.lib.json',
  skipNodeModulesBundle: true,
  external: ['fast-xml-parser', 'open', 'pino'],
  dts: true,
});
