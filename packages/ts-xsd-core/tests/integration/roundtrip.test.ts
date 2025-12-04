/**
 * XSD Roundtrip Test
 * 
 * Tests that XMLSchema can be:
 * 1. Parsed from XSD → Schema object
 * 2. Built back to XSD string
 * 3. Re-parsed to identical Schema object
 */

import { describe, test as it, before } from 'node:test';
import { strict as assert } from 'node:assert';
import { buildXsd, parseXsd, type Schema } from '../../src/xsd';
import { getW3CSchema } from '../fixtures';

let XMLSchema: Schema;

describe('XSD Roundtrip', () => {
  before(async () => {
    const xsdContent = await getW3CSchema();
    XMLSchema = parseXsd(xsdContent);
  });

  it('should build XSD from XMLSchema', () => {
    const xsd = buildXsd(XMLSchema);
    
    assert.ok(xsd.startsWith('<?xml version="1.0"'));
    assert.ok(xsd.includes('xs:schema'));
    assert.ok(xsd.includes('targetNamespace="http://www.w3.org/2001/XMLSchema"'));
  });

  it('should parse built XSD back to Schema', () => {
    const xsd = buildXsd(XMLSchema);
    const reparsed = parseXsd(xsd);
    
    assert.equal(reparsed.targetNamespace, XMLSchema.targetNamespace);
    assert.equal(reparsed.version, XMLSchema.version);
    assert.equal(reparsed.elementFormDefault, XMLSchema.elementFormDefault);
  });

  it('should preserve complexType count in roundtrip', () => {
    const xsd = buildXsd(XMLSchema);
    const reparsed = parseXsd(xsd);
    
    const originalCount = XMLSchema.complexType?.length ?? 0;
    const reparsedCount = (reparsed.complexType as any[])?.length ?? 0;
    
    assert.equal(reparsedCount, originalCount, 'complexType count mismatch');
  });

  it('should preserve simpleType count in roundtrip', () => {
    const xsd = buildXsd(XMLSchema);
    const reparsed = parseXsd(xsd);
    
    const originalCount = XMLSchema.simpleType?.length ?? 0;
    const reparsedCount = (reparsed.simpleType as any[])?.length ?? 0;
    
    assert.equal(reparsedCount, originalCount, 'simpleType count mismatch');
  });

  it('should preserve group count in roundtrip', () => {
    const xsd = buildXsd(XMLSchema);
    const reparsed = parseXsd(xsd);
    
    const originalCount = XMLSchema.group?.length ?? 0;
    const reparsedCount = (reparsed.group as any[])?.length ?? 0;
    
    assert.equal(reparsedCount, originalCount, 'group count mismatch');
  });

  it('should preserve element count in roundtrip', () => {
    const xsd = buildXsd(XMLSchema);
    const reparsed = parseXsd(xsd);
    
    const originalCount = XMLSchema.element?.length ?? 0;
    const reparsedCount = (reparsed.element as any[])?.length ?? 0;
    
    assert.equal(reparsedCount, originalCount, 'element count mismatch');
  });

  it('should preserve attributeGroup count in roundtrip', () => {
    const xsd = buildXsd(XMLSchema);
    const reparsed = parseXsd(xsd);
    
    const originalCount = XMLSchema.attributeGroup?.length ?? 0;
    const reparsedCount = (reparsed.attributeGroup as any[])?.length ?? 0;
    
    assert.equal(reparsedCount, originalCount, 'attributeGroup count mismatch');
  });

  it('should preserve annotation count in roundtrip', () => {
    const xsd = buildXsd(XMLSchema);
    const reparsed = parseXsd(xsd);
    
    const originalCount = XMLSchema.annotation?.length ?? 0;
    const reparsedCount = (reparsed.annotation as any[])?.length ?? 0;
    
    assert.equal(reparsedCount, originalCount, 'annotation count mismatch');
  });

  it('should preserve import in roundtrip', () => {
    const xsd = buildXsd(XMLSchema);
    const reparsed = parseXsd(xsd);
    
    const originalCount = XMLSchema.import?.length ?? 0;
    const reparsedCount = (reparsed.import as any[])?.length ?? 0;
    
    assert.equal(reparsedCount, originalCount, 'import count mismatch');
    
    if (originalCount > 0) {
      const original = XMLSchema.import![0];
      const parsed = (reparsed.import as any[])[0];
      assert.equal(parsed.namespace, original.namespace);
      assert.equal(parsed.schemaLocation, original.schemaLocation);
    }
  });

  it('should preserve complexType names in roundtrip', () => {
    const xsd = buildXsd(XMLSchema);
    const reparsed = parseXsd(xsd);
    
    const originalNames = XMLSchema.complexType?.map(ct => ct.name).sort() ?? [];
    const reparsedNames = (reparsed.complexType as any[])?.map((ct: any) => ct.name).sort() ?? [];
    
    assert.deepEqual(reparsedNames, originalNames);
  });

  it('should preserve simpleType names in roundtrip', () => {
    const xsd = buildXsd(XMLSchema);
    const reparsed = parseXsd(xsd);
    
    const originalNames = XMLSchema.simpleType?.map(st => st.name).sort() ?? [];
    const reparsedNames = (reparsed.simpleType as any[])?.map((st: any) => st.name).sort() ?? [];
    
    assert.deepEqual(reparsedNames, originalNames);
  });

  it('should preserve element names in roundtrip', () => {
    const xsd = buildXsd(XMLSchema);
    const reparsed = parseXsd(xsd);
    
    const originalNames = XMLSchema.element?.map(el => el.name).sort() ?? [];
    const reparsedNames = (reparsed.element as any[])?.map((el: any) => el.name).sort() ?? [];
    
    assert.deepEqual(reparsedNames, originalNames);
  });

  it('should build with custom prefix', () => {
    const xsd = buildXsd(XMLSchema, { prefix: 'xsd' });
    
    assert.ok(xsd.includes('xmlns:xsd='));
    assert.ok(xsd.includes('xsd:schema'));
    assert.ok(xsd.includes('xsd:complexType'));
  });

  it('should build without pretty printing', () => {
    const xsd = buildXsd(XMLSchema, { pretty: false });
    
    // Without pretty printing, there should be no newlines between elements
    assert.ok(!xsd.includes('>\n  <'));
  });
});
