import { defineConfig } from 'tsdown';
import baseConfig from '../../tsdown.config.ts';

export default defineConfig({
  ...baseConfig,
  entry: { index: 'src/index.ts', 'bin/adt-server': 'src/bin/adt-server.ts' },
});
