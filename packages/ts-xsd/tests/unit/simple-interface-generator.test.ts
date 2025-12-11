/**
 * Tests for the simplified interface generator that works with resolved schemas.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateSimpleInterfaces } from '../../src/codegen/interface-generator';
import type { Schema } from '../../src/xsd/types';

describe('generateSimpleInterfaces', () => {
  it('generates interface for a simple schema with complexType', () => {
    const schema: Schema = {
      targetNamespace: 'http://example.com',
      complexType: [
        {
          name: 'PersonType',
          sequence: {
            element: [
              { name: 'firstName', type: 'xs:string' },
              { name: 'lastName', type: 'xs:string' },
              { name: 'age', type: 'xs:int', minOccurs: '0' },
            ],
          },
          attribute: [
            { name: 'id', type: 'xs:string', use: 'required' },
          ],
        },
      ],
    };

    const code = generateSimpleInterfaces(schema, { generateAllTypes: true });

    // Should generate PersonType interface
    assert.ok(code.includes('export interface PersonType'), 'Should export PersonType');
    assert.ok(code.includes('firstName: string'), 'Should have firstName property');
    assert.ok(code.includes('lastName: string'), 'Should have lastName property');
    assert.ok(code.includes('age?: number'), 'Should have optional age property');
    assert.ok(code.includes('id: string'), 'Should have required id attribute');
  });

  it('generates interface for element with inline complexType', () => {
    const schema: Schema = {
      targetNamespace: 'http://example.com',
      element: [
        {
          name: 'person',
          complexType: {
            sequence: {
              element: [
                { name: 'name', type: 'xs:string' },
              ],
            },
          },
        },
      ],
    };

    const code = generateSimpleInterfaces(schema, { generateAllTypes: true });

    assert.ok(code.includes('export interface PersonType'), 'Should generate PersonType from element');
    assert.ok(code.includes('name: string'), 'Should have name property');
  });

  it('generates type alias for simpleType with enumeration', () => {
    const schema: Schema = {
      targetNamespace: 'http://example.com',
      simpleType: [
        {
          name: 'StatusType',
          restriction: {
            base: 'xs:string',
            enumeration: [
              { value: 'active' },
              { value: 'inactive' },
              { value: 'pending' },
            ],
          },
        },
      ],
    };

    const code = generateSimpleInterfaces(schema, { generateAllTypes: true });

    assert.ok(code.includes('export type StatusType'), 'Should export StatusType');
    assert.ok(code.includes("'active'"), 'Should include active literal');
    assert.ok(code.includes("'inactive'"), 'Should include inactive literal');
    assert.ok(code.includes("'pending'"), 'Should include pending literal');
  });

  it('handles array elements (maxOccurs="unbounded")', () => {
    const schema: Schema = {
      targetNamespace: 'http://example.com',
      complexType: [
        {
          name: 'ListType',
          sequence: {
            element: [
              { name: 'item', type: 'xs:string', maxOccurs: 'unbounded' },
            ],
          },
        },
      ],
    };

    const code = generateSimpleInterfaces(schema, { generateAllTypes: true });

    assert.ok(code.includes('item: string[]'), 'Should generate array type for unbounded element');
  });

  it('handles choice groups (all elements optional)', () => {
    const schema: Schema = {
      targetNamespace: 'http://example.com',
      complexType: [
        {
          name: 'ChoiceType',
          choice: {
            element: [
              { name: 'optionA', type: 'xs:string' },
              { name: 'optionB', type: 'xs:int' },
            ],
          },
        },
      ],
    };

    const code = generateSimpleInterfaces(schema, { generateAllTypes: true });

    assert.ok(code.includes('optionA?: string'), 'Choice elements should be optional');
    assert.ok(code.includes('optionB?: number'), 'Choice elements should be optional');
  });

  it('generates specific root element interface', () => {
    const schema: Schema = {
      targetNamespace: 'http://example.com',
      element: [
        {
          name: 'root',
          type: 'RootType',
        },
      ],
      complexType: [
        {
          name: 'RootType',
          sequence: {
            element: [
              { name: 'data', type: 'xs:string' },
            ],
          },
        },
        {
          name: 'OtherType',
          sequence: {
            element: [
              { name: 'other', type: 'xs:string' },
            ],
          },
        },
      ],
    };

    const code = generateSimpleInterfaces(schema, { rootElement: 'root' });

    assert.ok(code.includes('export interface RootType'), 'Should generate RootType');
    assert.ok(!code.includes('OtherType'), 'Should NOT generate OtherType (not requested)');
  });

  it('handles nested inline complexTypes', () => {
    const schema: Schema = {
      targetNamespace: 'http://example.com',
      complexType: [
        {
          name: 'ParentType',
          sequence: {
            element: [
              {
                name: 'child',
                complexType: {
                  sequence: {
                    element: [
                      { name: 'value', type: 'xs:string' },
                    ],
                  },
                },
              },
            ],
          },
        },
      ],
    };

    const code = generateSimpleInterfaces(schema, { generateAllTypes: true });

    assert.ok(code.includes('export interface ParentType'), 'Should generate ParentType');
    assert.ok(code.includes('export interface childType'), 'Should generate childType for inline complexType');
    assert.ok(code.includes('child: childType'), 'Parent should reference childType');
  });

  it('adds JSDoc comments when requested', () => {
    const schema: Schema = {
      targetNamespace: 'http://example.com',
      complexType: [
        {
          name: 'DocumentedType',
          sequence: {
            element: [
              { name: 'field', type: 'xs:string' },
            ],
          },
        },
      ],
    };

    const code = generateSimpleInterfaces(schema, { 
      generateAllTypes: true,
      addJsDoc: true,
    });

    assert.ok(code.includes('Generated from complexType: DocumentedType'), 'Should include JSDoc');
  });
});

describe('generateSimpleInterfaces vs interface-generator comparison', () => {
  it('demonstrates simplification: no $imports traversal needed', () => {
    // With autoResolve, all types are merged into one schema
    // The simplified generator just does direct lookups
    const resolvedSchema: Schema = {
      targetNamespace: 'http://example.com/merged',
      // All types from imports are already merged here
      complexType: [
        { name: 'BaseType', sequence: { element: [{ name: 'id', type: 'xs:string' }] } },
        { name: 'DerivedType', sequence: { element: [{ name: 'name', type: 'xs:string' }] } },
      ],
      // No $imports needed - everything is local
    };

    const code = generateSimpleInterfaces(resolvedSchema, { generateAllTypes: true });

    assert.ok(code.includes('export interface BaseType'), 'BaseType generated');
    assert.ok(code.includes('export interface DerivedType'), 'DerivedType generated');
  });
});
