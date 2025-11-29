/**
 * xs:redefine Tests
 * 
 * Comprehensive tests for XSD redefine support:
 * 1. Codegen: XSD with xs:redefine → TypeScript schema
 * 2. Runtime: Parse XML using redefined types
 * 3. Roundtrip: Build XML → Parse XML → Verify data
 * 
 * xs:redefine semantics:
 * - Includes a base schema AND modifies types in-place
 * - Redefined type uses xs:extension base="SameTypeName"
 * - Result should be a MERGED type (base + extensions)
 * - NOT a separate extended type
 */

import { describe, test as it } from 'node:test';
import { strict as assert } from 'node:assert';
import { parseXsdToSchemaData } from '../src/codegen/index';
import { parse, build, type XsdSchema, type InferXsd } from '../src/index';

describe('xs:redefine', () => {
  describe('codegen', () => {
    it('should parse xs:redefine element without extends (self-reference)', () => {
      const xsd = `<xs:schema 
          xmlns:xs="http://www.w3.org/2001/XMLSchema"
          xmlns:tm="http://www.sap.com/cts/adt/tm"
          targetNamespace="http://www.sap.com/cts/adt/tm">
          
          <xs:redefine schemaLocation="base.xsd">
            <xs:complexType name="root">
              <xs:complexContent>
                <xs:extension base="tm:root">
                  <xs:sequence>
                    <xs:element name="request" type="tm:request" minOccurs="0" maxOccurs="unbounded"/>
                  </xs:sequence>
                </xs:extension>
              </xs:complexContent>
            </xs:complexType>
          </xs:redefine>
          
          <xs:element name="root" type="tm:root"/>
        </xs:schema>`;

      const { schemaData } = parseXsdToSchemaData(xsd);

      // Should have the redefined 'root' type
      assert.ok(schemaData.elements['root'], 'Should have root element');
      
      // The root element should NOT have extends (self-referential redefine)
      const rootEl = schemaData.elements['root'] as any;
      assert.equal(rootEl.extends, undefined, 'Self-referential redefine should NOT have extends');
      
      // Should have the new 'request' field in sequence
      const sequence = rootEl.sequence as any[];
      assert.ok(sequence, 'Should have sequence');
      const requestField = sequence.find((f: any) => f.name === 'request');
      assert.ok(requestField, 'Should have request field');
      assert.ok(requestField.type, 'Request field should have a type');
    });

    it('should add redefine schemaLocation as import', () => {
      const xsd = `<xs:schema 
          xmlns:xs="http://www.w3.org/2001/XMLSchema"
          targetNamespace="http://example.com/test">
          
          <xs:redefine schemaLocation="base-schema.xsd">
            <xs:complexType name="MyType">
              <xs:complexContent>
                <xs:extension base="MyType">
                  <xs:sequence>
                    <xs:element name="newField" type="xs:string"/>
                  </xs:sequence>
                </xs:extension>
              </xs:complexContent>
            </xs:complexType>
          </xs:redefine>
          
          <xs:element name="root" type="MyType"/>
        </xs:schema>`;

      const { schemaData } = parseXsdToSchemaData(xsd);

      // Should have import for the base schema
      assert.ok(schemaData.imports.length > 0, 'Should have imports');
      const baseImport = schemaData.imports.find(i => i.path.includes('base-schema'));
      assert.ok(baseImport, 'Should have base-schema import');
    });

    it('should handle multiple redefined types', () => {
      const xsd = `<xs:schema 
          xmlns:xs="http://www.w3.org/2001/XMLSchema"
          targetNamespace="http://example.com/test">
          
          <xs:redefine schemaLocation="base.xsd">
            <xs:complexType name="TypeA">
              <xs:complexContent>
                <xs:extension base="TypeA">
                  <xs:sequence>
                    <xs:element name="fieldA" type="xs:string"/>
                  </xs:sequence>
                </xs:extension>
              </xs:complexContent>
            </xs:complexType>
            
            <xs:complexType name="TypeB">
              <xs:complexContent>
                <xs:extension base="TypeB">
                  <xs:attribute name="attrB" type="xs:string"/>
                </xs:extension>
              </xs:complexContent>
            </xs:complexType>
          </xs:redefine>
          
          <xs:element name="root" type="TypeA"/>
        </xs:schema>`;

      const { schemaData } = parseXsdToSchemaData(xsd);

      // Should have both redefined types
      assert.ok(schemaData.elements['TypeA'], 'Should have TypeA');
      assert.ok(schemaData.elements['TypeB'], 'Should have TypeB');
      
      // TypeA should have fieldA
      const typeA = schemaData.elements['TypeA'] as any;
      const fieldA = typeA.sequence?.find((f: any) => f.name === 'fieldA');
      assert.ok(fieldA, 'TypeA should have fieldA');
      
      // TypeB should have attrB
      const typeB = schemaData.elements['TypeB'] as any;
      const attrB = typeB.attributes?.find((a: any) => a.name === 'attrB');
      assert.ok(attrB, 'TypeB should have attrB');
    });
  });

  describe('runtime - merged types', () => {
    // Simulate what xs:redefine should produce: a merged type
    // Base schema has: Person { name, age }
    // Redefine adds: Person { email, phone }
    // Result should be: Person { name, age, email, phone }
    
    const BasePersonSchema = {
      root: 'Person',
      elements: {
        Person: {
          sequence: [
            { name: 'name', type: 'string' },
            { name: 'age', type: 'number', minOccurs: 0 },
          ],
          attributes: [
            { name: 'id', type: 'string', required: true },
          ],
        },
      },
    } as const satisfies XsdSchema;

    // This is what xs:redefine SHOULD produce - a merged type
    // NOT a type that "extends" Person, but Person itself with extra fields
    const RedefinedPersonSchema = {
      root: 'Person',
      elements: {
        Person: {
          sequence: [
            // Original fields from base
            { name: 'name', type: 'string' },
            { name: 'age', type: 'number', minOccurs: 0 },
            // New fields from redefine
            { name: 'email', type: 'string', minOccurs: 0 },
            { name: 'phone', type: 'string', minOccurs: 0 },
          ],
          attributes: [
            // Original attribute
            { name: 'id', type: 'string', required: true },
            // New attribute from redefine
            { name: 'status', type: 'string' },
          ],
        },
      },
    } as const satisfies XsdSchema;

    type RedefinedPerson = InferXsd<typeof RedefinedPersonSchema>;

    it('should parse XML with merged type fields', () => {
      const xml = `
        <Person id="123" status="active">
          <name>John Doe</name>
          <age>30</age>
          <email>john@example.com</email>
          <phone>555-1234</phone>
        </Person>
      `;

      const person = parse(RedefinedPersonSchema, xml);

      // Original fields
      assert.equal(person.id, '123');
      assert.equal(person.name, 'John Doe');
      assert.equal(person.age, 30);
      // New fields from redefine
      assert.equal(person.email, 'john@example.com');
      assert.equal(person.phone, '555-1234');
      assert.equal(person.status, 'active');
    });

    it('should build XML with merged type fields', () => {
      const person: RedefinedPerson = {
        id: '456',
        status: 'inactive',
        name: 'Jane Smith',
        age: 25,
        email: 'jane@example.com',
        phone: '555-5678',
      };

      const xml = build(RedefinedPersonSchema, person);

      assert.ok(xml.includes('id="456"'));
      assert.ok(xml.includes('status="inactive"'));
      assert.ok(xml.includes('<name>Jane Smith</name>'));
      assert.ok(xml.includes('<age>25</age>'));
      assert.ok(xml.includes('<email>jane@example.com</email>'));
      assert.ok(xml.includes('<phone>555-5678</phone>'));
    });

    it('should roundtrip merged type data', () => {
      const original: RedefinedPerson = {
        id: 'rt-1',
        status: 'pending',
        name: 'Roundtrip Test',
        age: 42,
        email: 'rt@test.com',
        phone: '555-0000',
      };

      const xml = build(RedefinedPersonSchema, original);
      const parsed = parse(RedefinedPersonSchema, xml);

      assert.equal(parsed.id, original.id);
      assert.equal(parsed.status, original.status);
      assert.equal(parsed.name, original.name);
      assert.equal(parsed.age, original.age);
      assert.equal(parsed.email, original.email);
      assert.equal(parsed.phone, original.phone);
    });
  });

  describe('runtime - nested redefined types', () => {
    // More complex scenario: redefine affects nested types
    // Base: Order { items: Item[] }
    // Redefine Item to add: price, quantity
    
    const RedefinedOrderSchema = {
      root: 'Order',
      elements: {
        Order: {
          sequence: [
            { name: 'item', type: 'Item', maxOccurs: 'unbounded' },
          ],
          attributes: [
            { name: 'id', type: 'string', required: true },
            { name: 'date', type: 'string' },  // Added by redefine
          ],
        },
        Item: {
          // Merged: original name + redefined price, quantity
          sequence: [
            { name: 'name', type: 'string' },
            { name: 'price', type: 'number' },      // Added by redefine
            { name: 'quantity', type: 'number' },   // Added by redefine
          ],
          attributes: [
            { name: 'sku', type: 'string' },        // Added by redefine
          ],
        },
      },
    } as const satisfies XsdSchema;

    type Order = InferXsd<typeof RedefinedOrderSchema>;

    it('should parse nested redefined types', () => {
      const xml = `
        <Order id="order-1" date="2024-01-15">
          <item sku="ABC123">
            <name>Widget</name>
            <price>19.99</price>
            <quantity>2</quantity>
          </item>
          <item sku="DEF456">
            <name>Gadget</name>
            <price>29.99</price>
            <quantity>1</quantity>
          </item>
        </Order>
      `;

      const order = parse(RedefinedOrderSchema, xml);

      assert.equal(order.id, 'order-1');
      assert.equal(order.date, '2024-01-15');
      assert.equal(order.item.length, 2);
      
      assert.equal(order.item[0].sku, 'ABC123');
      assert.equal(order.item[0].name, 'Widget');
      assert.equal(order.item[0].price, 19.99);
      assert.equal(order.item[0].quantity, 2);
      
      assert.equal(order.item[1].sku, 'DEF456');
      assert.equal(order.item[1].name, 'Gadget');
      assert.equal(order.item[1].price, 29.99);
      assert.equal(order.item[1].quantity, 1);
    });

    it('should build nested redefined types', () => {
      const order: Order = {
        id: 'order-2',
        date: '2024-02-20',
        item: [
          { sku: 'XYZ789', name: 'Doohickey', price: 9.99, quantity: 5 },
        ],
      };

      const xml = build(RedefinedOrderSchema, order);

      assert.ok(xml.includes('id="order-2"'));
      assert.ok(xml.includes('date="2024-02-20"'));
      assert.ok(xml.includes('sku="XYZ789"'));
      assert.ok(xml.includes('<name>Doohickey</name>'));
      assert.ok(xml.includes('<price>9.99</price>'));
      assert.ok(xml.includes('<quantity>5</quantity>'));
    });

    it('should roundtrip nested redefined types', () => {
      const original: Order = {
        id: 'rt-order',
        date: '2024-03-25',
        item: [
          { sku: 'RT1', name: 'Item 1', price: 10, quantity: 1 },
          { sku: 'RT2', name: 'Item 2', price: 20, quantity: 2 },
        ],
      };

      const xml = build(RedefinedOrderSchema, original);
      const parsed = parse(RedefinedOrderSchema, xml);

      assert.equal(parsed.id, original.id);
      assert.equal(parsed.date, original.date);
      assert.equal(parsed.item.length, original.item.length);
      
      for (let i = 0; i < original.item.length; i++) {
        assert.equal(parsed.item[i].sku, original.item[i].sku);
        assert.equal(parsed.item[i].name, original.item[i].name);
        assert.equal(parsed.item[i].price, original.item[i].price);
        assert.equal(parsed.item[i].quantity, original.item[i].quantity);
      }
    });
  });

  describe('codegen - redefine should NOT create extends', () => {
    // The key difference between xs:redefine and xs:extension:
    // - xs:extension creates a NEW type that extends the base
    // - xs:redefine MODIFIES the original type in-place
    //
    // When codegen processes xs:redefine, the output should NOT have
    // an 'extends' property - the fields should be merged directly.

    it('should NOT add extends for self-referential redefine', () => {
      // xs:redefine with base="SameName" should NOT generate extends
      // because it's modifying the type in-place, not creating a derived type
      
      const xsd = `<xs:schema 
          xmlns:xs="http://www.w3.org/2001/XMLSchema"
          targetNamespace="http://example.com/test">
          
          <xs:redefine schemaLocation="base.xsd">
            <xs:complexType name="Person">
              <xs:complexContent>
                <xs:extension base="Person">
                  <xs:sequence>
                    <xs:element name="email" type="xs:string"/>
                  </xs:sequence>
                </xs:extension>
              </xs:complexContent>
            </xs:complexType>
          </xs:redefine>
          
          <xs:element name="root" type="Person"/>
        </xs:schema>`;

      const { schemaData } = parseXsdToSchemaData(xsd);
      const person = schemaData.elements['Person'] as any;

      // Verify the type exists and has the new field
      assert.ok(person, 'Should have Person type');
      const emailField = person.sequence?.find((f: any) => f.name === 'email');
      assert.ok(emailField, 'Should have email field from redefine');
      
      // KEY ASSERTION: Redefined type should NOT have extends (self-reference is not inheritance)
      assert.equal(person.extends, undefined, 'Redefined type should NOT have extends when base === typeName');
    });

    it('should still add extends for regular extension (not redefine)', () => {
      // Regular xs:extension (not inside xs:redefine) should still generate extends
      
      const xsd = `<xs:schema 
          xmlns:xs="http://www.w3.org/2001/XMLSchema"
          targetNamespace="http://example.com/test">
          
          <xs:complexType name="Base">
            <xs:sequence>
              <xs:element name="name" type="xs:string"/>
            </xs:sequence>
          </xs:complexType>
          
          <xs:complexType name="Derived">
            <xs:complexContent>
              <xs:extension base="Base">
                <xs:sequence>
                  <xs:element name="extra" type="xs:string"/>
                </xs:sequence>
              </xs:extension>
            </xs:complexContent>
          </xs:complexType>
          
          <xs:element name="root" type="Derived"/>
        </xs:schema>`;

      const { schemaData } = parseXsdToSchemaData(xsd);
      const derived = schemaData.elements['Derived'] as any;

      // Regular extension SHOULD have extends
      assert.equal(derived.extends, 'Base', 'Regular extension should have extends');
      
      // And should have its own field
      const extraField = derived.sequence?.find((f: any) => f.name === 'extra');
      assert.ok(extraField, 'Should have extra field');
    });
  });
});
