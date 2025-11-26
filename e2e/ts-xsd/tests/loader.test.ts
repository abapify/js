/**
 * Test the XSD loader functionality
 * 
 * Run with:
 *   node --import ts-xsd/register --test tests/loader.test.ts
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';

// Direct XSD import - this is what the loader enables!
import Order from '../fixtures/order.xsd';
import Person from '../fixtures/person.xsd';

import { parse, build } from 'ts-xsd';

describe('XSD Loader', () => {
  it('should import order.xsd as schema', () => {
    assert.ok(Order);
    assert.strictEqual(Order.root, 'Order');
    assert.strictEqual(Order.ns, 'http://example.com/order');
    assert.ok(Order.elements);
  });

  it('should import person.xsd as schema', () => {
    assert.ok(Person);
    assert.strictEqual(Person.root, 'Person');
    assert.strictEqual(Person.ns, 'http://example.com/person');
    assert.ok(Person.elements);
  });

  it('should parse XML with imported schema', () => {
    const xml = `<per:Person xmlns:per="http://example.com/person" per:id="123">
      <per:FirstName>John</per:FirstName>
      <per:LastName>Doe</per:LastName>
    </per:Person>`;

    const data = parse(Person, xml);
    assert.strictEqual(data.id, '123');
    assert.strictEqual(data.FirstName, 'John');
    assert.strictEqual(data.LastName, 'Doe');
  });

  it('should build XML with imported schema', () => {
    const data = {
      id: '456',
      FirstName: 'Jane',
      LastName: 'Smith',
    };

    const xml = build(Person, data);
    // Loader returns JSON so prefix comes from schema.prefix
    assert.ok(xml.includes('Person'));
    assert.ok(xml.includes('FirstName'));
    assert.ok(xml.includes('Jane'));
    assert.ok(xml.includes('456'));
  });
});
