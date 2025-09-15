// tsdown.config.ts
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts', './src/bin/adt.ts'],
  sourcemap: true,
  tsconfig: 'tsconfig.lib.json',
  skipNodeModulesBundle: true,
  external: ['@abapify/adk', '@abapify/adt-client'],
  dts: true,
});
