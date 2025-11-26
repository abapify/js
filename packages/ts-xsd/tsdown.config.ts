import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts', 'src/loader.ts', 'src/register.ts', 'src/codegen.ts'],
  dts: true,
});
