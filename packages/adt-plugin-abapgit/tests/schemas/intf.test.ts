/**
 * Test for INTF (Interface) schema
 * 
 * Fixture-driven: parses XML, validates content, round-trips
 */

import assert from 'node:assert';
import { runSchemaTests, createTypedSchema, type SchemaScenario } from './base/scenario.ts';
import { intf as intfSchema } from '../../src/schemas/generated/schemas/index.ts';
import type { AbapGitIntf } from '../../src/schemas/generated/types/index.ts';

const schema = createTypedSchema<AbapGitIntf>(intfSchema);

const scenario: SchemaScenario<AbapGitIntf> = {
  name: 'INTF',
  xsdName: 'intf',
  schema,
  fixtures: [
    {
      path: 'intf/zif_age_test.intf.xml',
      validate: (data) => {
        // Envelope
        assert.strictEqual(data.version, 'v1.0.0');
        assert.strictEqual(data.serializer, 'LCL_OBJECT_INTF');
        assert.strictEqual(data.serializer_version, 'v1.0.0');
        assert.strictEqual(data.abap.version, '1.0');
        
        // VSEOINTERF content (interface)
        const intf = data.abap.values.VSEOINTERF;
        assert.strictEqual(intf.CLSNAME, 'ZIF_AGE_TEST');
        assert.strictEqual(intf.LANGU, 'E');
        assert.strictEqual(intf.DESCRIPT, 'Test interface');
        assert.strictEqual(intf.EXPOSURE, '2');
        assert.strictEqual(intf.STATE, '1');
        assert.strictEqual(intf.UNICODE, 'X');
      },
    },
  ],
};

runSchemaTests(scenario);
