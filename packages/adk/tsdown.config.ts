import { defineConfig } from 'tsdown';
import baseConfig from '../../tsdown.config.ts';


export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts'],
  tsconfig: 'tsconfig.lib.json',
  // DTS generation via tsc in onSuccess hook (tsdown's dts has issues with monorepo)
  dts: true,
  // onSuccess: async () => {
  //   console.log('Generating .d.ts files with tsc...');
  //   execSync('tsc --project tsconfig.lib.json --emitDeclarationOnly --declaration --declarationMap', {
  //     cwd: import.meta.dirname,
  //     stdio: 'inherit'
  //   });
  //   console.log('✓ Declaration files generated');
  // },
});
