/**
 * Unit tests for XML parse functionality
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseXml } from '../../src/xml';
import type { SchemaLike } from '../../src/infer/types';

describe('parseXml', () => {
  describe('Basic parsing', () => {
    it('should parse simple element with text content', () => {
      const schema = {
        element: [{ name: 'Person', type: 'PersonType' }],
        complexType: [
          {
            name: 'PersonType',
            sequence: {
              element: [
                { name: 'name', type: 'xs:string' },
              ],
            },
          },
        ],
      } as const satisfies SchemaLike;

      const xml = `<Person><name>John</name></Person>`;
      const result = parseXml(schema, xml);

      assert.deepStrictEqual(result, { name: 'John' });
    });

    it('should parse multiple elements in sequence', () => {
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

      const xml = `<Person><firstName>John</firstName><lastName>Doe</lastName></Person>`;
      const result = parseXml(schema, xml);

      assert.deepStrictEqual(result, { firstName: 'John', lastName: 'Doe' });
    });

    it('should handle missing optional elements', () => {
      const schema = {
        element: [{ name: 'Person', type: 'PersonType' }],
        complexType: [
          {
            name: 'PersonType',
            sequence: {
              element: [
                { name: 'name', type: 'xs:string' },
                { name: 'age', type: 'xs:int', minOccurs: 0 },
              ],
            },
          },
        ],
      } as const satisfies SchemaLike;

      const xml = `<Person><name>John</name></Person>`;
      const result = parseXml(schema, xml);

      assert.deepStrictEqual(result, { name: 'John' });
    });
  });

  describe('Attributes', () => {
    it('should parse attributes', () => {
      const schema = {
        element: [{ name: 'Person', type: 'PersonType' }],
        complexType: [
          {
            name: 'PersonType',
            attribute: [
              { name: 'id', type: 'xs:string' },
            ],
          },
        ],
      } as const satisfies SchemaLike;

      const xml = `<Person id="123"/>`;
      const result = parseXml(schema, xml);

      assert.deepStrictEqual(result, { id: '123' });
    });

    it('should apply default attribute values', () => {
      const schema = {
        element: [{ name: 'Person', type: 'PersonType' }],
        complexType: [
          {
            name: 'PersonType',
            attribute: [
              { name: 'status', type: 'xs:string', default: 'active' },
            ],
          },
        ],
      } as const satisfies SchemaLike;

      const xml = `<Person/>`;
      const result = parseXml(schema, xml);

      assert.deepStrictEqual(result, { status: 'active' });
    });

    it('should parse namespaced attributes', () => {
      const schema = {
        element: [{ name: 'Person', type: 'PersonType' }],
        complexType: [
          {
            name: 'PersonType',
            attribute: [
              { name: 'id', type: 'xs:string' },
            ],
          },
        ],
      } as const satisfies SchemaLike;

      const xml = `<Person xmlns:custom="http://example.com" custom:id="456"/>`;
      const result = parseXml(schema, xml);

      assert.deepStrictEqual(result, { id: '456' });
    });
  });

  describe('Type conversion', () => {
    it('should convert integer types', () => {
      const schema = {
        element: [{ name: 'Data', type: 'DataType' }],
        complexType: [
          {
            name: 'DataType',
            sequence: {
              element: [
                { name: 'count', type: 'xs:int' },
                { name: 'total', type: 'xs:integer' },
              ],
            },
          },
        ],
      } as const satisfies SchemaLike;

      const xml = `<Data><count>42</count><total>100</total></Data>`;
      const result = parseXml(schema, xml);

      assert.strictEqual(result.count, 42);
      assert.strictEqual(result.total, 100);
    });

    it('should convert boolean types', () => {
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

      const xml = `<Data><active>true</active><enabled>1</enabled></Data>`;
      const result = parseXml(schema, xml);

      assert.strictEqual(result.active, true);
      assert.strictEqual(result.enabled, true);
    });

    it('should convert numeric types', () => {
      const schema = {
        element: [{ name: 'Data', type: 'DataType' }],
        complexType: [
          {
            name: 'DataType',
            sequence: {
              element: [
                { name: 'price', type: 'xs:decimal' },
                { name: 'rate', type: 'xs:float' },
                { name: 'value', type: 'xs:double' },
              ],
            },
          },
        ],
      } as const satisfies SchemaLike;

      const xml = `<Data><price>19.99</price><rate>3.14</rate><value>2.718</value></Data>`;
      const result = parseXml(schema, xml);

      assert.strictEqual(result.price, 19.99);
      assert.strictEqual(result.rate, 3.14);
      assert.strictEqual(result.value, 2.718);
    });

    it('should keep date types as strings', () => {
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

      const xml = `<Data><date>2024-01-15</date><timestamp>2024-01-15T10:30:00Z</timestamp></Data>`;
      const result = parseXml(schema, xml);

      assert.strictEqual(result.date, '2024-01-15');
      assert.strictEqual(result.timestamp, '2024-01-15T10:30:00Z');
    });
  });

  describe('Arrays', () => {
    it('should parse unbounded elements as arrays', () => {
      const schema = {
        element: [{ name: 'List', type: 'ListType' }],
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
      } as const satisfies SchemaLike;

      const xml = `<List><item>a</item><item>b</item><item>c</item></List>`;
      const result = parseXml(schema, xml);

      assert.deepStrictEqual(result, { item: ['a', 'b', 'c'] });
    });

    it('should parse maxOccurs > 1 as arrays', () => {
      const schema = {
        element: [{ name: 'List', type: 'ListType' }],
        complexType: [
          {
            name: 'ListType',
            sequence: {
              element: [
                { name: 'item', type: 'xs:string', maxOccurs: 5 },
              ],
            },
          },
        ],
      } as const satisfies SchemaLike;

      const xml = `<List><item>a</item><item>b</item></List>`;
      const result = parseXml(schema, xml);

      assert.deepStrictEqual(result, { item: ['a', 'b'] });
    });

    it('should parse string maxOccurs as arrays', () => {
      const schema = {
        element: [{ name: 'List', type: 'ListType' }],
        complexType: [
          {
            name: 'ListType',
            sequence: {
              element: [
                { name: 'item', type: 'xs:string', maxOccurs: '10' },
              ],
            },
          },
        ],
      } as const satisfies SchemaLike;

      const xml = `<List><item>x</item></List>`;
      const result = parseXml(schema, xml);

      assert.deepStrictEqual(result, { item: ['x'] });
    });
  });

  describe('Nested types', () => {
    it('should parse nested complex types', () => {
      const schema = {
        element: [{ name: 'Order', type: 'OrderType' }],
        complexType: [
          {
            name: 'OrderType',
            sequence: {
              element: [
                { name: 'customer', type: 'CustomerType' },
              ],
            },
          },
          {
            name: 'CustomerType',
            sequence: {
              element: [
                { name: 'name', type: 'xs:string' },
              ],
            },
          },
        ],
      } as const satisfies SchemaLike;

      const xml = `<Order><customer><name>John</name></customer></Order>`;
      const result = parseXml(schema, xml);

      assert.deepStrictEqual(result, { customer: { name: 'John' } });
    });

    it('should parse arrays of complex types', () => {
      const schema = {
        element: [{ name: 'Order', type: 'OrderType' }],
        complexType: [
          {
            name: 'OrderType',
            sequence: {
              element: [
                { name: 'item', type: 'ItemType', maxOccurs: 'unbounded' },
              ],
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

      const xml = `<Order><item><sku>A1</sku><qty>2</qty></item><item><sku>B2</sku><qty>3</qty></item></Order>`;
      const result = parseXml(schema, xml);

      assert.deepStrictEqual(result, {
        item: [
          { sku: 'A1', qty: 2 },
          { sku: 'B2', qty: 3 },
        ],
      });
    });
  });

  describe('Namespace handling', () => {
    it('should strip namespace prefix from root element', () => {
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

      const xml = `<ns:Person xmlns:ns="http://example.com"><ns:name>John</ns:name></ns:Person>`;
      const result = parseXml(schema, xml);

      assert.deepStrictEqual(result, { name: 'John' });
    });

    it('should handle type names with namespace prefix', () => {
      const schema = {
        element: [{ name: 'Person', type: 'tns:PersonType' }],
        complexType: [
          {
            name: 'PersonType',
            sequence: {
              element: [{ name: 'name', type: 'xs:string' }],
            },
          },
        ],
      } as const satisfies SchemaLike;

      const xml = `<Person><name>Jane</name></Person>`;
      const result = parseXml(schema, xml);

      assert.deepStrictEqual(result, { name: 'Jane' });
    });
  });

  describe('Choice and All groups', () => {
    it('should parse choice elements', () => {
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

      const xml = `<Data><optionA>selected</optionA></Data>`;
      const result = parseXml(schema, xml);

      assert.deepStrictEqual(result, { optionA: 'selected' });
    });

    it('should parse all elements', () => {
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

      const xml = `<Data><field2>b</field2><field1>a</field1></Data>`;
      const result = parseXml(schema, xml);

      assert.deepStrictEqual(result, { field1: 'a', field2: 'b' });
    });
  });

  describe('Type inheritance', () => {
    it('should merge inherited fields from base type', () => {
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

      const xml = `<Employee><name>John</name><department>Engineering</department></Employee>`;
      const result = parseXml(schema, xml);

      assert.deepStrictEqual(result, { name: 'John', department: 'Engineering' });
    });

    it('should merge inherited attributes', () => {
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

      const xml = `<Employee id="P1" empId="E1"/>`;
      const result = parseXml(schema, xml);

      assert.deepStrictEqual(result, { id: 'P1', empId: 'E1' });
    });
  });

  describe('Object-format complexType', () => {
    it('should handle complexType as object (not array)', () => {
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

      const xml = `<Person><name>Bob</name></Person>`;
      const result = parseXml(schema, xml);

      assert.deepStrictEqual(result, { name: 'Bob' });
    });
  });

  describe('Error handling', () => {
    it('should throw on invalid XML', () => {
      const schema = {
        element: [{ name: 'Person', type: 'PersonType' }],
        complexType: [{ name: 'PersonType' }],
      } as const satisfies SchemaLike;

      assert.throws(() => {
        parseXml(schema, '');
      }, /missing root element|Invalid XML/);
    });

    it('should throw on missing element declaration', () => {
      const schema = {
        element: [{ name: 'Other', type: 'OtherType' }],
        complexType: [{ name: 'OtherType' }],
      } as const satisfies SchemaLike;

      assert.throws(() => {
        parseXml(schema, '<Person/>');
      }, /missing element declaration/);
    });

    it('should throw on missing complexType', () => {
      const schema = {
        element: [{ name: 'Person', type: 'PersonType' }],
        complexType: [],
      } as const satisfies SchemaLike;

      assert.throws(() => {
        parseXml(schema, '<Person/>');
      }, /missing complexType/);
    });
  });

  describe('Case-insensitive element matching', () => {
    it('should match element names case-insensitively', () => {
      const schema = {
        element: [{ name: 'person', type: 'PersonType' }],
        complexType: [
          {
            name: 'PersonType',
            sequence: {
              element: [{ name: 'name', type: 'xs:string' }],
            },
          },
        ],
      } as const satisfies SchemaLike;

      const xml = `<Person><name>Test</name></Person>`;
      const result = parseXml(schema, xml);

      assert.deepStrictEqual(result, { name: 'Test' });
    });
  });
});
