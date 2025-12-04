/**
 * XSD Self-Hosting Tests
 * 
 * Tests for parsing and building XSD files using ts-xsd itself.
 * This validates the bootstrapping capability - ts-xsd can process its own input format.
 */

import { describe, test as it } from 'node:test';
import { strict as assert } from 'node:assert';
import { parseXsd, buildXsd, type XsdDocument } from '../../src/index';

describe('XSD Self-Hosting', () => {
  describe('parseXsd', () => {
    it('should parse a simple XSD with element and complexType', () => {
      const xsd = `<?xml version="1.0" encoding="UTF-8"?>
        <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
          <xs:element name="Person" type="PersonType"/>
          <xs:complexType name="PersonType">
            <xs:sequence>
              <xs:element name="Name" type="xs:string"/>
              <xs:element name="Age" type="xs:int" minOccurs="0"/>
            </xs:sequence>
          </xs:complexType>
        </xs:schema>`;

      const doc = parseXsd(xsd);

      // Check element
      assert.ok(doc.element, 'Should have elements');
      assert.equal(doc.element.length, 1);
      assert.equal(doc.element[0].name, 'Person');
      assert.equal(doc.element[0].type, 'PersonType');

      // Check complexType
      assert.ok(doc.complexType, 'Should have complexTypes');
      assert.equal(doc.complexType.length, 1);
      assert.equal(doc.complexType[0].name, 'PersonType');
      assert.ok(doc.complexType[0].sequence, 'Should have sequence');
      assert.equal(doc.complexType[0].sequence?.element?.length, 2);
    });

    it('should parse XSD with xs:all', () => {
      const xsd = `<?xml version="1.0" encoding="UTF-8"?>
        <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
          <xs:element name="Config" type="ConfigType"/>
          <xs:complexType name="ConfigType">
            <xs:all>
              <xs:element name="Name" type="xs:string"/>
              <xs:element name="Value" type="xs:string"/>
            </xs:all>
          </xs:complexType>
        </xs:schema>`;

      const doc = parseXsd(xsd);

      assert.ok(doc.complexType?.[0].all, 'Should have all');
      assert.equal(doc.complexType[0].all?.element?.length, 2);
    });

    it('should parse XSD with attributes', () => {
      const xsd = `<?xml version="1.0" encoding="UTF-8"?>
        <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
          <xs:element name="Item" type="ItemType"/>
          <xs:complexType name="ItemType">
            <xs:sequence>
              <xs:element name="Name" type="xs:string"/>
            </xs:sequence>
            <xs:attribute name="id" type="xs:string" use="required"/>
            <xs:attribute name="version" type="xs:string"/>
          </xs:complexType>
        </xs:schema>`;

      const doc = parseXsd(xsd);

      assert.ok(doc.complexType?.[0].attribute, 'Should have attributes');
      assert.equal(doc.complexType[0].attribute?.length, 2);
      assert.equal(doc.complexType[0].attribute?.[0].name, 'id');
      assert.equal(doc.complexType[0].attribute?.[0].use, 'required');
    });

    it('should parse XSD with abstract element and substitutionGroup', () => {
      const xsd = `<?xml version="1.0" encoding="UTF-8"?>
        <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
          <xs:element name="Shape" type="xs:anyType" abstract="true"/>
          <xs:element name="Circle" type="CircleType" substitutionGroup="Shape"/>
          <xs:complexType name="CircleType">
            <xs:sequence>
              <xs:element name="radius" type="xs:int"/>
            </xs:sequence>
          </xs:complexType>
        </xs:schema>`;

      const doc = parseXsd(xsd);

      assert.equal(doc.element?.length, 2);
      
      const shapeEl = doc.element?.find(e => e.name === 'Shape');
      assert.ok(shapeEl, 'Should have Shape element');
      assert.equal(shapeEl.abstract, 'true');

      const circleEl = doc.element?.find(e => e.name === 'Circle');
      assert.ok(circleEl, 'Should have Circle element');
      assert.equal(circleEl.substitutionGroup, 'Shape');
    });

    it('should parse XSD with complexContent extension', () => {
      const xsd = `<?xml version="1.0" encoding="UTF-8"?>
        <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
          <xs:complexType name="BaseType">
            <xs:sequence>
              <xs:element name="id" type="xs:string"/>
            </xs:sequence>
          </xs:complexType>
          <xs:complexType name="DerivedType">
            <xs:complexContent>
              <xs:extension base="BaseType">
                <xs:sequence>
                  <xs:element name="name" type="xs:string"/>
                </xs:sequence>
              </xs:extension>
            </xs:complexContent>
          </xs:complexType>
        </xs:schema>`;

      const doc = parseXsd(xsd);

      const derivedType = doc.complexType?.find(t => t.name === 'DerivedType');
      assert.ok(derivedType, 'Should have DerivedType');
      assert.ok(derivedType.complexContent?.extension, 'Should have extension');
      assert.equal(derivedType.complexContent?.extension?.base, 'BaseType');
    });

    it('should parse XSD with simpleType enumeration', () => {
      const xsd = `<?xml version="1.0" encoding="UTF-8"?>
        <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
          <xs:simpleType name="StatusType">
            <xs:restriction base="xs:string">
              <xs:enumeration value="active"/>
              <xs:enumeration value="inactive"/>
              <xs:enumeration value="pending"/>
            </xs:restriction>
          </xs:simpleType>
        </xs:schema>`;

      const doc = parseXsd(xsd);

      assert.ok(doc.simpleType, 'Should have simpleTypes');
      assert.equal(doc.simpleType.length, 1);
      assert.equal(doc.simpleType[0].name, 'StatusType');
      assert.ok(doc.simpleType[0].restriction, 'Should have restriction');
      assert.equal(doc.simpleType[0].restriction?.enumeration?.length, 3);
    });

    it('should parse XSD with import', () => {
      const xsd = `<?xml version="1.0" encoding="UTF-8"?>
        <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
                   xmlns:other="http://example.com/other">
          <xs:import namespace="http://example.com/other" schemaLocation="other.xsd"/>
          <xs:element name="Root" type="RootType"/>
          <xs:complexType name="RootType">
            <xs:sequence>
              <xs:element name="data" type="xs:string"/>
            </xs:sequence>
          </xs:complexType>
        </xs:schema>`;

      const doc = parseXsd(xsd);

      assert.ok(doc.import, 'Should have imports');
      assert.equal(doc.import.length, 1);
      assert.equal(doc.import[0].namespace, 'http://example.com/other');
      assert.equal(doc.import[0].schemaLocation, 'other.xsd');
    });
  });

  describe('buildXsd', () => {
    it('should build XSD from document object', () => {
      const doc: XsdDocument = {
        element: [
          { name: 'Person', type: 'PersonType' }
        ],
        complexType: [
          {
            name: 'PersonType',
            sequence: {
              element: [
                { name: 'Name', type: 'xs:string' }
              ]
            }
          }
        ]
      };

      const xsd = buildXsd(doc);

      assert.ok(xsd.includes('<xs:schema'), 'Should have schema element');
      assert.ok(xsd.includes('name="Person"'), 'Should have Person element');
      assert.ok(xsd.includes('name="PersonType"'), 'Should have PersonType');
      assert.ok(xsd.includes('name="Name"'), 'Should have Name element');
    });
  });

  describe('roundtrip', () => {
    it('should roundtrip a simple XSD', () => {
      const originalXsd = `<?xml version="1.0" encoding="UTF-8"?>
        <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
          <xs:element name="Root" type="RootType"/>
          <xs:complexType name="RootType">
            <xs:sequence>
              <xs:element name="field" type="xs:string"/>
            </xs:sequence>
          </xs:complexType>
        </xs:schema>`;

      // Parse
      const doc = parseXsd(originalXsd);
      
      // Build
      const rebuiltXsd = buildXsd(doc);
      
      // Parse again
      const doc2 = parseXsd(rebuiltXsd);

      // Compare structure
      assert.equal(doc2.element?.length, doc.element?.length);
      assert.equal(doc2.element?.[0].name, doc.element?.[0].name);
      assert.equal(doc2.complexType?.length, doc.complexType?.length);
      assert.equal(doc2.complexType?.[0].name, doc.complexType?.[0].name);
    });

    it('should roundtrip XSD with all features', () => {
      const originalXsd = `<?xml version="1.0" encoding="UTF-8"?>
        <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
                   targetNamespace="http://example.com"
                   elementFormDefault="qualified">
          <xs:import namespace="http://other.com" schemaLocation="other.xsd"/>
          <xs:include schemaLocation="common.xsd"/>
          
          <xs:element name="Shape" type="xs:anyType" abstract="true"/>
          <xs:element name="Circle" type="CircleType" substitutionGroup="Shape"/>
          
          <xs:complexType name="BaseType">
            <xs:sequence>
              <xs:element name="id" type="xs:string"/>
            </xs:sequence>
          </xs:complexType>
          
          <xs:complexType name="CircleType">
            <xs:complexContent>
              <xs:extension base="BaseType">
                <xs:sequence>
                  <xs:element name="radius" type="xs:int"/>
                </xs:sequence>
                <xs:attribute name="color" type="xs:string"/>
              </xs:extension>
            </xs:complexContent>
          </xs:complexType>
          
          <xs:complexType name="ConfigType">
            <xs:all>
              <xs:element name="Name" type="xs:string"/>
              <xs:element name="Value" type="xs:string" minOccurs="0"/>
            </xs:all>
          </xs:complexType>
          
          <xs:simpleType name="StatusType">
            <xs:restriction base="xs:string">
              <xs:enumeration value="active"/>
              <xs:enumeration value="inactive"/>
            </xs:restriction>
          </xs:simpleType>
        </xs:schema>`;

      // Parse → Build → Parse
      const doc = parseXsd(originalXsd);
      const rebuilt = buildXsd(doc);
      const doc2 = parseXsd(rebuilt);

      // Verify counts
      assert.equal(doc2.element?.length, 2, 'Should have 2 elements');
      assert.equal(doc2.complexType?.length, 3, 'Should have 3 complexTypes');
      assert.equal(doc2.simpleType?.length, 1, 'Should have 1 simpleType');
      assert.equal(doc2.import?.length, 1, 'Should have 1 import');
      assert.equal(doc2.include?.length, 1, 'Should have 1 include');

      // Verify attributes preserved
      assert.equal(doc2.targetNamespace, 'http://example.com');
      assert.equal(doc2.elementFormDefault, 'qualified');

      // Verify abstract element
      const shapeEl = doc2.element?.find(e => e.name === 'Shape');
      assert.equal(shapeEl?.abstract, 'true');

      // Verify substitutionGroup
      const circleEl = doc2.element?.find(e => e.name === 'Circle');
      assert.equal(circleEl?.substitutionGroup, 'Shape');

      // Verify complexContent extension
      const circleType = doc2.complexType?.find(t => t.name === 'CircleType');
      assert.equal(circleType?.complexContent?.extension?.base, 'BaseType');
      assert.equal(circleType?.complexContent?.extension?.attribute?.length, 1);

      // Verify xs:all
      const configType = doc2.complexType?.find(t => t.name === 'ConfigType');
      assert.ok(configType?.all, 'ConfigType should have all');
      assert.equal(configType?.all?.element?.length, 2);

      // Verify simpleType enumeration
      const statusType = doc2.simpleType?.find(t => t.name === 'StatusType');
      assert.equal(statusType?.restriction?.enumeration?.length, 2);
    });

    it('should roundtrip XSD with nested sequences and choices', () => {
      const originalXsd = `<?xml version="1.0" encoding="UTF-8"?>
        <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
          <xs:complexType name="ComplexType">
            <xs:sequence>
              <xs:element name="header" type="xs:string"/>
              <xs:choice>
                <xs:element name="optionA" type="xs:string"/>
                <xs:element name="optionB" type="xs:int"/>
              </xs:choice>
              <xs:element name="footer" type="xs:string"/>
            </xs:sequence>
          </xs:complexType>
        </xs:schema>`;

      const doc = parseXsd(originalXsd);
      const rebuilt = buildXsd(doc);
      const doc2 = parseXsd(rebuilt);

      const ct = doc2.complexType?.[0];
      assert.ok(ct?.sequence, 'Should have sequence');
      assert.equal(ct?.sequence?.element?.length, 2, 'Should have 2 direct elements');
      assert.equal(ct?.sequence?.choice?.length, 1, 'Should have 1 choice');
      assert.equal(ct?.sequence?.choice?.[0].element?.length, 2, 'Choice should have 2 elements');
    });

    it('should roundtrip XSD with redefine', () => {
      const originalXsd = `<?xml version="1.0" encoding="UTF-8"?>
        <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
          <xs:redefine schemaLocation="base.xsd">
            <xs:complexType name="ExtendedType">
              <xs:complexContent>
                <xs:extension base="ExtendedType">
                  <xs:sequence>
                    <xs:element name="extra" type="xs:string"/>
                  </xs:sequence>
                </xs:extension>
              </xs:complexContent>
            </xs:complexType>
          </xs:redefine>
        </xs:schema>`;

      const doc = parseXsd(originalXsd);
      const rebuilt = buildXsd(doc);
      const doc2 = parseXsd(rebuilt);

      assert.equal(doc2.redefine?.length, 1);
      assert.equal(doc2.redefine?.[0].schemaLocation, 'base.xsd');
      assert.equal(doc2.redefine?.[0].complexType?.length, 1);
    });
  });
});
