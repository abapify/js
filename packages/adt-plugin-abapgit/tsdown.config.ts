import { defineConfig } from 'tsdown';
import baseConfig from '../../tsdown.config.ts';

export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts'],
  tsconfig: 'tsconfig.lib.json',
  dts: { build: false }, // Temporarily disabled due to rolldown-plugin-dts bug with ADK types
  external: [
    // External all node built-ins and npm packages to avoid bundling issues
    /^node:/,
    /^@abapify\//,
  ],
});
