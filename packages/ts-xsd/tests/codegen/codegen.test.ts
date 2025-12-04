/**
 * ts-xsd Codegen Tests
 */

import { describe, test as it } from 'node:test';
import { strict as assert } from 'node:assert';
import { generateFromXsd } from '../../src/codegen';

describe('generateFromXsd', () => {
  it('should generate schema from simple XSD', () => {
    const xsd = `
      <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
                 targetNamespace="http://example.com/person"
                 elementFormDefault="qualified">
        <xs:element name="Person">
          <xs:complexType>
            <xs:sequence>
              <xs:element name="FirstName" type="xs:string"/>
              <xs:element name="LastName" type="xs:string"/>
            </xs:sequence>
            <xs:attribute name="id" type="xs:string" use="required"/>
          </xs:complexType>
        </xs:element>
      </xs:schema>
    `;

    const result = generateFromXsd(xsd);

    assert.equal(result.namespace, 'http://example.com/person');
    assert.ok(result.code.includes("element:"));
    assert.ok(result.code.includes("name: 'Person'"));
    assert.ok(result.code.includes("ns: 'http://example.com/person'"));
    assert.ok(result.code.includes("name: 'FirstName'"));
    assert.ok(result.code.includes("name: 'LastName'"));
    assert.ok(result.code.includes("name: 'id'"));
    assert.ok(result.code.includes("required: true"));
  });

  it('should handle optional elements', () => {
    const xsd = `
      <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
        <xs:element name="Item">
          <xs:complexType>
            <xs:sequence>
              <xs:element name="required" type="xs:string"/>
              <xs:element name="optional" type="xs:string" minOccurs="0"/>
            </xs:sequence>
          </xs:complexType>
        </xs:element>
      </xs:schema>
    `;

    const result = generateFromXsd(xsd);

    assert.ok(result.code.includes("name: 'required'"));
    assert.ok(result.code.includes("type: 'string'"));
    assert.ok(result.code.includes("name: 'optional'"));
    assert.ok(result.code.includes("minOccurs: 0"));
  });

  it('should handle array elements', () => {
    const xsd = `
      <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
        <xs:element name="List">
          <xs:complexType>
            <xs:sequence>
              <xs:element name="item" type="xs:string" maxOccurs="unbounded"/>
            </xs:sequence>
          </xs:complexType>
        </xs:element>
      </xs:schema>
    `;

    const result = generateFromXsd(xsd);

    assert.ok(result.code.includes("maxOccurs: 'unbounded'"));
  });

  it('should handle type mappings', () => {
    const xsd = `
      <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
        <xs:element name="Types">
          <xs:complexType>
            <xs:sequence>
              <xs:element name="str" type="xs:string"/>
              <xs:element name="num" type="xs:int"/>
              <xs:element name="bool" type="xs:boolean"/>
              <xs:element name="dt" type="xs:dateTime"/>
            </xs:sequence>
          </xs:complexType>
        </xs:element>
      </xs:schema>
    `;

    const result = generateFromXsd(xsd);

    assert.ok(result.code.includes("type: 'string'"));
    assert.ok(result.code.includes("type: 'number'"));
    assert.ok(result.code.includes("type: 'boolean'"));
    assert.ok(result.code.includes("type: 'date'"));
  });

  it('should use custom prefix', () => {
    const xsd = `
      <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
                 targetNamespace="http://example.com/test">
        <xs:element name="Test">
          <xs:complexType>
            <xs:sequence>
              <xs:element name="field" type="xs:string"/>
            </xs:sequence>
          </xs:complexType>
        </xs:element>
      </xs:schema>
    `;

    const result = generateFromXsd(xsd, { prefix: 'custom' });

    assert.ok(result.code.includes("prefix: 'custom'"));
  });

  it('should generate type export', () => {
    const xsd = `
      <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
        <xs:element name="MyElement">
          <xs:complexType>
            <xs:sequence>
              <xs:element name="field" type="xs:string"/>
            </xs:sequence>
          </xs:complexType>
        </xs:element>
      </xs:schema>
    `;

    const result = generateFromXsd(xsd);

    // Uses export default with new format
    assert.ok(result.code.includes('export default {'));
    assert.ok(result.code.includes('as const satisfies XsdSchema'));
    assert.ok(result.code.includes('complexType:'));
  });

  it('should handle named complex types', () => {
    const xsd = `
      <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
        <xs:complexType name="AddressType">
          <xs:sequence>
            <xs:element name="street" type="xs:string"/>
            <xs:element name="city" type="xs:string"/>
          </xs:sequence>
        </xs:complexType>
        <xs:element name="Person">
          <xs:complexType>
            <xs:sequence>
              <xs:element name="name" type="xs:string"/>
              <xs:element name="address" type="AddressType"/>
            </xs:sequence>
          </xs:complexType>
        </xs:element>
      </xs:schema>
    `;

    const result = generateFromXsd(xsd);

    assert.ok(result.code.includes('AddressType:'));
    assert.ok(result.code.includes("type: 'AddressType'"));
  });

  it('should handle ref attributes', () => {
    const xsd = `
      <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
                 xmlns:xml="http://www.w3.org/XML/1998/namespace">
        <xs:element name="Link">
          <xs:complexType>
            <xs:attribute ref="xml:base"/>
            <xs:attribute name="href" type="xs:string" use="required"/>
          </xs:complexType>
        </xs:element>
      </xs:schema>
    `;

    const result = generateFromXsd(xsd);

    // Should extract local name from ref
    assert.ok(result.code.includes("name: 'base'"));
    assert.ok(result.code.includes("name: 'href'"));
    assert.ok(result.code.includes("required: true"));
  });

  it('should handle xsd:import', () => {
    const xsd = `
      <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
                 targetNamespace="http://example.com/customer"
                 xmlns:common="http://example.com/common">
        <xs:import namespace="http://example.com/common" schemaLocation="common.xsd"/>
        <xs:element name="Customer">
          <xs:complexType>
            <xs:sequence>
              <xs:element name="name" type="xs:string"/>
              <xs:element name="address" type="common:AddressType"/>
            </xs:sequence>
          </xs:complexType>
        </xs:element>
      </xs:schema>
    `;

    const result = generateFromXsd(xsd);

    // Should generate import statement
    assert.ok(result.code.includes("import Common from 'common'"));
    // Should include imported schemas
    assert.ok(result.code.includes('include: [Common]'));
    // Schema object should have imports
    assert.ok(result.schema.imports);
  });
});
