/**
 * XSD Parser Unit Tests
 */

import { describe, test as it, before } from 'node:test';
import { strict as assert } from 'node:assert';
import { parseXsd, type Schema } from '../../src/xsd';
import { getW3CSchema } from '../fixtures';

let xsdContent: string;

describe('parseXsd', () => {
  before(async () => {
    xsdContent = await getW3CSchema();
  });

  it('should parse XMLSchema.xsd', () => {
    const schema = parseXsd(xsdContent);

    assert.equal(schema.targetNamespace, 'http://www.w3.org/2001/XMLSchema');
    assert.equal(schema.version, '1.0');
    assert.equal(schema.elementFormDefault, 'qualified');
  });

  it('should parse complexTypes', () => {
    const schema = parseXsd(xsdContent);

    assert.ok(Array.isArray(schema.complexType));
    assert.equal(schema.complexType?.length, 37);

    const firstType = schema.complexType?.[0];
    assert.equal(firstType?.name, 'openAttrs');
  });

  it('should parse simpleTypes with enumerations', () => {
    const schema = parseXsd(xsdContent);

    const simpleTypes = schema.simpleType as any[];
    const formChoice = simpleTypes?.find(st => st.name === 'formChoice');

    assert.ok(formChoice, 'formChoice should exist');
    assert.equal(formChoice?.restriction?.enumeration?.length, 2);
    assert.equal(formChoice?.restriction?.enumeration?.[0]?.value, 'qualified');
    assert.equal(formChoice?.restriction?.enumeration?.[1]?.value, 'unqualified');
  });

  it('should parse groups', () => {
    const schema = parseXsd(xsdContent);

    assert.ok(Array.isArray(schema.group));
    assert.equal(schema.group?.length, 13);
  });

  it('should parse elements', () => {
    const schema = parseXsd(xsdContent);

    assert.ok(Array.isArray(schema.element));
    assert.equal(schema.element?.length, 47);
  });

  it('should parse annotations with documentation', () => {
    const schema = parseXsd(xsdContent);

    assert.ok(Array.isArray(schema.annotation));
    assert.ok((schema.annotation?.length ?? 0) > 0);

    const firstAnnotation = schema.annotation?.[0];
    assert.ok(firstAnnotation?.documentation);
    assert.ok(firstAnnotation?.documentation?.[0]?._text?.includes('Part 1 version'));
  });
});

describe('Schema type validation', () => {
  it('should satisfy Schema type', () => {
    // Parse W3C XSD and verify it satisfies Schema type
    const schema: Schema = parseXsd(xsdContent);
    
    assert.equal(schema.targetNamespace, 'http://www.w3.org/2001/XMLSchema');
  });
});
