import { defineConfig } from 'tsdown';
import baseConfig from '../../tsdown.config.ts';

export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts'],
  // Note: dts generation disabled due to rolldown-plugin-dts issue with project references
  // The JavaScript build works fine, type definitions can be generated separately if needed
  dts: false,
});
