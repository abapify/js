/**
 * ts-xsd config for testing xs:include support
 */
import { rawSchema, indexBarrel } from '../../../src/generators/index.ts';
import type { CodegenConfig } from '../../../src/codegen/types.ts';

export default {
  sources: {
    'includes-test': {
      xsdDir: './',
      outputDir: './generated',
      schemas: ['document', 'common'],
    },
  },
  generators: [rawSchema(), indexBarrel()],
} satisfies CodegenConfig;
