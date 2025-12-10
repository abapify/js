/**
 * ts-xsd config for testing xs:include support
 */
import { presets } from '../../../src/codegen/presets.ts';
import type { CodegenConfig } from '../../../src/codegen/types.ts';

export default {
  sources: {
    'includes-test': {
      xsdDir: './',
      outputDir: './generated',
      schemas: ['document', 'common'],
    },
  },
  generators: presets.simpleSchemas(),
} satisfies CodegenConfig;
