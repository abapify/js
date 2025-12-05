/**
 * Schema Walker Tests
 */

import { describe, test as it } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  walkComplexTypes,
  walkSimpleTypes,
  walkTopLevelElements,
  walkElements,
  walkAttributes,
  findComplexType,
  findSimpleType,
  findElement,
  stripNsPrefix,
} from '../../src/walker';
import type { SchemaLike, ComplexTypeLike } from '../../src/infer/types';

describe('Schema Walker', () => {
  // ==========================================================================
  // Test Schemas
  // ==========================================================================

  const baseSchema: SchemaLike = {
    targetNamespace: 'http://example.com/base',
    complexType: [
      {
        name: 'BaseType',
        sequence: {
          element: [
            { name: 'id', type: 'xs:string' },
            { name: 'name', type: 'xs:string' },
          ],
        },
        attribute: [
          { name: 'version', type: 'xs:string', use: 'required' },
        ],
      },
    ],
    simpleType: [
      {
        name: 'StatusType',
        restriction: {
          base: 'xs:string',
          enumeration: [{ value: 'active' }, { value: 'inactive' }],
        },
      },
    ],
  };

  const derivedSchema: SchemaLike = {
    targetNamespace: 'http://example.com/derived',
    $imports: [baseSchema],
    element: [
      { name: 'person', type: 'PersonType' },
      { name: 'company', type: 'CompanyType' },
    ],
    complexType: [
      {
        name: 'PersonType',
        complexContent: {
          extension: {
            base: 'base:BaseType',
            sequence: {
              element: [
                { name: 'email', type: 'xs:string', minOccurs: 0 },
                { name: 'phones', type: 'xs:string', maxOccurs: 'unbounded' },
              ],
            },
            attribute: [
              { name: 'active', type: 'xs:boolean' },
            ],
          },
        },
      },
      {
        name: 'CompanyType',
        sequence: {
          element: [
            { name: 'companyName', type: 'xs:string' },
          ],
        },
      },
    ],
  };

  const schemaWithChoice: SchemaLike = {
    complexType: [
      {
        name: 'PaymentType',
        choice: {
          element: [
            { name: 'creditCard', type: 'xs:string' },
            { name: 'bankTransfer', type: 'xs:string' },
            { name: 'cash', type: 'xs:string' },
          ],
        },
      },
    ],
  };

  const schemaWithNestedGroups: SchemaLike = {
    complexType: [
      {
        name: 'ComplexType',
        sequence: {
          element: [
            { name: 'header', type: 'xs:string' },
          ],
          sequence: [
            {
              element: [
                { name: 'nested1', type: 'xs:string' },
                { name: 'nested2', type: 'xs:string', minOccurs: 0 },
              ],
            },
          ],
          choice: [
            {
              element: [
                { name: 'optionA', type: 'xs:string' },
                { name: 'optionB', type: 'xs:string' },
              ],
            },
          ],
        },
      },
    ],
  };

  // ==========================================================================
  // walkComplexTypes
  // ==========================================================================

  describe('walkComplexTypes', () => {
    it('should yield all complexTypes in a schema', () => {
      const types = [...walkComplexTypes(baseSchema)];
      
      assert.equal(types.length, 1);
      assert.equal(types[0].ct.name, 'BaseType');
      assert.equal(types[0].schema, baseSchema);
    });

    it('should yield complexTypes from $imports', () => {
      const types = [...walkComplexTypes(derivedSchema)];
      
      assert.equal(types.length, 3); // PersonType, CompanyType, BaseType
      
      const names = types.map(t => t.ct.name);
      assert.ok(names.includes('PersonType'));
      assert.ok(names.includes('CompanyType'));
      assert.ok(names.includes('BaseType'));
    });

    it('should preserve schema context for each type', () => {
      const types = [...walkComplexTypes(derivedSchema)];
      
      const baseType = types.find(t => t.ct.name === 'BaseType');
      assert.equal(baseType?.schema, baseSchema);
      
      const personType = types.find(t => t.ct.name === 'PersonType');
      assert.equal(personType?.schema, derivedSchema);
    });
  });

  // ==========================================================================
  // walkSimpleTypes
  // ==========================================================================

  describe('walkSimpleTypes', () => {
    it('should yield all simpleTypes in a schema', () => {
      const types = [...walkSimpleTypes(baseSchema)];
      
      assert.equal(types.length, 1);
      assert.equal(types[0].st.name, 'StatusType');
    });

    it('should yield simpleTypes from $imports', () => {
      const types = [...walkSimpleTypes(derivedSchema)];
      
      assert.equal(types.length, 1);
      assert.equal(types[0].st.name, 'StatusType');
      assert.equal(types[0].schema, baseSchema);
    });
  });

  // ==========================================================================
  // walkTopLevelElements
  // ==========================================================================

  describe('walkTopLevelElements', () => {
    it('should yield all top-level elements', () => {
      const elements = [...walkTopLevelElements(derivedSchema)];
      
      assert.equal(elements.length, 2);
      assert.equal(elements[0].element.name, 'person');
      assert.equal(elements[1].element.name, 'company');
    });
  });

  // ==========================================================================
  // findComplexType
  // ==========================================================================

  describe('findComplexType', () => {
    it('should find type in current schema', () => {
      const result = findComplexType('PersonType', derivedSchema);
      
      assert.ok(result);
      assert.equal(result?.ct.name, 'PersonType');
      assert.equal(result?.schema, derivedSchema);
    });

    it('should find type in $imports', () => {
      const result = findComplexType('BaseType', derivedSchema);
      
      assert.ok(result);
      assert.equal(result?.ct.name, 'BaseType');
      assert.equal(result?.schema, baseSchema);
    });

    it('should return undefined for non-existent type', () => {
      const result = findComplexType('NonExistent', derivedSchema);
      
      assert.equal(result, undefined);
    });
  });

  // ==========================================================================
  // findSimpleType
  // ==========================================================================

  describe('findSimpleType', () => {
    it('should find simpleType in $imports', () => {
      const result = findSimpleType('StatusType', derivedSchema);
      
      assert.ok(result);
      assert.equal(result?.st.name, 'StatusType');
    });
  });

  // ==========================================================================
  // findElement
  // ==========================================================================

  describe('findElement', () => {
    it('should find top-level element', () => {
      const result = findElement('person', derivedSchema);
      
      assert.ok(result);
      assert.equal(result?.element.name, 'person');
      assert.equal(result?.element.type, 'PersonType');
    });
  });

  // ==========================================================================
  // walkElements
  // ==========================================================================

  describe('walkElements', () => {
    it('should yield elements from sequence', () => {
      const types = derivedSchema.complexType as ComplexTypeLike[];
      const companyType = types[1];
      const elements = [...walkElements(companyType, derivedSchema)];
      
      assert.equal(elements.length, 1);
      assert.equal(elements[0].element.name, 'companyName');
      assert.equal(elements[0].optional, false);
      assert.equal(elements[0].array, false);
      assert.equal(elements[0].source, 'sequence');
    });

    it('should handle inheritance (complexContent/extension)', () => {
      const types = derivedSchema.complexType as ComplexTypeLike[];
      const personType = types[0];
      const elements = [...walkElements(personType, derivedSchema)];
      
      // Should include inherited elements from BaseType + own elements
      const names = elements.map(e => e.element.name);
      assert.ok(names.includes('id'));       // inherited
      assert.ok(names.includes('name'));     // inherited
      assert.ok(names.includes('email'));    // own
      assert.ok(names.includes('phones'));   // own
    });

    it('should mark optional elements correctly', () => {
      const types = derivedSchema.complexType as ComplexTypeLike[];
      const personType = types[0];
      const elements = [...walkElements(personType, derivedSchema)];
      
      const email = elements.find(e => e.element.name === 'email');
      assert.equal(email?.optional, true);
      
      const id = elements.find(e => e.element.name === 'id');
      assert.equal(id?.optional, false);
    });

    it('should mark array elements correctly', () => {
      const types = derivedSchema.complexType as ComplexTypeLike[];
      const personType = types[0];
      const elements = [...walkElements(personType, derivedSchema)];
      
      const phones = elements.find(e => e.element.name === 'phones');
      assert.equal(phones?.array, true);
      
      const email = elements.find(e => e.element.name === 'email');
      assert.equal(email?.array, false);
    });

    it('should mark choice elements as optional', () => {
      const types = schemaWithChoice.complexType as ComplexTypeLike[];
      const paymentType = types[0];
      const elements = [...walkElements(paymentType, schemaWithChoice)];
      
      assert.equal(elements.length, 3);
      assert.ok(elements.every(e => e.optional));
      assert.ok(elements.every(e => e.source === 'choice'));
    });

    it('should handle nested groups', () => {
      const types = schemaWithNestedGroups.complexType as ComplexTypeLike[];
      const complexType = types[0];
      const elements = [...walkElements(complexType, schemaWithNestedGroups)];
      
      const names = elements.map(e => e.element.name);
      assert.ok(names.includes('header'));
      assert.ok(names.includes('nested1'));
      assert.ok(names.includes('nested2'));
      assert.ok(names.includes('optionA'));
      assert.ok(names.includes('optionB'));
      
      // nested2 should be optional (minOccurs=0)
      const nested2 = elements.find(e => e.element.name === 'nested2');
      assert.equal(nested2?.optional, true);
      
      // Choice elements should be optional
      const optionA = elements.find(e => e.element.name === 'optionA');
      assert.equal(optionA?.optional, true);
    });
  });

  // ==========================================================================
  // walkAttributes
  // ==========================================================================

  describe('walkAttributes', () => {
    it('should yield attributes from complexType', () => {
      const types = baseSchema.complexType as ComplexTypeLike[];
      const baseType = types[0];
      const attrs = [...walkAttributes(baseType, baseSchema)];
      
      assert.equal(attrs.length, 1);
      assert.equal(attrs[0].attribute.name, 'version');
      assert.equal(attrs[0].required, true);
    });

    it('should yield inherited attributes', () => {
      const types = derivedSchema.complexType as ComplexTypeLike[];
      const personType = types[0];
      const attrs = [...walkAttributes(personType, derivedSchema)];
      
      const names = attrs.map(a => a.attribute.name);
      assert.ok(names.includes('version')); // inherited
      assert.ok(names.includes('active'));  // own
    });

    it('should mark required/optional correctly', () => {
      const types = derivedSchema.complexType as ComplexTypeLike[];
      const personType = types[0];
      const attrs = [...walkAttributes(personType, derivedSchema)];
      
      const version = attrs.find(a => a.attribute.name === 'version');
      assert.equal(version?.required, true);
      
      const active = attrs.find(a => a.attribute.name === 'active');
      assert.equal(active?.required, false);
    });
  });

  // ==========================================================================
  // stripNsPrefix
  // ==========================================================================

  describe('stripNsPrefix', () => {
    it('should strip namespace prefix', () => {
      assert.equal(stripNsPrefix('xs:string'), 'string');
      assert.equal(stripNsPrefix('tns:PersonType'), 'PersonType');
      assert.equal(stripNsPrefix('base:BaseType'), 'BaseType');
    });

    it('should return unchanged if no prefix', () => {
      assert.equal(stripNsPrefix('string'), 'string');
      assert.equal(stripNsPrefix('PersonType'), 'PersonType');
    });
  });

  // ==========================================================================
  // Lazy Evaluation (Generator Behavior)
  // ==========================================================================

  describe('lazy evaluation', () => {
    it('should stop iteration early when match found', () => {
      let iterationCount = 0;
      
      // Create a schema with many types
      const largeSchema: SchemaLike = {
        complexType: Array.from({ length: 100 }, (_, i) => ({
          name: `Type${i}`,
        })),
      };
      
      // Find Type5 - should stop after ~6 iterations
      for (const { ct } of walkComplexTypes(largeSchema)) {
        iterationCount++;
        if (ct.name === 'Type5') break;
      }
      
      assert.equal(iterationCount, 6); // 0, 1, 2, 3, 4, 5
    });
  });
});
