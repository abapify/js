/**
 * Generator Tests
 */

import { describe, test as it } from 'node:test';
import { strict as assert } from 'node:assert';
import { parse } from 'ts-xml';
import { XsdSchemaSchema, type XsdSchema } from 'ts-xml-xsd';
import { generateTsXmlSchemas } from '../src/generator';

describe('generateTsXmlSchemas', () => {
  it('should generate schema for simple complexType', () => {
    const xsd = `
      <xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                  targetNamespace="http://example.com/test">
        <xsd:complexType name="Person">
          <xsd:sequence>
            <xsd:element name="name" type="xsd:string"/>
            <xsd:element name="age" type="xsd:int"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:schema>
    `;

    const schema = parse(XsdSchemaSchema, xsd);
    const output = generateTsXmlSchemas(schema);

    // Check imports
    assert.ok(output.includes("import { tsxml, type InferSchema } from 'ts-xml'"));

    // Check namespace
    assert.ok(output.includes("export const NS = 'http://example.com/test'"));

    // Check schema definition
    assert.ok(output.includes('export const PersonSchema = tsxml.schema({'));
    assert.ok(output.includes("tag: 'test:person'"));
    assert.ok(output.includes("kind: 'elem'"));
    assert.ok(output.includes("name: 'test:name'"));
    assert.ok(output.includes("type: 'string'"));
    assert.ok(output.includes("name: 'test:age'"));
    assert.ok(output.includes("type: 'number'"));

    // Check type export
    assert.ok(output.includes('export type Person = InferSchema<typeof PersonSchema>'));
  });

  it('should generate schema with attributes', () => {
    const xsd = `
      <xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                  targetNamespace="http://example.com/test">
        <xsd:complexType name="Item">
          <xsd:attribute name="id" type="xsd:string" use="required"/>
          <xsd:attribute name="status" type="xsd:string"/>
        </xsd:complexType>
      </xsd:schema>
    `;

    const schema = parse(XsdSchemaSchema, xsd);
    const output = generateTsXmlSchemas(schema);

    assert.ok(output.includes("kind: 'attr'"));
    assert.ok(output.includes("name: 'test:id'"));
    // Required attribute should not have optional: true
    assert.ok(output.includes("id: { kind: 'attr', name: 'test:id', type: 'string' }"));
    // Optional attribute should have optional: true
    assert.ok(output.includes("optional: true"));
  });

  it('should generate enum types from simpleType restrictions', () => {
    const xsd = `
      <xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                  targetNamespace="http://example.com/test">
        <xsd:simpleType name="StatusType">
          <xsd:restriction base="xsd:string">
            <xsd:enumeration value="active"/>
            <xsd:enumeration value="inactive"/>
            <xsd:enumeration value="pending"/>
          </xsd:restriction>
        </xsd:simpleType>
      </xsd:schema>
    `;

    const schema = parse(XsdSchemaSchema, xsd);
    const output = generateTsXmlSchemas(schema);

    // Check union type
    assert.ok(output.includes("export type StatusType = 'active' | 'inactive' | 'pending'"));
    // Check values array
    assert.ok(output.includes("export const StatusTypeValues = ['active', 'inactive', 'pending'] as const"));
  });

  it('should handle optional elements (minOccurs=0)', () => {
    const xsd = `
      <xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                  targetNamespace="http://example.com/test">
        <xsd:complexType name="Container">
          <xsd:sequence>
            <xsd:element name="required" type="xsd:string"/>
            <xsd:element name="optional" type="xsd:string" minOccurs="0"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:schema>
    `;

    const schema = parse(XsdSchemaSchema, xsd);
    const output = generateTsXmlSchemas(schema);

    // Required element should not have optional
    assert.ok(output.includes("required: { kind: 'elem', name: 'test:required', type: 'string' }"));
    // Optional element should have optional: true
    assert.ok(output.includes("optional: { kind: 'elem', name: 'test:optional', type: 'string', optional: true }"));
  });

  it('should handle array elements (maxOccurs=unbounded)', () => {
    const xsd = `
      <xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                  targetNamespace="http://example.com/test">
        <xsd:complexType name="List">
          <xsd:sequence>
            <xsd:element name="item" type="xsd:string" minOccurs="0" maxOccurs="unbounded"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:schema>
    `;

    const schema = parse(XsdSchemaSchema, xsd);
    const output = generateTsXmlSchemas(schema);

    // Array element should use 'elems' kind
    assert.ok(output.includes("kind: 'elems'"));
    assert.ok(output.includes("name: 'test:item'"));
  });

  it('should use custom prefix when provided', () => {
    const xsd = `
      <xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                  targetNamespace="http://example.com/test">
        <xsd:complexType name="MyType">
          <xsd:sequence>
            <xsd:element name="field" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:schema>
    `;

    const schema = parse(XsdSchemaSchema, xsd);
    const output = generateTsXmlSchemas(schema, { prefix: 'custom' });

    assert.ok(output.includes("export const PREFIX = 'custom'"));
    assert.ok(output.includes("tag: 'custom:my-type'"));
    assert.ok(output.includes("name: 'custom:field'"));
  });

  it('should handle XSD type mappings', () => {
    const xsd = `
      <xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                  targetNamespace="http://example.com/test">
        <xsd:complexType name="AllTypes">
          <xsd:sequence>
            <xsd:element name="str" type="xsd:string"/>
            <xsd:element name="num" type="xsd:int"/>
            <xsd:element name="dec" type="xsd:decimal"/>
            <xsd:element name="bool" type="xsd:boolean"/>
            <xsd:element name="dt" type="xsd:dateTime"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:schema>
    `;

    const schema = parse(XsdSchemaSchema, xsd);
    const output = generateTsXmlSchemas(schema);

    // Check type mappings
    assert.ok(output.includes("str: { kind: 'elem', name: 'test:str', type: 'string' }"));
    assert.ok(output.includes("num: { kind: 'elem', name: 'test:num', type: 'number' }"));
    assert.ok(output.includes("dec: { kind: 'elem', name: 'test:dec', type: 'number' }"));
    assert.ok(output.includes("bool: { kind: 'elem', name: 'test:bool', type: 'boolean' }"));
    assert.ok(output.includes("dt: { kind: 'elem', name: 'test:dt', type: 'date' }"));
  });

  it('should skip type exports when exportTypes is false', () => {
    const xsd = `
      <xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                  targetNamespace="http://example.com/test">
        <xsd:complexType name="MyType">
          <xsd:sequence>
            <xsd:element name="field" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:schema>
    `;

    const schema = parse(XsdSchemaSchema, xsd);
    const output = generateTsXmlSchemas(schema, { exportTypes: false });

    assert.ok(!output.includes('export type MyType'));
  });

  it('should skip comments when includeComments is false', () => {
    const xsd = `
      <xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                  targetNamespace="http://example.com/test">
        <xsd:complexType name="MyType">
          <xsd:sequence>
            <xsd:element name="field" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:schema>
    `;

    const schema = parse(XsdSchemaSchema, xsd);
    const output = generateTsXmlSchemas(schema, { includeComments: false });

    // Should not have JSDoc comments for individual schemas
    assert.ok(!output.includes('/** MyType schema */'));
  });
});
