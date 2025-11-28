import { describe, it } from 'node:test';
import assert from 'node:assert';
import { tsxml, build, parse } from '../src/index';

describe('Primitive Type in ElemField', () => {
  it('should handle simple text element with primitive type', () => {
    // Schema for: <parent><title>Hello World</title></parent>
    const schema = tsxml.schema({
      tag: 'parent',
      fields: {
        title: { kind: 'elem', name: 'title', type: 'string' },
      },
    } as const);

    const json = { title: 'Hello World' };
    const xml = build(schema, json);

    assert.match(xml, /<parent>/);
    assert.match(xml, /<title>Hello World<\/title>/);
    assert.match(xml, /<\/parent>/);

    const parsed = parse(schema, xml);
    assert.strictEqual(parsed.title, 'Hello World');
  });

  it('should handle number type in element', () => {
    const schema = tsxml.schema({
      tag: 'data',
      fields: {
        count: { kind: 'elem', name: 'count', type: 'number' },
      },
    } as const);

    const json = { count: 42 };
    const xml = build(schema, json);

    assert.match(xml, /<count>42<\/count>/);

    const parsed = parse(schema, xml);
    assert.strictEqual(parsed.count, 42);
    assert.strictEqual(typeof parsed.count, 'number');
  });

  it('should handle text kind for element text content', () => {
    // Schema for: <message id="msg1">Hello World</message>
    const schema = tsxml.schema({
      tag: 'message',
      fields: {
        id: { kind: 'attr', name: 'id', type: 'string' },
        text: { kind: 'text', type: 'string' }, // ← Text content of <message>
      },
    } as const);

    const json = { id: 'msg1', text: 'Hello World' };
    const xml = build(schema, json);

    assert.match(xml, /<message id="msg1">Hello World<\/message>/);

    const parsed = parse(schema, xml);
    assert.strictEqual(parsed.id, 'msg1');
    assert.strictEqual(parsed.text, 'Hello World');
  });

  it('should handle mixed: attribute + simple text element', () => {
    // Schema for: <item id="1"><name>Test</name></item>
    const schema = tsxml.schema({
      tag: 'item',
      fields: {
        id: { kind: 'attr', name: 'id', type: 'string' },
        name: { kind: 'elem', name: 'name', type: 'string' },
      },
    } as const);

    const json = { id: '1', name: 'Test' };
    const xml = build(schema, json);

    assert.match(xml, /<item id="1">/);
    assert.match(xml, /<name>Test<\/name>/);

    const parsed = parse(schema, xml);
    assert.strictEqual(parsed.id, '1');
    assert.strictEqual(parsed.name, 'Test');
  });

  it('should handle complex schema alongside primitive elements', () => {
    // Nested schema for complex element
    const addressSchema = tsxml.schema({
      tag: 'address',
      fields: {
        street: { kind: 'attr', name: 'street', type: 'string' },
      },
    } as const);

    // Parent schema with both primitive and complex elements
    const personSchema = tsxml.schema({
      tag: 'person',
      fields: {
        name: { kind: 'elem', name: 'name', type: 'string' },
        address: { kind: 'elem', name: 'address', schema: addressSchema },
      },
    } as const);

    const json = {
      name: 'John',
      address: { street: 'Main St' },
    };

    const xml = build(personSchema, json);
    assert.match(xml, /<name>John<\/name>/);
    assert.match(xml, /<address street="Main St"/); // Self-closing tag

    const parsed = parse(personSchema, xml);
    assert.strictEqual(parsed.name, 'John');
    assert.strictEqual(parsed.address.street, 'Main St');
  });
});
