import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'bin/adt-mcp': 'src/bin/adt-mcp.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['@abapify/adt-client', '@abapify/adt-contracts'],
});
