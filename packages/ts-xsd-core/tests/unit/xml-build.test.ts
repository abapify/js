/**
 * Unit tests for XML build functionality
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { buildXml } from '../../src/xml';
import type { SchemaLike } from '../../src/infer/types';

describe('buildXml', () => {
  describe('Basic building', () => {
    it('should build simple element with text content', () => {
      const schema = {
        targetNamespace: 'http://example.com',
        element: [{ name: 'Person', type: 'PersonType' }],
        complexType: [
          {
            name: 'PersonType',
            sequence: {
              element: [{ name: 'name', type: 'xs:string' }],
            },
          },
        ],
      } as const satisfies SchemaLike;

      const xml = buildXml(schema, { name: 'John' }, { xmlDecl: false });

      assert.ok(xml.includes('<Person'));
      assert.ok(xml.includes('<name>John</name>'));
      assert.ok(xml.includes('</Person>'));
    });

    it('should build multiple elements in sequence', () => {
      const schema = {
        element: [{ name: 'Person', type: 'PersonType' }],
        complexType: [
          {
            name: 'PersonType',
            sequence: {
              element: [
                { name: 'firstName', type: 'xs:string' },
                { name: 'lastName', type: 'xs:string' },
              ],
            },
          },
        ],
      } as const satisfies SchemaLike;

      const xml = buildXml(schema, { firstName: 'John', lastName: 'Doe' }, { xmlDecl: false });

      assert.ok(xml.includes('<firstName>John</firstName>'));
      assert.ok(xml.includes('<lastName>Doe</lastName>'));
    });

    it('should skip undefined/null values', () => {
      const schema = {
        element: [{ name: 'Person', type: 'PersonType' }],
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

      const xml = buildXml(schema, { name: 'John', age: undefined }, { xmlDecl: false });

      assert.ok(xml.includes('<name>John</name>'));
      assert.ok(!xml.includes('<age>'));
    });
  });

  describe('XML Declaration', () => {
    it('should include XML declaration by default', () => {
      const schema = {
        element: [{ name: 'Data', type: 'DataType' }],
        complexType: [{ name: 'DataType' }],
      } as const satisfies SchemaLike;

      const xml = buildXml(schema, {});

      assert.ok(xml.startsWith('<?xml version="1.0" encoding="utf-8"?>'));
    });

    it('should omit XML declaration when xmlDecl is false', () => {
      const schema = {
        element: [{ name: 'Data', type: 'DataType' }],
        complexType: [{ name: 'DataType' }],
      } as const satisfies SchemaLike;

      const xml = buildXml(schema, {}, { xmlDecl: false });

      assert.ok(!xml.includes('<?xml'));
    });

    it('should use custom encoding', () => {
      const schema = {
        element: [{ name: 'Data', type: 'DataType' }],
        complexType: [{ name: 'DataType' }],
      } as const satisfies SchemaLike;

      const xml = buildXml(schema, {}, { encoding: 'ISO-8859-1' });

      assert.ok(xml.includes('encoding="ISO-8859-1"'));
    });
  });

  describe('Namespace handling', () => {
    it('should add namespace declaration', () => {
      const schema = {
        targetNamespace: 'http://example.com/ns',
        element: [{ name: 'Data', type: 'DataType' }],
        complexType: [{ name: 'DataType' }],
      } as const satisfies SchemaLike;

      const xml = buildXml(schema, {}, { xmlDecl: false });

      assert.ok(xml.includes('xmlns="http://example.com/ns"'));
    });

    it('should use prefix from $xmlns declarations', () => {
      const schema = {
        targetNamespace: 'http://example.com/ns',
        $xmlns: {
          ex: 'http://example.com/ns',
        },
        element: [{ name: 'Data', type: 'DataType' }],
        complexType: [{ name: 'DataType' }],
      } as const satisfies SchemaLike;

      const xml = buildXml(schema, {}, { xmlDecl: false });

      assert.ok(xml.includes('xmlns:ex="http://example.com/ns"'));
      assert.ok(xml.includes('<ex:Data'));
    });

    it('should use custom prefix from options', () => {
      const schema = {
        targetNamespace: 'http://example.com/ns',
        element: [{ name: 'Data', type: 'DataType' }],
        complexType: [{ name: 'DataType' }],
      } as const satisfies SchemaLike;

      const xml = buildXml(schema, {}, { xmlDecl: false, prefix: 'custom' });

      assert.ok(xml.includes('xmlns:custom="http://example.com/ns"'));
      assert.ok(xml.includes('<custom:Data'));
    });

    it('should include additional $xmlns declarations', () => {
      const schema = {
        targetNamespace: 'http://example.com/ns',
        $xmlns: {
          tns: 'http://example.com/ns',
          other: 'http://other.com',
        },
        element: [{ name: 'Data', type: 'DataType' }],
        complexType: [{ name: 'DataType' }],
      } as const satisfies SchemaLike;

      const xml = buildXml(schema, {}, { xmlDecl: false });

      assert.ok(xml.includes('xmlns:other="http://other.com"'));
    });
  });

  describe('Attributes', () => {
    it('should build attributes', () => {
      const schema = {
        element: [{ name: 'Person', type: 'PersonType' }],
        complexType: [
          {
            name: 'PersonType',
            attribute: [{ name: 'id', type: 'xs:string' }],
          },
        ],
      } as const satisfies SchemaLike;

      const xml = buildXml(schema, { id: '123' }, { xmlDecl: false });

      assert.ok(xml.includes('id="123"'));
    });

    it('should skip undefined attributes', () => {
      const schema = {
        element: [{ name: 'Person', type: 'PersonType' }],
        complexType: [
          {
            name: 'PersonType',
            attribute: [
              { name: 'id', type: 'xs:string' },
              { name: 'status', type: 'xs:string' },
            ],
          },
        ],
      } as const satisfies SchemaLike;

      const xml = buildXml(schema, { id: '123' }, { xmlDecl: false });

      assert.ok(xml.includes('id="123"'));
      assert.ok(!xml.includes('status='));
    });
  });

  describe('Type formatting', () => {
    it('should format boolean values', () => {
      const schema = {
        element: [{ name: 'Data', type: 'DataType' }],
        complexType: [
          {
            name: 'DataType',
            sequence: {
              element: [
                { name: 'active', type: 'xs:boolean' },
                { name: 'enabled', type: 'xs:boolean' },
              ],
            },
          },
        ],
      } as const satisfies SchemaLike;

      const xml = buildXml(schema, { active: true, enabled: false }, { xmlDecl: false });

      assert.ok(xml.includes('<active>true</active>'));
      assert.ok(xml.includes('<enabled>false</enabled>'));
    });

    it('should format Date values', () => {
      const schema = {
        element: [{ name: 'Data', type: 'DataType' }],
        complexType: [
          {
            name: 'DataType',
            sequence: {
              element: [
                { name: 'date', type: 'xs:date' },
                { name: 'timestamp', type: 'xs:dateTime' },
              ],
            },
          },
        ],
      } as const satisfies SchemaLike;

      const date = new Date('2024-01-15T10:30:00Z');
      const xml = buildXml(schema, { date, timestamp: date }, { xmlDecl: false });

      assert.ok(xml.includes('<date>2024-01-15</date>'));
      assert.ok(xml.includes('<timestamp>2024-01-15T10:30:00.000Z</timestamp>'));
    });

    it('should format numbers', () => {
      const schema = {
        element: [{ name: 'Data', type: 'DataType' }],
        complexType: [
          {
            name: 'DataType',
            sequence: {
              element: [{ name: 'count', type: 'xs:int' }],
            },
          },
        ],
      } as const satisfies SchemaLike;

      const xml = buildXml(schema, { count: 42 }, { xmlDecl: false });

      assert.ok(xml.includes('<count>42</count>'));
    });
  });

  describe('Arrays', () => {
    it('should build array elements', () => {
      const schema = {
        element: [{ name: 'List', type: 'ListType' }],
        complexType: [
          {
            name: 'ListType',
            sequence: {
              element: [{ name: 'item', type: 'xs:string', maxOccurs: 'unbounded' }],
            },
          },
        ],
      } as const satisfies SchemaLike;

      const xml = buildXml(schema, { item: ['a', 'b', 'c'] }, { xmlDecl: false });

      assert.ok(xml.includes('<item>a</item>'));
      assert.ok(xml.includes('<item>b</item>'));
      assert.ok(xml.includes('<item>c</item>'));
    });

    it('should build arrays of complex types', () => {
      const schema = {
        element: [{ name: 'Order', type: 'OrderType' }],
        complexType: [
          {
            name: 'OrderType',
            sequence: {
              element: [{ name: 'item', type: 'ItemType', maxOccurs: 'unbounded' }],
            },
          },
          {
            name: 'ItemType',
            sequence: {
              element: [
                { name: 'sku', type: 'xs:string' },
                { name: 'qty', type: 'xs:int' },
              ],
            },
          },
        ],
      } as const satisfies SchemaLike;

      const xml = buildXml(schema, {
        item: [
          { sku: 'A1', qty: 2 },
          { sku: 'B2', qty: 3 },
        ],
      }, { xmlDecl: false });

      assert.ok(xml.includes('<sku>A1</sku>'));
      assert.ok(xml.includes('<qty>2</qty>'));
      assert.ok(xml.includes('<sku>B2</sku>'));
      assert.ok(xml.includes('<qty>3</qty>'));
    });
  });

  describe('Nested types', () => {
    it('should build nested complex types', () => {
      const schema = {
        element: [{ name: 'Order', type: 'OrderType' }],
        complexType: [
          {
            name: 'OrderType',
            sequence: {
              element: [{ name: 'customer', type: 'CustomerType' }],
            },
          },
          {
            name: 'CustomerType',
            sequence: {
              element: [{ name: 'name', type: 'xs:string' }],
            },
          },
        ],
      } as const satisfies SchemaLike;

      const xml = buildXml(schema, { customer: { name: 'John' } }, { xmlDecl: false });

      assert.ok(xml.includes('<customer>'));
      assert.ok(xml.includes('<name>John</name>'));
      assert.ok(xml.includes('</customer>'));
    });
  });

  describe('Choice and All groups', () => {
    it('should build choice elements', () => {
      const schema = {
        element: [{ name: 'Data', type: 'DataType' }],
        complexType: [
          {
            name: 'DataType',
            choice: {
              element: [
                { name: 'optionA', type: 'xs:string' },
                { name: 'optionB', type: 'xs:string' },
              ],
            },
          },
        ],
      } as const satisfies SchemaLike;

      const xml = buildXml(schema, { optionA: 'selected' }, { xmlDecl: false });

      assert.ok(xml.includes('<optionA>selected</optionA>'));
      assert.ok(!xml.includes('<optionB>'));
    });

    it('should build all elements', () => {
      const schema = {
        element: [{ name: 'Data', type: 'DataType' }],
        complexType: [
          {
            name: 'DataType',
            all: {
              element: [
                { name: 'field1', type: 'xs:string' },
                { name: 'field2', type: 'xs:string' },
              ],
            },
          },
        ],
      } as const satisfies SchemaLike;

      const xml = buildXml(schema, { field1: 'a', field2: 'b' }, { xmlDecl: false });

      assert.ok(xml.includes('<field1>a</field1>'));
      assert.ok(xml.includes('<field2>b</field2>'));
    });
  });

  describe('Type inheritance', () => {
    it('should build inherited fields', () => {
      const schema = {
        element: [{ name: 'Employee', type: 'EmployeeType' }],
        complexType: [
          {
            name: 'PersonType',
            sequence: {
              element: [{ name: 'name', type: 'xs:string' }],
            },
          },
          {
            name: 'EmployeeType',
            complexContent: {
              extension: {
                base: 'PersonType',
                sequence: {
                  element: [{ name: 'department', type: 'xs:string' }],
                },
              },
            },
          },
        ],
      } as const satisfies SchemaLike;

      const xml = buildXml(schema, { name: 'John', department: 'Engineering' }, { xmlDecl: false });

      assert.ok(xml.includes('<name>John</name>'));
      assert.ok(xml.includes('<department>Engineering</department>'));
    });

    it('should build inherited attributes', () => {
      const schema = {
        element: [{ name: 'Employee', type: 'EmployeeType' }],
        complexType: [
          {
            name: 'PersonType',
            attribute: [{ name: 'id', type: 'xs:string' }],
          },
          {
            name: 'EmployeeType',
            complexContent: {
              extension: {
                base: 'PersonType',
                attribute: [{ name: 'empId', type: 'xs:string' }],
              },
            },
          },
        ],
      } as const satisfies SchemaLike;

      const xml = buildXml(schema, { id: 'P1', empId: 'E1' }, { xmlDecl: false });

      assert.ok(xml.includes('id="P1"'));
      assert.ok(xml.includes('empId="E1"'));
    });
  });

  describe('Pretty printing', () => {
    it('should format XML with indentation when pretty is true', () => {
      const schema = {
        element: [{ name: 'Person', type: 'PersonType' }],
        complexType: [
          {
            name: 'PersonType',
            sequence: {
              element: [{ name: 'name', type: 'xs:string' }],
            },
          },
        ],
      } as const satisfies SchemaLike;

      const xml = buildXml(schema, { name: 'John' }, { xmlDecl: false, pretty: true });

      assert.ok(xml.includes('\n'));
      assert.ok(xml.includes('  ')); // indentation
    });
  });

  describe('Element matching', () => {
    it('should auto-detect element type from data structure', () => {
      const schema = {
        element: [
          { name: 'Person', type: 'PersonType' },
          { name: 'Company', type: 'CompanyType' },
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
              element: [{ name: 'companyName', type: 'xs:string' }],
            },
          },
        ],
      } as const satisfies SchemaLike;

      const xml = buildXml(schema, { companyName: 'Acme' }, { xmlDecl: false });

      assert.ok(xml.includes('<Company'));
      assert.ok(xml.includes('<companyName>Acme</companyName>'));
    });
  });

  describe('Object-format complexType', () => {
    it('should handle complexType as object', () => {
      const schema = {
        element: [{ name: 'Person', type: 'PersonType' }],
        complexType: {
          PersonType: {
            sequence: {
              element: [{ name: 'name', type: 'xs:string' }],
            },
          },
        },
      } as const satisfies SchemaLike;

      const xml = buildXml(schema, { name: 'Bob' }, { xmlDecl: false });

      assert.ok(xml.includes('<name>Bob</name>'));
    });
  });

  describe('Error handling', () => {
    it('should throw when no element declarations', () => {
      const schema = {
        element: [],
        complexType: [],
      } as const satisfies SchemaLike;

      assert.throws(() => {
        buildXml(schema, {});
      }, /no element declarations/);
    });

    it('should throw when complexType not found', () => {
      const schema = {
        element: [{ name: 'Person', type: 'PersonType' }],
        complexType: [],
      } as const satisfies SchemaLike;

      assert.throws(() => {
        buildXml(schema, {});
      }, /missing complexType/);
    });
  });
});
