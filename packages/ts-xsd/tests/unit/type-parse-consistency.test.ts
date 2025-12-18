/**
 * Test to verify that generated types match parse() behavior
 * 
 * This test proves the design gap between:
 * - Generated types: wrap with element name { elementName: Type }
 * - parse(): returns content directly without wrapper
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseXml, buildXml } from '../../src/xml/index';
import { schemaToSourceFile } from '../../src/codegen/ts-morph';
import type { SchemaLike } from '../../src/xsd/schema-like';
import type { Schema } from '../../src/xsd/types';

describe('Type and Parse Consistency', () => {
  // Simple schema with one root element
  const personSchema = {
    $filename: 'person.xsd',
    element: [{ name: 'person', type: 'PersonType' }],
    complexType: [
      {
        name: 'PersonType',
        sequence: {
          element: [
            { name: 'name', type: 'xs:string' },
            { name: 'age', type: 'xs:int' },
          ],
        },
      },
    ],
  } as const satisfies SchemaLike;

  const personXml = `<person><name>John</name><age>30</age></person>`;

  describe('Consistent behavior (FIXED)', () => {
    it('parse() returns content WITHOUT element wrapper', () => {
      const result = parseXml(personSchema, personXml);
      
      // parse() returns { name: 'John', age: 30 }
      // NOT { person: { name: 'John', age: 30 } }
      assert.deepStrictEqual(result, { name: 'John', age: 30 });
      assert.ok(!('person' in result), 'parse() should NOT wrap with element name');
    });

    it('generated type does NOT wrap with element name (matches parse)', () => {
      const { sourceFile } = schemaToSourceFile(personSchema as unknown as Schema);
      const code = sourceFile.getFullText();
      
      // Generated type is: PersonType (directly, no wrapper)
      // NOT: { person: PersonType }
      assert.ok(
        code.includes('export type PersonSchema = PersonType'),
        'Generated type should be PersonType directly'
      );
      assert.ok(
        !code.includes('person: PersonType'),
        'Generated type should NOT wrap with element name'
      );
    });

    it('PROVES CONSISTENCY: parse result matches generated type structure', () => {
      const parsed = parseXml(personSchema, personXml);
      const { sourceFile } = schemaToSourceFile(personSchema as unknown as Schema);
      const code = sourceFile.getFullText();

      // parse() returns: { name: 'John', age: 30 }
      // Generated type is: PersonType = { name?: string, age?: number }
      
      // Both have 'name' at root level - CONSISTENT!
      assert.ok('name' in parsed, 'parsed has name at root');
      assert.ok(!('person' in parsed), 'parsed does NOT have person wrapper');
      assert.ok(!code.includes('person: PersonType'), 'type does NOT have person wrapper');
      assert.ok(code.includes('export type PersonSchema = PersonType'), 'type IS PersonType directly');
    });
  });

  describe('Roundtrip consistency', () => {
    it('parse -> build -> parse should be consistent', () => {
      const parsed1 = parseXml(personSchema, personXml);
      const built = buildXml(personSchema, parsed1);
      const parsed2 = parseXml(personSchema, built);
      
      assert.deepStrictEqual(parsed1, parsed2, 'Roundtrip should preserve data');
    });
  });

  describe('Multi-root schema behavior', () => {
    const multiRootSchema = {
      $filename: 'multi.xsd',
      element: [
        { name: 'person', type: 'PersonType' },
        { name: 'company', type: 'CompanyType' },
      ],
      complexType: [
        {
          name: 'PersonType',
          sequence: {
            element: [{ name: 'name', type: 'xs:string' }],
          },
        },
        {
          name: 'CompanyType',
          sequence: {
            element: [{ name: 'title', type: 'xs:string' }],
          },
        },
      ],
    } as const satisfies SchemaLike;

    it('parse() returns content for whichever root element is in XML', () => {
      const personXml = `<person><name>John</name></person>`;
      const companyXml = `<company><title>Acme</title></company>`;
      
      const parsedPerson = parseXml(multiRootSchema, personXml);
      const parsedCompany = parseXml(multiRootSchema, companyXml);
      
      // Both return content directly, no wrapper
      assert.deepStrictEqual(parsedPerson, { name: 'John' });
      assert.deepStrictEqual(parsedCompany, { title: 'Acme' });
      
      // Neither has the element name as wrapper
      assert.ok(!('person' in parsedPerson));
      assert.ok(!('company' in parsedCompany));
    });

    it('generated type wraps ONLY the primary element', () => {
      const { sourceFile } = schemaToSourceFile(multiRootSchema as unknown as Schema);
      const code = sourceFile.getFullText();
      
      // Generated root type only includes first/primary element
      // This is another inconsistency for multi-root schemas
      assert.ok(code.includes('export type MultiSchema'));
    });
  });
});
