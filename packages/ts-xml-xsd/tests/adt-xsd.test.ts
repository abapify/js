/**
 * ADT XSD Parsing Tests
 *
 * Tests parsing real SAP ADT XSD schemas
 */

import { describe, test as it } from 'node:test';
import { strict as assert } from 'node:assert';
import { parse } from 'ts-xml';
import { XsdSchemaSchema } from '../src/index';

describe('ADT XSD Parsing', () => {
  it('should parse a realistic ADT-style schema', () => {
    // This is a simplified version of ADT schema patterns
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                  xmlns:sia6="http://www.sap.com/iam/sia6"
                  targetNamespace="http://www.sap.com/iam/sia6"
                  elementFormDefault="qualified"
                  attributeFormDefault="qualified">
        
        <xsd:import namespace="http://www.sap.com/adt/core" 
                    schemaLocation="platform:/plugin/com.sap.adt.tools.core.base/model/adtcore.xsd"/>
        
        <xsd:annotation>
          <xsd:documentation xml:lang="en">
            Generic schema definition for App
            Copyright (c) 2018 by SAP SE
          </xsd:documentation>
        </xsd:annotation>
        
        <xsd:element name="sia6" type="sia6:sia6"/>
        
        <xsd:complexType name="sia6">
          <xsd:sequence>
            <xsd:element name="content" type="sia6:Content"/>
          </xsd:sequence>
        </xsd:complexType>
        
        <xsd:complexType name="Content">
          <xsd:sequence>
            <xsd:element name="appID" type="xsd:string"/>
            <xsd:element name="appType" type="xsd:string"/>
            <xsd:element name="services" type="sia6:Services" minOccurs="0" maxOccurs="1"/>
          </xsd:sequence>
        </xsd:complexType>
        
        <xsd:complexType name="Services">
          <xsd:sequence>
            <xsd:element name="service" type="sia6:Service" minOccurs="0" maxOccurs="unbounded"/>
          </xsd:sequence>
        </xsd:complexType>
        
        <xsd:complexType name="Service">
          <xsd:sequence>
            <xsd:element name="srvcType" type="xsd:string"/>
            <xsd:element name="srvcName" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
        
        <xsd:complexType name="PublishingStatus">
          <xsd:attribute name="publishingStatusText" type="xsd:string"/>
        </xsd:complexType>
        
      </xsd:schema>
    `;

    const schema = parse(XsdSchemaSchema, xml);

    // Verify schema attributes
    assert.equal(schema.targetNamespace, 'http://www.sap.com/iam/sia6');
    assert.equal(schema.elementFormDefault, 'qualified');
    assert.equal(schema.attributeFormDefault, 'qualified');

    // Verify imports
    assert.equal(schema.imports.length, 1);
    assert.equal(schema.imports[0].namespace, 'http://www.sap.com/adt/core');
    assert.ok(schema.imports[0].schemaLocation?.includes('adtcore.xsd'));

    // Verify annotation
    assert.ok(schema.annotation);
    assert.ok(schema.annotation!.documentation);
    assert.ok(schema.annotation!.documentation!.content.includes('SAP SE'));

    // Verify root elements
    assert.equal(schema.elements.length, 1);
    assert.equal(schema.elements[0].name, 'sia6');
    assert.equal(schema.elements[0].type, 'sia6:sia6');

    // Verify complex types
    assert.equal(schema.complexTypes.length, 5);
    
    const sia6Type = schema.complexTypes.find(t => t.name === 'sia6');
    assert.ok(sia6Type);
    assert.ok(sia6Type!.sequence);
    assert.equal(sia6Type!.sequence!.elements.length, 1);
    assert.equal(sia6Type!.sequence!.elements[0].name, 'content');

    const contentType = schema.complexTypes.find(t => t.name === 'Content');
    assert.ok(contentType);
    assert.ok(contentType!.sequence);
    assert.equal(contentType!.sequence!.elements.length, 3);
    
    // Check optional element
    const servicesElem = contentType!.sequence!.elements.find(e => e.name === 'services');
    assert.ok(servicesElem);
    assert.equal(servicesElem!.minOccurs, '0');
    assert.equal(servicesElem!.maxOccurs, '1');

    const servicesType = schema.complexTypes.find(t => t.name === 'Services');
    assert.ok(servicesType);
    const serviceElem = servicesType!.sequence!.elements[0];
    assert.equal(serviceElem.minOccurs, '0');
    assert.equal(serviceElem.maxOccurs, 'unbounded');

    // Verify attribute-only type
    const publishingStatusType = schema.complexTypes.find(t => t.name === 'PublishingStatus');
    assert.ok(publishingStatusType);
    assert.equal(publishingStatusType!.attributes.length, 1);
    assert.equal(publishingStatusType!.attributes[0].name, 'publishingStatusText');
  });

  it('should parse schema with complexContent extension', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                  targetNamespace="http://example.com/test">
        
        <xsd:complexType name="BaseType">
          <xsd:sequence>
            <xsd:element name="baseField" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
        
        <xsd:complexType name="DerivedType">
          <xsd:complexContent>
            <xsd:extension base="BaseType">
              <xsd:sequence>
                <xsd:element name="derivedField" type="xsd:int"/>
              </xsd:sequence>
              <xsd:attribute name="id" type="xsd:string"/>
            </xsd:extension>
          </xsd:complexContent>
        </xsd:complexType>
        
      </xsd:schema>
    `;

    const schema = parse(XsdSchemaSchema, xml);

    assert.equal(schema.complexTypes.length, 2);

    const derivedType = schema.complexTypes.find(t => t.name === 'DerivedType');
    assert.ok(derivedType);
    assert.ok(derivedType!.complexContent);
    assert.ok(derivedType!.complexContent!.extension);
    assert.equal(derivedType!.complexContent!.extension!.base, 'BaseType');
    assert.ok(derivedType!.complexContent!.extension!.sequence);
    assert.equal(derivedType!.complexContent!.extension!.sequence!.elements.length, 1);
    assert.equal(derivedType!.complexContent!.extension!.attributes.length, 1);
  });

  it('should parse schema with simpleTypes (enums)', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                  targetNamespace="http://example.com/test">
        
        <xsd:simpleType name="StatusType">
          <xsd:restriction base="xsd:string">
            <xsd:enumeration value="draft"/>
            <xsd:enumeration value="active"/>
            <xsd:enumeration value="archived"/>
          </xsd:restriction>
        </xsd:simpleType>
        
        <xsd:simpleType name="PriorityType">
          <xsd:restriction base="xsd:string">
            <xsd:enumeration value="low"/>
            <xsd:enumeration value="medium"/>
            <xsd:enumeration value="high"/>
          </xsd:restriction>
        </xsd:simpleType>
        
      </xsd:schema>
    `;

    const schema = parse(XsdSchemaSchema, xml);

    assert.equal(schema.simpleTypes.length, 2);

    const statusType = schema.simpleTypes.find(t => t.name === 'StatusType');
    assert.ok(statusType);
    assert.ok(statusType!.restriction);
    assert.equal(statusType!.restriction!.base, 'xsd:string');
    assert.equal(statusType!.restriction!.enumerations.length, 3);
    assert.equal(statusType!.restriction!.enumerations[0].value, 'draft');
    assert.equal(statusType!.restriction!.enumerations[1].value, 'active');
    assert.equal(statusType!.restriction!.enumerations[2].value, 'archived');
  });
});
