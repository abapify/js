// tsdown.config.ts
import { defineConfig } from 'tsdown';
import baseConfig from '../../tsdown.config.ts';

export default defineConfig({
  ...baseConfig,
  entry: ['./src/index.ts', './src/bin/adt.ts'],
  tsconfig: 'tsconfig.lib.json'
  // onSuccess: async () => {
  //   const { chmodSync } = await import('fs');
  //   const { join } = await import('path');
  //   const binPath = join(process.cwd(), 'dist', 'bin', 'adt.mjs');
  //   console.log('ℹ Granting execute permission to', binPath);
  //   chmodSync(binPath, 0o755);
  // },
});
