/**
 * ts-xsd Basic Tests
 */

import { describe, test as it } from 'node:test';
import { strict as assert } from 'node:assert';
import { parse, build, type XsdSchema, type InferXsd } from '../src/index';

// Test schema - Person with name, age, and id
const PersonSchema = {
  ns: 'http://example.com/person',
  prefix: 'per',
  root: 'Person',
  elements: {
    Person: {
      sequence: [
        { name: 'FirstName', type: 'string' },
        { name: 'LastName', type: 'string' },
        { name: 'Age', type: 'number', minOccurs: 0 },
      ],
      attributes: [
        { name: 'id', type: 'string', required: true },
      ],
    },
  },
} as const satisfies XsdSchema;

type Person = InferXsd<typeof PersonSchema>;

describe('ts-xsd', () => {
  describe('parse', () => {
    it('should parse XML to typed object', () => {
      const xml = `
        <per:Person xmlns:per="http://example.com/person" per:id="123">
          <per:FirstName>John</per:FirstName>
          <per:LastName>Doe</per:LastName>
          <per:Age>30</per:Age>
        </per:Person>
      `;

      const person = parse(PersonSchema, xml);

      assert.equal(person.id, '123');
      assert.equal(person.FirstName, 'John');
      assert.equal(person.LastName, 'Doe');
      assert.equal(person.Age, 30);
    });

    it('should handle optional fields', () => {
      const xml = `
        <per:Person xmlns:per="http://example.com/person" per:id="456">
          <per:FirstName>Jane</per:FirstName>
          <per:LastName>Smith</per:LastName>
        </per:Person>
      `;

      const person = parse(PersonSchema, xml);

      assert.equal(person.id, '456');
      assert.equal(person.FirstName, 'Jane');
      assert.equal(person.LastName, 'Smith');
      assert.equal(person.Age, undefined);
    });

    it('should parse without namespace prefix', () => {
      const SimpleSchema = {
        root: 'Item',
        elements: {
          Item: {
            sequence: [
              { name: 'name', type: 'string' },
            ],
            attributes: [
              { name: 'id', type: 'string', required: true },
            ],
          },
        },
      } as const satisfies XsdSchema;

      const xml = `<Item id="1"><name>Test</name></Item>`;
      const item = parse(SimpleSchema, xml);

      assert.equal(item.id, '1');
      assert.equal(item.name, 'Test');
    });
  });

  describe('build', () => {
    it('should build XML from typed object', () => {
      const person: Person = {
        id: '789',
        FirstName: 'Alice',
        LastName: 'Wonder',
        Age: 25,
      };

      const xml = build(PersonSchema, person);

      assert.ok(xml.includes('per:Person'));
      assert.ok(xml.includes('per:id="789"'));
      assert.ok(xml.includes('<per:FirstName>Alice</per:FirstName>'));
      assert.ok(xml.includes('<per:LastName>Wonder</per:LastName>'));
      assert.ok(xml.includes('<per:Age>25</per:Age>'));
    });

    it('should handle optional fields in build', () => {
      const person: Person = {
        id: '999',
        FirstName: 'Bob',
        LastName: 'Builder',
        Age: undefined,
      };

      const xml = build(PersonSchema, person);

      assert.ok(xml.includes('per:FirstName'));
      assert.ok(xml.includes('per:LastName'));
      assert.ok(!xml.includes('per:Age'));
    });

    it('should include XML declaration by default', () => {
      const person: Person = {
        id: '1',
        FirstName: 'Test',
        LastName: 'User',
        Age: undefined,
      };

      const xml = build(PersonSchema, person);
      assert.ok(xml.startsWith('<?xml version="1.0"'));
    });

    it('should omit XML declaration when disabled', () => {
      const person: Person = {
        id: '1',
        FirstName: 'Test',
        LastName: 'User',
        Age: undefined,
      };

      const xml = build(PersonSchema, person, { xmlDecl: false });
      assert.ok(!xml.startsWith('<?xml'));
    });
  });

  describe('round-trip', () => {
    it('should round-trip data correctly', () => {
      const original: Person = {
        id: 'round-trip-test',
        FirstName: 'Round',
        LastName: 'Trip',
        Age: 42,
      };

      const xml = build(PersonSchema, original);
      const parsed = parse(PersonSchema, xml);

      assert.equal(parsed.id, original.id);
      assert.equal(parsed.FirstName, original.FirstName);
      assert.equal(parsed.LastName, original.LastName);
      assert.equal(parsed.Age, original.Age);
    });
  });

  describe('nested elements', () => {
    const OrderSchema = {
      root: 'Order',
      elements: {
        Order: {
          sequence: [
            { name: 'items', type: 'Items' },
          ],
          attributes: [
            { name: 'id', type: 'string', required: true },
          ],
        },
        Items: {
          sequence: [
            { name: 'item', type: 'Item', maxOccurs: 'unbounded' },
          ],
        },
        Item: {
          sequence: [
            { name: 'name', type: 'string' },
            { name: 'price', type: 'number' },
          ],
        },
      },
    } as const satisfies XsdSchema;

    type Order = InferXsd<typeof OrderSchema>;

    it('should parse nested elements', () => {
      const xml = `
        <Order id="order-1">
          <items>
            <item><name>Apple</name><price>1.5</price></item>
            <item><name>Banana</name><price>0.75</price></item>
          </items>
        </Order>
      `;

      const order = parse(OrderSchema, xml);

      assert.equal(order.id, 'order-1');
      assert.equal(order.items.item.length, 2);
      assert.equal(order.items.item[0].name, 'Apple');
      assert.equal(order.items.item[0].price, 1.5);
      assert.equal(order.items.item[1].name, 'Banana');
    });

    it('should build nested elements', () => {
      const order: Order = {
        id: 'order-2',
        items: {
          item: [
            { name: 'Orange', price: 2.0 },
            { name: 'Grape', price: 3.5 },
          ],
        },
      };

      const xml = build(OrderSchema, order);

      assert.ok(xml.includes('<item>'));
      assert.ok(xml.includes('<name>Orange</name>'));
      assert.ok(xml.includes('<price>2</price>'));
    });
  });

  describe('type inference', () => {
    it('should infer correct types', () => {
      // This is a compile-time test - if it compiles, types are correct
      const person: Person = {
        id: 'type-test',
        FirstName: 'Type',
        LastName: 'Test',
        Age: 100,
      };

      // These should all be correctly typed
      const id: string = person.id;
      const firstName: string = person.FirstName;
      const lastName: string = person.LastName;
      const age: number | undefined = person.Age;

      assert.ok(id);
      assert.ok(firstName);
      assert.ok(lastName);
      assert.ok(age !== undefined);
    });
  });
});
