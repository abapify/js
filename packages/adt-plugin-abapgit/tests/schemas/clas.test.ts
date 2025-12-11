/**
 * Test for CLAS (Class) schema
 * 
 * Fixture-driven: parses XML, validates content, round-trips
 */

import assert from 'node:assert';
import { runSchemaTests, createTypedSchema, type SchemaScenario } from './base/scenario.ts';
import { clas as clasSchema } from '../../src/schemas/generated/schemas/index.ts';
import type { AbapGitType } from '../../src/schemas/generated/types/clas.ts';

const schema = createTypedSchema<AbapGitType>(clasSchema);

const scenario: SchemaScenario<AbapGitType> = {
  name: 'CLAS',
  xsdName: 'clas',
  schema,
  fixtures: [
    {
      path: 'clas/zcl_age_sample_class.clas.xml',
      validate: (data) => {
        // Envelope
        assert.strictEqual(data.version, 'v1.0.0');
        assert.strictEqual(data.serializer, 'LCL_OBJECT_CLAS');
        assert.strictEqual(data.serializer_version, 'v1.0.0');
        assert.strictEqual(data.abap.version, '1.0');
        
        // VSEOCLASS content
        const clas = data.abap.values.VSEOCLASS!;
        assert.strictEqual(clas.CLSNAME, 'ZCL_AGE_SAMPLE_CLASS');
        assert.strictEqual(clas.LANGU, 'E');
        assert.strictEqual(clas.DESCRIPT, 'Sample class');
        assert.strictEqual(clas.STATE, '1');
        assert.strictEqual(clas.CLSCCINCL, 'X');
        assert.strictEqual(clas.FIXPT, 'X');
        assert.strictEqual(clas.UNICODE, 'X');
        assert.strictEqual(clas.WITH_UNIT_TESTS, 'X');
        
      },
    },
  ],
};

runSchemaTests(scenario);
