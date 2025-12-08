/**
 * Test for DTEL (Data Element) schema
 * 
 * Fixture-driven: parses XML, validates content, round-trips
 */

import assert from 'node:assert';
import { runSchemaTests, createTypedSchema, type SchemaScenario } from './base/scenario.ts';
import { dtel as dtelSchema } from '../../src/schemas/generated/schemas/index.ts';
import type { AbapGitDtel } from '../../src/schemas/generated/types/index.ts';

const schema = createTypedSchema<AbapGitDtel>(dtelSchema);

const scenario: SchemaScenario<AbapGitDtel> = {
  name: 'DTEL',
  xsdName: 'dtel',
  schema,
  fixtures: [
    {
      path: 'dtel/zage_dtel_with_domain.dtel.xml',
      validate: (data) => {
        // Envelope
        assert.strictEqual(data.version, 'v1.0.0');
        assert.strictEqual(data.serializer, 'LCL_OBJECT_DTEL');
        assert.strictEqual(data.serializer_version, 'v1.0.0');
        assert.strictEqual(data.abap.version, '1.0');
        
        // DD04V content (data element)
        const dd04v = data.abap.values.DD04V;
        assert.strictEqual(dd04v.ROLLNAME, 'ZAGE_DTEL_WITH_DOMAIN');
        assert.strictEqual(dd04v.DDLANGUAGE, 'E');
        assert.strictEqual(dd04v.DOMNAME, 'ZAGE_CHAR_WITH_LENGTH');
        assert.strictEqual(dd04v.DDTEXT, 'Using Domain');
        assert.strictEqual(dd04v.REPTEXT, 'heading text');
        assert.strictEqual(dd04v.SCRTEXT_S, 'short text');
        assert.strictEqual(dd04v.SCRTEXT_M, 'medium text');
        assert.strictEqual(dd04v.SCRTEXT_L, 'very long text');
        assert.strictEqual(dd04v.HEADLEN, '55');
        assert.strictEqual(dd04v.SCRLEN1, '10');
        assert.strictEqual(dd04v.SCRLEN2, '20');
        assert.strictEqual(dd04v.SCRLEN3, '40');
        assert.strictEqual(dd04v.DTELMASTER, 'E');
        assert.strictEqual(dd04v.REFKIND, 'D');
      },
    },
  ],
};

runSchemaTests(scenario);
