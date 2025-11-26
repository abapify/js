/**
 * XSD Schema Tests
 *
 * Comprehensive tests for parsing XSD using ts-xml schemas
 */

import { describe, test as it } from 'node:test';
import { strict as assert } from 'node:assert';
import { parse, build } from 'ts-xml';
import {
  XsdSchemaSchema,
  XsdComplexTypeSchema,
  XsdSimpleTypeSchema,
  XsdElementSchema,
  XsdAttributeSchema,
  XsdSequenceSchema,
  XsdImportSchema,
  XsdAnnotationSchema,
  XsdRestrictionSchema,
  XsdExtensionSchema,
  XsdEnumerationSchema,
  type XsdSchema,
  type XsdComplexType,
  type XsdElement,
} from '../src/index';

describe('XSD Schema Parsing', () => {
  describe('XsdElementSchema', () => {
    it('should parse simple element', () => {
      const xml = '<xsd:element xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="item" type="xsd:string"/>';
      const elem = parse(XsdElementSchema, xml);
      assert.equal(elem.name, 'item');
      assert.equal(elem.type, 'xsd:string');
    });

    it('should parse element with minOccurs/maxOccurs', () => {
      const xml = '<xsd:element xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="items" type="ItemType" minOccurs="0" maxOccurs="unbounded"/>';
      const elem = parse(XsdElementSchema, xml);
      assert.equal(elem.name, 'items');
      assert.equal(elem.minOccurs, '0');
      assert.equal(elem.maxOccurs, 'unbounded');
    });

    it('should parse element with ref', () => {
      const xml = '<xsd:element xmlns:xsd="http://www.w3.org/2001/XMLSchema" ref="other:element"/>';
      const elem = parse(XsdElementSchema, xml);
      assert.equal(elem.ref, 'other:element');
    });

    it('should round-trip element', () => {
      const original: XsdElement = { name: 'test', type: 'xsd:int', minOccurs: '1', maxOccurs: '5' };
      const xml = build(XsdElementSchema, original);
      const parsed = parse(XsdElementSchema, xml);
      assert.equal(parsed.name, original.name);
      assert.equal(parsed.type, original.type);
      assert.equal(parsed.minOccurs, original.minOccurs);
      assert.equal(parsed.maxOccurs, original.maxOccurs);
    });
  });

  describe('XsdAttributeSchema', () => {
    it('should parse attribute with name and type', () => {
      const xml = '<xsd:attribute xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="id" type="xsd:string"/>';
      const attr = parse(XsdAttributeSchema, xml);
      assert.equal(attr.name, 'id');
      assert.equal(attr.type, 'xsd:string');
    });

    it('should parse attribute with use', () => {
      const xml = '<xsd:attribute xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="required" type="xsd:string" use="required"/>';
      const attr = parse(XsdAttributeSchema, xml);
      assert.equal(attr.use, 'required');
    });

    it('should parse attribute with default', () => {
      const xml = '<xsd:attribute xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="status" type="xsd:string" default="active"/>';
      const attr = parse(XsdAttributeSchema, xml);
      assert.equal(attr.default, 'active');
    });
  });

  describe('XsdSequenceSchema', () => {
    it('should parse sequence with elements', () => {
      const xml = `
        <xsd:sequence xmlns:xsd="http://www.w3.org/2001/XMLSchema">
          <xsd:element name="first" type="xsd:string"/>
          <xsd:element name="second" type="xsd:int"/>
        </xsd:sequence>
      `;
      const seq = parse(XsdSequenceSchema, xml);
      assert.equal(seq.elements.length, 2);
      assert.equal(seq.elements[0].name, 'first');
      assert.equal(seq.elements[1].name, 'second');
    });

    it('should parse empty sequence', () => {
      const xml = '<xsd:sequence xmlns:xsd="http://www.w3.org/2001/XMLSchema"/>';
      const seq = parse(XsdSequenceSchema, xml);
      assert.equal(seq.elements.length, 0);
    });
  });

  describe('XsdEnumerationSchema', () => {
    it('should parse enumeration value', () => {
      const xml = '<xsd:enumeration xmlns:xsd="http://www.w3.org/2001/XMLSchema" value="option1"/>';
      const enumVal = parse(XsdEnumerationSchema, xml);
      assert.equal(enumVal.value, 'option1');
    });
  });

  describe('XsdRestrictionSchema', () => {
    it('should parse restriction with enumerations', () => {
      const xml = `
        <xsd:restriction xmlns:xsd="http://www.w3.org/2001/XMLSchema" base="xsd:string">
          <xsd:enumeration value="red"/>
          <xsd:enumeration value="green"/>
          <xsd:enumeration value="blue"/>
        </xsd:restriction>
      `;
      const restriction = parse(XsdRestrictionSchema, xml);
      assert.equal(restriction.base, 'xsd:string');
      assert.equal(restriction.enumerations.length, 3);
      assert.equal(restriction.enumerations[0].value, 'red');
      assert.equal(restriction.enumerations[1].value, 'green');
      assert.equal(restriction.enumerations[2].value, 'blue');
    });
  });

  describe('XsdSimpleTypeSchema', () => {
    it('should parse simpleType with restriction', () => {
      const xml = `
        <xsd:simpleType xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="ColorType">
          <xsd:restriction base="xsd:string">
            <xsd:enumeration value="red"/>
            <xsd:enumeration value="blue"/>
          </xsd:restriction>
        </xsd:simpleType>
      `;
      const simpleType = parse(XsdSimpleTypeSchema, xml);
      assert.equal(simpleType.name, 'ColorType');
      assert.ok(simpleType.restriction);
      assert.equal(simpleType.restriction!.base, 'xsd:string');
      assert.equal(simpleType.restriction!.enumerations.length, 2);
    });
  });

  describe('XsdExtensionSchema', () => {
    it('should parse extension with sequence', () => {
      const xml = `
        <xsd:extension xmlns:xsd="http://www.w3.org/2001/XMLSchema" base="BaseType">
          <xsd:sequence>
            <xsd:element name="extra" type="xsd:string"/>
          </xsd:sequence>
        </xsd:extension>
      `;
      const ext = parse(XsdExtensionSchema, xml);
      assert.equal(ext.base, 'BaseType');
      assert.ok(ext.sequence);
      assert.equal(ext.sequence!.elements.length, 1);
      assert.equal(ext.sequence!.elements[0].name, 'extra');
    });

    it('should parse extension with attributes', () => {
      const xml = `
        <xsd:extension xmlns:xsd="http://www.w3.org/2001/XMLSchema" base="BaseType">
          <xsd:attribute name="id" type="xsd:string"/>
        </xsd:extension>
      `;
      const ext = parse(XsdExtensionSchema, xml);
      assert.equal(ext.base, 'BaseType');
      assert.equal(ext.attributes.length, 1);
      assert.equal(ext.attributes[0].name, 'id');
    });
  });

  describe('XsdComplexTypeSchema', () => {
    it('should parse complexType with sequence', () => {
      const xml = `
        <xsd:complexType xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="PersonType">
          <xsd:sequence>
            <xsd:element name="name" type="xsd:string"/>
            <xsd:element name="age" type="xsd:int"/>
          </xsd:sequence>
        </xsd:complexType>
      `;
      const ct = parse(XsdComplexTypeSchema, xml);
      assert.equal(ct.name, 'PersonType');
      assert.ok(ct.sequence);
      assert.equal(ct.sequence!.elements.length, 2);
    });

    it('should parse complexType with attributes', () => {
      const xml = `
        <xsd:complexType xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="ItemType">
          <xsd:attribute name="id" type="xsd:string"/>
          <xsd:attribute name="status" type="xsd:string" use="required"/>
        </xsd:complexType>
      `;
      const ct = parse(XsdComplexTypeSchema, xml);
      assert.equal(ct.name, 'ItemType');
      assert.equal(ct.attributes.length, 2);
    });

    it('should parse abstract complexType', () => {
      const xml = '<xsd:complexType xmlns:xsd="http://www.w3.org/2001/XMLSchema" name="AbstractBase" abstract="true"/>';
      const ct = parse(XsdComplexTypeSchema, xml);
      assert.equal(ct.abstract, 'true');
    });
  });

  describe('XsdImportSchema', () => {
    it('should parse import with namespace and schemaLocation', () => {
      const xml = '<xsd:import xmlns:xsd="http://www.w3.org/2001/XMLSchema" namespace="http://example.com/other" schemaLocation="other.xsd"/>';
      const imp = parse(XsdImportSchema, xml);
      assert.equal(imp.namespace, 'http://example.com/other');
      assert.equal(imp.schemaLocation, 'other.xsd');
    });

    it('should parse import with only namespace', () => {
      const xml = '<xsd:import xmlns:xsd="http://www.w3.org/2001/XMLSchema" namespace="http://example.com/other"/>';
      const imp = parse(XsdImportSchema, xml);
      assert.equal(imp.namespace, 'http://example.com/other');
      assert.equal(imp.schemaLocation, undefined);
    });
  });

  describe('XsdAnnotationSchema', () => {
    it('should parse annotation with documentation', () => {
      const xml = `
        <xsd:annotation xmlns:xsd="http://www.w3.org/2001/XMLSchema">
          <xsd:documentation xml:lang="en">This is documentation</xsd:documentation>
        </xsd:annotation>
      `;
      const ann = parse(XsdAnnotationSchema, xml);
      assert.ok(ann.documentation);
      assert.equal(ann.documentation!.lang, 'en');
      assert.equal(ann.documentation!.content, 'This is documentation');
    });
  });

  describe('XsdSchemaSchema (root)', () => {
    it('should parse minimal schema', () => {
      const xml = `
        <xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                    targetNamespace="http://example.com/test">
        </xsd:schema>
      `;
      const schema = parse(XsdSchemaSchema, xml);
      assert.equal(schema.targetNamespace, 'http://example.com/test');
    });

    it('should parse schema with imports', () => {
      const xml = `
        <xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                    targetNamespace="http://example.com/test">
          <xsd:import namespace="http://other.com" schemaLocation="other.xsd"/>
          <xsd:import namespace="http://another.com"/>
        </xsd:schema>
      `;
      const schema = parse(XsdSchemaSchema, xml);
      assert.equal(schema.imports.length, 2);
      assert.equal(schema.imports[0].namespace, 'http://other.com');
    });

    it('should parse schema with complexTypes', () => {
      const xml = `
        <xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                    targetNamespace="http://example.com/test">
          <xsd:complexType name="Type1">
            <xsd:sequence>
              <xsd:element name="field1" type="xsd:string"/>
            </xsd:sequence>
          </xsd:complexType>
          <xsd:complexType name="Type2">
            <xsd:attribute name="id" type="xsd:string"/>
          </xsd:complexType>
        </xsd:schema>
      `;
      const schema = parse(XsdSchemaSchema, xml);
      assert.equal(schema.complexTypes.length, 2);
      assert.equal(schema.complexTypes[0].name, 'Type1');
      assert.equal(schema.complexTypes[1].name, 'Type2');
    });

    it('should parse schema with root elements', () => {
      const xml = `
        <xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                    targetNamespace="http://example.com/test">
          <xsd:element name="root" type="RootType"/>
          <xsd:element name="other" type="OtherType"/>
        </xsd:schema>
      `;
      const schema = parse(XsdSchemaSchema, xml);
      assert.equal(schema.elements.length, 2);
      assert.equal(schema.elements[0].name, 'root');
    });

    it('should parse schema with elementFormDefault', () => {
      const xml = `
        <xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                    targetNamespace="http://example.com/test"
                    elementFormDefault="qualified"
                    attributeFormDefault="unqualified">
        </xsd:schema>
      `;
      const schema = parse(XsdSchemaSchema, xml);
      assert.equal(schema.elementFormDefault, 'qualified');
      assert.equal(schema.attributeFormDefault, 'unqualified');
    });

    it('should parse complete schema', () => {
      const xml = `
        <xsd:schema xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                    targetNamespace="http://example.com/test"
                    elementFormDefault="qualified">
          <xsd:annotation>
            <xsd:documentation>Test schema</xsd:documentation>
          </xsd:annotation>
          <xsd:import namespace="http://other.com" schemaLocation="other.xsd"/>
          <xsd:simpleType name="StatusType">
            <xsd:restriction base="xsd:string">
              <xsd:enumeration value="active"/>
              <xsd:enumeration value="inactive"/>
            </xsd:restriction>
          </xsd:simpleType>
          <xsd:complexType name="ItemType">
            <xsd:sequence>
              <xsd:element name="name" type="xsd:string"/>
              <xsd:element name="status" type="StatusType"/>
            </xsd:sequence>
            <xsd:attribute name="id" type="xsd:string" use="required"/>
          </xsd:complexType>
          <xsd:element name="item" type="ItemType"/>
        </xsd:schema>
      `;
      const schema = parse(XsdSchemaSchema, xml);
      
      assert.equal(schema.targetNamespace, 'http://example.com/test');
      assert.equal(schema.elementFormDefault, 'qualified');
      assert.ok(schema.annotation);
      assert.equal(schema.imports.length, 1);
      assert.equal(schema.simpleTypes.length, 1);
      assert.equal(schema.simpleTypes[0].name, 'StatusType');
      assert.equal(schema.complexTypes.length, 1);
      assert.equal(schema.complexTypes[0].name, 'ItemType');
      assert.equal(schema.elements.length, 1);
      assert.equal(schema.elements[0].name, 'item');
    });
  });

  describe('Round-trip tests', () => {
    it('should round-trip complexType', () => {
      const original: XsdComplexType = {
        name: 'TestType',
        sequence: {
          elements: [
            { name: 'field1', type: 'xsd:string' },
            { name: 'field2', type: 'xsd:int', minOccurs: '0' },
          ],
        },
        attributes: [
          { name: 'id', type: 'xsd:string', use: 'required' },
        ],
      };
      
      const xml = build(XsdComplexTypeSchema, original);
      const parsed = parse(XsdComplexTypeSchema, xml);
      
      assert.equal(parsed.name, original.name);
      assert.equal(parsed.sequence?.elements.length, 2);
      assert.equal(parsed.attributes.length, 1);
    });
  });
});
