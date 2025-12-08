/**
 * Test for DEVC (Development Class/Package) schema
 * 
 * Fixture-driven: parses XML, validates content, round-trips
 */

import assert from 'node:assert';
import { runSchemaTests, createTypedSchema, type SchemaScenario } from './base/scenario.ts';
import { devc as devcSchema } from '../../src/schemas/generated/schemas/index.ts';
import type { AbapGitDevc } from '../../src/schemas/generated/types/index.ts';

const schema = createTypedSchema<AbapGitDevc>(devcSchema);

const scenario: SchemaScenario<AbapGitDevc> = {
  name: 'DEVC',
  xsdName: 'devc',
  schema,
  fixtures: [
    {
      path: 'devc/package.devc.xml',
      validate: (data) => {
        // Envelope attributes
        assert.strictEqual(data.version, 'v1.0.0');
        assert.strictEqual(data.serializer, 'LCL_OBJECT_DEVC');
        assert.strictEqual(data.serializer_version, 'v1.0.0');
        
        // asx:abap
        assert.strictEqual(data.abap.version, '1.0');
        
        // DEVC content
        const devc = data.abap.values.DEVC;
        assert.strictEqual(devc.CTEXT, 'Classes');
      },
    },
  ],
};

runSchemaTests(scenario);
