import { defineConfig } from 'tsdown';
import baseConfig from '../../tsdown.config.ts';

export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts', 'src/cli.ts', 'src/loader.ts', 'src/register.ts', 'src/codegen.ts'],
});
