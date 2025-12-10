/**
 * Test for substitution group handling in interface generation
 * 
 * When a schema has elements that substitute an abstract element,
 * the generator should produce a complete type that includes all
 * substituting elements as optional properties.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateInterfacesWithDeps } from '../../src/codegen/interface-generator.ts';
import type { Schema } from '../../src/xsd/types.ts';

describe('substitution group interface generation', () => {
  // Simulates asx.xsd - defines abstract Schema element
  const asxSchema: Schema = {
    targetNamespace: 'http://www.sap.com/abapxml',
    elementFormDefault: 'qualified',
    element: [
      { name: 'Schema', abstract: true },
      { name: 'abap', type: 'asx:AbapType' },
    ],
    complexType: [
      {
        name: 'AbapValuesType',
        sequence: {
          element: [
            { ref: 'asx:Schema', minOccurs: '0', maxOccurs: 'unbounded' },
          ],
        },
      },
      {
        name: 'AbapType',
        sequence: {
          element: [
            { name: 'values', type: 'asx:AbapValuesType' },
          ],
        },
        attribute: [
          { name: 'version', type: 'xs:string' },
        ],
      },
    ],
  };

  // Simulates doma.xsd - defines elements that substitute asx:Schema
  const domaSchema: Schema = {
    targetNamespace: undefined, // No namespace, uses default
    elementFormDefault: 'qualified',
    $imports: [asxSchema],
    $xmlns: {
      asx: 'http://www.sap.com/abapxml',
      xs: 'http://www.w3.org/2001/XMLSchema',
    },
    element: [
      { name: 'DD01V', type: 'Dd01vType', substitutionGroup: 'asx:Schema' },
      { name: 'DD07V_TAB', type: 'Dd07vTabType', substitutionGroup: 'asx:Schema' },
    ],
    complexType: [
      {
        name: 'Dd01vType',
        all: {
          element: [
            { name: 'DOMNAME', type: 'xs:string' },
            { name: 'DDTEXT', type: 'xs:string', minOccurs: '0' },
          ],
        },
      },
      {
        name: 'Dd07vTabType',
        sequence: {
          element: [
            { name: 'DD07V', type: 'Dd07vType', minOccurs: '0', maxOccurs: 'unbounded' },
          ],
        },
      },
      {
        name: 'Dd07vType',
        all: {
          element: [
            { name: 'VALPOS', type: 'xs:string', minOccurs: '0' },
            { name: 'DDTEXT', type: 'xs:string', minOccurs: '0' },
          ],
        },
      },
    ],
  };

  it('should generate types for all complexTypes', () => {
    const result = generateInterfacesWithDeps(domaSchema, { generateAllTypes: true });
    
    // Should have Dd01vType
    assert.ok(result.code.includes('export interface Dd01vType'), 'Should have Dd01vType');
    assert.ok(result.code.includes('DOMNAME: string'), 'Should have DOMNAME property');
    
    // Should have Dd07vTabType
    assert.ok(result.code.includes('export interface Dd07vTabType'), 'Should have Dd07vTabType');
    assert.ok(result.code.includes('DD07V?: Dd07vType[]'), 'Should have DD07V array property');
    
    // Should have Dd07vType
    assert.ok(result.code.includes('export interface Dd07vType'), 'Should have Dd07vType');
  });

  it('should generate a values type with local substitutes only', () => {
    // Each schema should only include substitutes defined IN THAT SCHEMA.
    // asx.xsd has no substitutes (it defines the abstract Schema element)
    // doma.xsd has DD01V and DD07V_TAB as substitutes
    
    // When generating asx.xsd alone, AbapValuesType should use generic T
    // because there are no local substitutes
    const asxResult = generateInterfacesWithDeps(asxSchema, { generateAllTypes: true });
    console.log('asx.xsd generated:\n', asxResult.code);
    
    // asx should have Schema?: T[] (generic, no local substitutes)
    assert.ok(asxResult.code.includes('Schema?: T[]'), 'asx should have generic Schema?: T[]');
    
    // When generating doma.xsd, it should have its own values type with DD01V and DD07V_TAB
    const domaResult = generateInterfacesWithDeps(domaSchema, { generateAllTypes: true });
    console.log('doma.xsd generated:\n', domaResult.code);
    
    // doma should have its types
    assert.ok(domaResult.code.includes('export interface Dd01vType'), 'Should have Dd01vType');
    assert.ok(domaResult.code.includes('export interface Dd07vTabType'), 'Should have Dd07vTabType');
  });
});
