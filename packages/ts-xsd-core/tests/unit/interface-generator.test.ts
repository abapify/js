import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateInterfaces } from '../../src/codegen/interface-generator';

describe('Interface Generator', () => {
  // Simple schema with one complex type
  const simpleSchema = {
    $xmlns: { ns: 'http://example.com' },
    targetNamespace: 'http://example.com',
    element: [
      { name: 'person', type: 'ns:Person' },
    ],
    complexType: [
      {
        name: 'Person',
        attribute: [
          { name: 'id', type: 'xsd:string' },
          { name: 'age', type: 'xsd:int' },
        ],
      },
    ],
  } as const;

  it('should generate interface for simple complex type', () => {
    const output = generateInterfaces(simpleSchema, {
      rootElement: 'person',
    });
    
    assert.ok(output.includes('export interface Person'));
    assert.ok(output.includes('id?: string'));
    assert.ok(output.includes('age?: number'));
  });

  // Schema with inheritance
  const inheritanceSchema = {
    $xmlns: { ns: 'http://example.com' },
    targetNamespace: 'http://example.com',
    element: [
      { name: 'employee', type: 'ns:Employee' },
    ],
    complexType: [
      {
        name: 'Person',
        attribute: [
          { name: 'name', type: 'xsd:string' },
        ],
      },
      {
        name: 'Employee',
        complexContent: {
          extension: {
            base: 'Person',
            attribute: [
              { name: 'role', type: 'xsd:string' },
            ],
          },
        },
      },
    ],
  } as const;

  it('should generate interface with extends clause', () => {
    const output = generateInterfaces(inheritanceSchema, {
      rootElement: 'employee',
    });
    
    assert.ok(output.includes('export interface Person'));
    assert.ok(output.includes('export interface Employee extends Person'));
    assert.ok(output.includes('role?: string'));
  });

  // Schema with nested elements
  const nestedSchema = {
    $xmlns: { ns: 'http://example.com' },
    targetNamespace: 'http://example.com',
    element: [
      { name: 'order', type: 'ns:Order' },
    ],
    complexType: [
      {
        name: 'Item',
        attribute: [
          { name: 'sku', type: 'xsd:string' },
          { name: 'quantity', type: 'xsd:int' },
        ],
      },
      {
        name: 'Order',
        sequence: {
          element: [
            { name: 'items', type: 'ns:Item', minOccurs: '0', maxOccurs: 'unbounded' },
            { name: 'note', type: 'xsd:string', minOccurs: '0' },
          ],
        },
        attribute: [
          { name: 'orderId', type: 'xsd:string', use: 'required' },
        ],
      },
    ],
  } as const;

  it('should generate interface with array types', () => {
    const output = generateInterfaces(nestedSchema, {
      rootElement: 'order',
    });
    
    assert.ok(output.includes('export interface Item'));
    assert.ok(output.includes('export interface Order'));
    assert.ok(output.includes('items?: Item[]'));
    assert.ok(output.includes('note?: string'));
    assert.ok(output.includes('orderId: string')); // required
  });

  // Deep inheritance (4 levels) - the case that breaks TS type inference
  const deepSchema = {
    $xmlns: { l1: 'http://l1', l2: 'http://l2', l3: 'http://l3', l4: 'http://l4' },
    targetNamespace: 'http://l4',
    $imports: [
      {
        $xmlns: { l1: 'http://l1' },
        targetNamespace: 'http://l1',
        complexType: [
          { name: 'L1Base', attribute: [{ name: 'id', type: 'xsd:string' }] },
        ],
      },
      {
        $xmlns: { l1: 'http://l1', l2: 'http://l2' },
        targetNamespace: 'http://l2',
        complexType: [
          { name: 'L2Obj', complexContent: { extension: { base: 'l1:L1Base', attribute: [{ name: 'l2a', type: 'xsd:string' }] } } },
        ],
      },
      {
        $xmlns: { l1: 'http://l1', l2: 'http://l2', l3: 'http://l3' },
        targetNamespace: 'http://l3',
        complexType: [
          { name: 'Item', attribute: [{ name: 'itemType', type: 'xsd:string' }] },
          { name: 'L3Obj', complexContent: { extension: { base: 'l2:L2Obj', sequence: { element: [{ name: 'items', type: 'l3:Item', minOccurs: '0', maxOccurs: 'unbounded' }] } } } },
        ],
      },
    ],
    element: [
      { name: 'obj', type: 'l4:L4Obj' },
    ],
    complexType: [
      { name: 'L4Obj', complexContent: { extension: { base: 'l3:L3Obj', attribute: [{ name: 'l4a', type: 'xsd:string' }] } } },
    ],
  } as const;

  it('should generate interfaces for deep inheritance (4 levels)', () => {
    const output = generateInterfaces(deepSchema, {
      rootElement: 'obj',
    });
    
    // All levels should be generated
    assert.ok(output.includes('export interface L1Base'), 'Should have L1Base');
    assert.ok(output.includes('export interface L2Obj extends L1Base'), 'Should have L2Obj extends L1Base');
    assert.ok(output.includes('export interface L3Obj extends L2Obj'), 'Should have L3Obj extends L2Obj');
    assert.ok(output.includes('export interface L4Obj extends L3Obj'), 'Should have L4Obj extends L3Obj');
    
    // Properties should be present
    assert.ok(output.includes('id?: string'), 'L1Base should have id');
    assert.ok(output.includes('l2a?: string'), 'L2Obj should have l2a');
    assert.ok(output.includes('items?: Item[]'), 'L3Obj should have items array');
    assert.ok(output.includes('l4a?: string'), 'L4Obj should have l4a');
    
    // Item type should be generated
    assert.ok(output.includes('export interface Item'), 'Should have Item');
    assert.ok(output.includes('itemType?: string'), 'Item should have itemType');
  });

  it('should generate all types when generateAllTypes is true', () => {
    const output = generateInterfaces(simpleSchema, {
      generateAllTypes: true,
    });
    
    assert.ok(output.includes('export interface Person'));
  });

  // Schema with simpleType enum
  const enumSchema = {
    $xmlns: { ns: 'http://example.com' },
    targetNamespace: 'http://example.com',
    element: [
      { name: 'status', type: 'ns:StatusType' },
    ],
    simpleType: [
      {
        name: 'StatusType',
        restriction: {
          base: 'xsd:string',
          enumeration: [
            { value: 'active' },
            { value: 'inactive' },
            { value: 'pending' },
          ],
        },
      },
    ],
    complexType: [
      {
        name: 'Item',
        attribute: [
          { name: 'status', type: 'ns:StatusType' },
        ],
      },
    ],
  } as const;

  it('should generate type alias for simpleType enum', () => {
    const output = generateInterfaces(enumSchema, {
      generateAllTypes: true,
    });
    
    assert.ok(output.includes("export type StatusType = 'active' | 'inactive' | 'pending'"), 'Should have enum type');
    assert.ok(output.includes('export interface Item'), 'Should have Item interface');
    assert.ok(output.includes('status?: StatusType'), 'Should use StatusType');
  });

  // Schema with simpleContent (text with attributes)
  const simpleContentSchema = {
    $xmlns: { ns: 'http://example.com' },
    targetNamespace: 'http://example.com',
    element: [
      { name: 'price', type: 'ns:PriceType' },
    ],
    complexType: [
      {
        name: 'PriceType',
        simpleContent: {
          extension: {
            base: 'xsd:decimal',
            attribute: [
              { name: 'currency', type: 'xsd:string', use: 'required' },
            ],
          },
        },
      },
    ],
  } as const;

  it('should generate interface for simpleContent with $value', () => {
    const output = generateInterfaces(simpleContentSchema, {
      rootElement: 'price',
    });
    
    assert.ok(output.includes('export interface PriceType'), 'Should have PriceType');
    assert.ok(output.includes('$value: number'), 'Should have $value for text content');
    assert.ok(output.includes('currency: string'), 'Should have currency attribute');
  });

  // Schema with include (W3C standard)
  const baseIncludeSchema = {
    $xmlns: { base: 'http://base' },
    targetNamespace: 'http://base',
    complexType: [
      { name: 'BaseType', attribute: [{ name: 'id', type: 'xsd:string' }] },
    ],
  } as const;

  const mainIncludeSchema = {
    $xmlns: { base: 'http://base', main: 'http://main' },
    targetNamespace: 'http://main',
    include: [baseIncludeSchema],  // W3C include
    element: [
      { name: 'item', type: 'main:ItemType' },
    ],
    complexType: [
      {
        name: 'ItemType',
        complexContent: {
          extension: {
            base: 'base:BaseType',
            attribute: [{ name: 'name', type: 'xsd:string' }],
          },
        },
      },
    ],
  } as const;

  it('should resolve types from include schemas', () => {
    const output = generateInterfaces(mainIncludeSchema, {
      rootElement: 'item',
    });
    
    assert.ok(output.includes('export interface BaseType'), 'Should have BaseType from include');
    assert.ok(output.includes('export interface ItemType extends BaseType'), 'Should extend BaseType');
    assert.ok(output.includes('id?: string'), 'BaseType should have id');
    assert.ok(output.includes('name?: string'), 'ItemType should have name');
  });

  // Schema with group reference
  const groupSchema = {
    $xmlns: { ns: 'http://example.com' },
    targetNamespace: 'http://example.com',
    group: [
      {
        name: 'CommonFields',
        sequence: {
          element: [
            { name: 'createdAt', type: 'xsd:dateTime' },
            { name: 'updatedAt', type: 'xsd:dateTime' },
          ],
        },
      },
    ],
    element: [{ name: 'item', type: 'ns:ItemType' }],
    complexType: [
      {
        name: 'ItemType',
        sequence: {
          element: [{ name: 'name', type: 'xsd:string' }],
        },
        group: { ref: 'ns:CommonFields' },
      },
    ],
  } as const;

  it('should resolve group references', () => {
    const output = generateInterfaces(groupSchema, { rootElement: 'item' });
    
    assert.ok(output.includes('export interface ItemType'), 'Should have ItemType');
    assert.ok(output.includes('name: string'), 'Should have name');
    assert.ok(output.includes('createdAt: string'), 'Should have createdAt from group');
    assert.ok(output.includes('updatedAt: string'), 'Should have updatedAt from group');
  });

  // Schema with any element
  const anySchema = {
    $xmlns: { ns: 'http://example.com' },
    targetNamespace: 'http://example.com',
    element: [{ name: 'container', type: 'ns:ContainerType' }],
    complexType: [
      {
        name: 'ContainerType',
        sequence: {
          element: [{ name: 'header', type: 'xsd:string' }],
          any: [{ namespace: '##any', processContents: 'lax' }],
        },
      },
    ],
  } as const;

  it('should handle any wildcard element', () => {
    const output = generateInterfaces(anySchema, { rootElement: 'container' });
    
    assert.ok(output.includes('export interface ContainerType'), 'Should have ContainerType');
    assert.ok(output.includes('header: string'), 'Should have header');
    assert.ok(output.includes('[key: string]: unknown'), 'Should have index signature for any');
  });
});
