/**
 * ts-xsd Basic Tests
 */

import { describe, test as it } from 'node:test';
import { strict as assert } from 'node:assert';
import { parse, build, type XsdSchema, type InferXsd } from '../src/index';

// Test schema - Person with name, age, and id
const PersonSchema = {
  ns: 'http://example.com/person',
  prefix: 'per',
  root: 'Person',
  elements: {
    Person: {
      sequence: [
        { name: 'FirstName', type: 'string' },
        { name: 'LastName', type: 'string' },
        { name: 'Age', type: 'number', minOccurs: 0 },
      ],
      attributes: [
        { name: 'id', type: 'string', required: true },
      ],
    },
  },
} as const satisfies XsdSchema;

type Person = InferXsd<typeof PersonSchema>;

describe('ts-xsd', () => {
  describe('parse', () => {
    it('should parse XML to typed object', () => {
      const xml = `
        <per:Person xmlns:per="http://example.com/person" per:id="123">
          <per:FirstName>John</per:FirstName>
          <per:LastName>Doe</per:LastName>
          <per:Age>30</per:Age>
        </per:Person>
      `;

      const person = parse(PersonSchema, xml);

      assert.equal(person.id, '123');
      assert.equal(person.FirstName, 'John');
      assert.equal(person.LastName, 'Doe');
      assert.equal(person.Age, 30);
    });

    it('should handle optional fields', () => {
      const xml = `
        <per:Person xmlns:per="http://example.com/person" per:id="456">
          <per:FirstName>Jane</per:FirstName>
          <per:LastName>Smith</per:LastName>
        </per:Person>
      `;

      const person = parse(PersonSchema, xml);

      assert.equal(person.id, '456');
      assert.equal(person.FirstName, 'Jane');
      assert.equal(person.LastName, 'Smith');
      assert.equal(person.Age, undefined);
    });

    it('should parse without namespace prefix', () => {
      const SimpleSchema = {
        root: 'Item',
        elements: {
          Item: {
            sequence: [
              { name: 'name', type: 'string' },
            ],
            attributes: [
              { name: 'id', type: 'string', required: true },
            ],
          },
        },
      } as const satisfies XsdSchema;

      const xml = `<Item id="1"><name>Test</name></Item>`;
      const item = parse(SimpleSchema, xml);

      assert.equal(item.id, '1');
      assert.equal(item.name, 'Test');
    });
  });

  describe('build', () => {
    it('should build XML from typed object', () => {
      const person: Person = {
        id: '789',
        FirstName: 'Alice',
        LastName: 'Wonder',
        Age: 25,
      };

      const xml = build(PersonSchema, person);

      assert.ok(xml.includes('per:Person'));
      assert.ok(xml.includes('per:id="789"'));
      assert.ok(xml.includes('<per:FirstName>Alice</per:FirstName>'));
      assert.ok(xml.includes('<per:LastName>Wonder</per:LastName>'));
      assert.ok(xml.includes('<per:Age>25</per:Age>'));
    });

    it('should handle optional fields in build', () => {
      const person: Person = {
        id: '999',
        FirstName: 'Bob',
        LastName: 'Builder',
        Age: undefined,
      };

      const xml = build(PersonSchema, person);

      assert.ok(xml.includes('per:FirstName'));
      assert.ok(xml.includes('per:LastName'));
      assert.ok(!xml.includes('per:Age'));
    });

    it('should include XML declaration by default', () => {
      const person: Person = {
        id: '1',
        FirstName: 'Test',
        LastName: 'User',
        Age: undefined,
      };

      const xml = build(PersonSchema, person);
      assert.ok(xml.startsWith('<?xml version="1.0"'));
    });

    it('should omit XML declaration when disabled', () => {
      const person: Person = {
        id: '1',
        FirstName: 'Test',
        LastName: 'User',
        Age: undefined,
      };

      const xml = build(PersonSchema, person, { xmlDecl: false });
      assert.ok(!xml.startsWith('<?xml'));
    });
  });

  describe('round-trip', () => {
    it('should round-trip data correctly', () => {
      const original: Person = {
        id: 'round-trip-test',
        FirstName: 'Round',
        LastName: 'Trip',
        Age: 42,
      };

      const xml = build(PersonSchema, original);
      const parsed = parse(PersonSchema, xml);

      assert.equal(parsed.id, original.id);
      assert.equal(parsed.FirstName, original.FirstName);
      assert.equal(parsed.LastName, original.LastName);
      assert.equal(parsed.Age, original.Age);
    });
  });

  describe('nested elements', () => {
    const OrderSchema = {
      root: 'Order',
      elements: {
        Order: {
          sequence: [
            { name: 'items', type: 'Items' },
          ],
          attributes: [
            { name: 'id', type: 'string', required: true },
          ],
        },
        Items: {
          sequence: [
            { name: 'item', type: 'Item', maxOccurs: 'unbounded' },
          ],
        },
        Item: {
          sequence: [
            { name: 'name', type: 'string' },
            { name: 'price', type: 'number' },
          ],
        },
      },
    } as const satisfies XsdSchema;

    type Order = InferXsd<typeof OrderSchema>;

    it('should parse nested elements', () => {
      const xml = `
        <Order id="order-1">
          <items>
            <item><name>Apple</name><price>1.5</price></item>
            <item><name>Banana</name><price>0.75</price></item>
          </items>
        </Order>
      `;

      const order = parse(OrderSchema, xml);

      assert.equal(order.id, 'order-1');
      assert.equal(order.items.item.length, 2);
      assert.equal(order.items.item[0].name, 'Apple');
      assert.equal(order.items.item[0].price, 1.5);
      assert.equal(order.items.item[1].name, 'Banana');
    });

    it('should build nested elements', () => {
      const order: Order = {
        id: 'order-2',
        items: {
          item: [
            { name: 'Orange', price: 2.0 },
            { name: 'Grape', price: 3.5 },
          ],
        },
      };

      const xml = build(OrderSchema, order);

      assert.ok(xml.includes('<item>'));
      assert.ok(xml.includes('<name>Orange</name>'));
      assert.ok(xml.includes('<price>2</price>'));
    });
  });

  describe('type inference', () => {
    it('should infer correct types', () => {
      // This is a compile-time test - if it compiles, types are correct
      const person: Person = {
        id: 'type-test',
        FirstName: 'Type',
        LastName: 'Test',
        Age: 100,
      };

      // These should all be correctly typed
      const id: string = person.id;
      const firstName: string = person.FirstName;
      const lastName: string = person.LastName;
      const age: number | undefined = person.Age;

      assert.ok(id);
      assert.ok(firstName);
      assert.ok(lastName);
      assert.ok(age !== undefined);
    });
  });

  describe('cross-namespace element references', () => {
    // This tests the fix for element references from imported schemas
    // When XSD uses ref="atom:link", codegen generates type: 'Link'
    // but the actual type in atom.xsd is 'linkType'
    // The parser should create aliases to handle this mismatch
    
    const AtomSchema = {
      ns: 'http://www.w3.org/2005/Atom',
      prefix: 'atom',
      root: 'linkType',  // Note: root is 'linkType', not 'Link'
      elements: {
        linkType: {
          attributes: [
            { name: 'href', type: 'string', required: true },
            { name: 'rel', type: 'string' },
            { name: 'type', type: 'string' },
          ],
        },
      },
    } as const satisfies XsdSchema;

    const ConfigurationSchema = {
      ns: 'http://www.sap.com/adt/configuration',
      prefix: 'config',
      root: 'Configuration',
      include: [AtomSchema],
      elements: {
        Configuration: {
          sequence: [
            { name: 'link', type: 'Link', minOccurs: 0 },  // Note: type is 'Link', not 'linkType'
          ],
          attributes: [
            { name: 'client', type: 'string' },
          ],
        },
      },
    } as const satisfies XsdSchema;

    it('should parse cross-namespace element references', () => {
      const xml = `
        <config:Configuration xmlns:config="http://www.sap.com/adt/configuration" config:client="200">
          <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="/path/to/resource" rel="self" type="application/xml"/>
        </config:Configuration>
      `;

      const config = parse(ConfigurationSchema, xml) as any;

      assert.equal(config.client, '200');
      assert.ok(config.link, 'link should be parsed');
      assert.equal(config.link.href, '/path/to/resource');
      assert.equal(config.link.rel, 'self');
      assert.equal(config.link.type, 'application/xml');
    });

    it('should handle linkType alias for Link', () => {
      // Test that 'Link' is aliased to 'linkType' when root ends with 'Type'
      const ConfigurationsSchema = {
        ns: 'http://www.sap.com/adt/configurations',
        root: 'Configurations',
        include: [AtomSchema, ConfigurationSchema],
        elements: {
          Configurations: {
            sequence: [
              { name: 'configuration', type: 'Configuration', maxOccurs: 'unbounded' },
            ],
          },
        },
      } as const satisfies XsdSchema;

      const xml = `
        <configurations:configurations xmlns:configurations="http://www.sap.com/adt/configurations">
          <configuration:configuration xmlns:configuration="http://www.sap.com/adt/configuration" configuration:client="100">
            <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="/config/1" rel="self" type="application/xml"/>
          </configuration:configuration>
        </configurations:configurations>
      `;

      const configs = parse(ConfigurationsSchema, xml) as any;

      assert.ok(configs.configuration, 'configuration should be parsed');
      assert.equal(configs.configuration.length, 1);
      assert.equal(configs.configuration[0].client, '100');
      assert.ok(configs.configuration[0].link, 'link should be parsed');
      assert.equal(configs.configuration[0].link.href, '/config/1');
    });
  });

  describe('maxOccurs cardinality', () => {
    // Schema with explicit maxOccurs="1" - should NOT be an array
    const ConfigSchema = {
      root: 'Configuration',
      elements: {
        Configuration: {
          sequence: [
            { name: 'name', type: 'string' },
            { name: 'link', type: 'Link', minOccurs: 0, maxOccurs: 1 },  // explicit maxOccurs=1
          ],
        },
        Link: {
          attributes: [
            { name: 'href', type: 'string', required: true },
            { name: 'rel', type: 'string' },
          ],
        },
      },
    } as const satisfies XsdSchema;

    type Config = InferXsd<typeof ConfigSchema>;

    it('should parse maxOccurs=1 as single element, not array', () => {
      const xml = `
        <Configuration>
          <name>Test Config</name>
          <link href="http://example.com" rel="self"/>
        </Configuration>
      `;

      const config = parse(ConfigSchema, xml);

      assert.equal(config.name, 'Test Config');
      // link should be a single object, not an array
      assert.equal(typeof config.link, 'object');
      assert.ok(!Array.isArray(config.link), 'link should NOT be an array when maxOccurs=1');
      assert.equal(config.link?.href, 'http://example.com');
      assert.equal(config.link?.rel, 'self');
    });

    it('should build maxOccurs=1 as single element', () => {
      const config: Config = {
        name: 'Build Test',
        link: { href: 'http://build.com', rel: 'self' },
      };

      const xml = build(ConfigSchema, config);

      // Should contain single link element, not wrapped in array
      assert.ok(xml.includes('<name>Build Test</name>'));
      assert.ok(xml.includes('href="http://build.com"'));
      assert.ok(xml.includes('rel="self"'));
      // Verify it's a single element (no duplicate link tags)
      const linkCount = (xml.match(/<link/g) || []).length;
      assert.equal(linkCount, 1, 'Should have exactly one link element');
    });

    it('should round-trip maxOccurs=1 correctly', () => {
      const original: Config = {
        name: 'Round Trip',
        link: { href: 'http://roundtrip.com', rel: 'alternate' },
      };

      const xml = build(ConfigSchema, original);
      const parsed = parse(ConfigSchema, xml);

      assert.equal(parsed.name, original.name);
      assert.equal(parsed.link?.href, original.link?.href);
      assert.equal(parsed.link?.rel, original.link?.rel);
    });

    it('should infer maxOccurs=1 as single element type', () => {
      // Compile-time type check: link should be Link | undefined, NOT Link[]
      const config: Config = {
        name: 'Type Test',
        link: { href: 'http://test.com', rel: 'alternate' },  // single object, not array
      };

      // This should compile - link is optional single object
      const href: string | undefined = config.link?.href;
      assert.equal(href, 'http://test.com');
    });

    // Schema with maxOccurs > 1 - SHOULD be an array
    const MultiLinkSchema = {
      root: 'Entry',
      elements: {
        Entry: {
          sequence: [
            { name: 'link', type: 'Link', minOccurs: 0, maxOccurs: 5 },  // explicit maxOccurs > 1
          ],
        },
        Link: {
          attributes: [
            { name: 'href', type: 'string', required: true },
          ],
        },
      },
    } as const satisfies XsdSchema;

    type Entry = InferXsd<typeof MultiLinkSchema>;

    it('should parse maxOccurs > 1 as array', () => {
      const xml = `
        <Entry>
          <link href="http://one.com"/>
          <link href="http://two.com"/>
        </Entry>
      `;

      const entry = parse(MultiLinkSchema, xml);

      assert.ok(Array.isArray(entry.link), 'link should be an array when maxOccurs > 1');
      assert.equal(entry.link.length, 2);
      assert.equal(entry.link[0].href, 'http://one.com');
      assert.equal(entry.link[1].href, 'http://two.com');
    });

    it('should infer maxOccurs > 1 as array type', () => {
      // Compile-time type check: link should be Link[]
      const entry: Entry = {
        link: [
          { href: 'http://a.com' },
          { href: 'http://b.com' },
        ],
      };

      // This should compile - link is an array
      const firstHref: string | undefined = entry.link[0]?.href;
      assert.equal(firstHref, 'http://a.com');
    });
  });

  describe('extends (type inheritance)', () => {
    // Base type with common fields
    const BaseSchema = {
      root: 'Base',
      elements: {
        Base: {
          sequence: [
            { name: 'name', type: 'string' },
            { name: 'description', type: 'string', minOccurs: 0 },
          ],
          attributes: [
            { name: 'id', type: 'string', required: true },
            { name: 'version', type: 'number' },
          ],
        },
      },
    } as const satisfies XsdSchema;

    // Derived type that extends Base
    const DerivedSchema = {
      root: 'Derived',
      include: [BaseSchema],
      elements: {
        Derived: {
          extends: 'Base',
          sequence: [
            { name: 'extra', type: 'string' },
          ],
          attributes: [
            { name: 'category', type: 'string' },
          ],
        },
      },
    } as const satisfies XsdSchema;

    type Derived = InferXsd<typeof DerivedSchema>;

    it('should parse inherited attributes', () => {
      const xml = `
        <Derived id="123" version="1" category="test">
          <name>Test Name</name>
          <description>Test Description</description>
          <extra>Extra Value</extra>
        </Derived>
      `;

      const derived = parse(DerivedSchema, xml);

      // Inherited attributes from Base
      assert.equal(derived.id, '123');
      assert.equal(derived.version, 1);
      // Own attribute
      assert.equal(derived.category, 'test');
    });

    it('should parse inherited sequence fields', () => {
      const xml = `
        <Derived id="456" category="cat">
          <name>Inherited Name</name>
          <extra>Own Field</extra>
        </Derived>
      `;

      const derived = parse(DerivedSchema, xml);

      // Inherited sequence from Base
      assert.equal(derived.name, 'Inherited Name');
      assert.equal(derived.description, undefined);
      // Own sequence
      assert.equal(derived.extra, 'Own Field');
    });

    it('should build with inherited fields', () => {
      const derived: Derived = {
        id: '789',
        version: 2,
        category: 'build-test',
        name: 'Build Name',
        description: 'Build Desc',
        extra: 'Build Extra',
      };

      const xml = build(DerivedSchema, derived);

      // Should include inherited attributes
      assert.ok(xml.includes('id="789"'));
      assert.ok(xml.includes('version="2"'));
      // Should include own attributes
      assert.ok(xml.includes('category="build-test"'));
      // Should include inherited sequence
      assert.ok(xml.includes('<name>Build Name</name>'));
      assert.ok(xml.includes('<description>Build Desc</description>'));
      // Should include own sequence
      assert.ok(xml.includes('<extra>Build Extra</extra>'));
    });

    it('should round-trip with inheritance', () => {
      const original: Derived = {
        id: 'round-trip',
        version: 3,
        category: 'rt-cat',
        name: 'RT Name',
        description: 'RT Desc',
        extra: 'RT Extra',
      };

      const xml = build(DerivedSchema, original);
      const parsed = parse(DerivedSchema, xml);

      assert.equal(parsed.id, original.id);
      assert.equal(parsed.version, original.version);
      assert.equal(parsed.category, original.category);
      assert.equal(parsed.name, original.name);
      assert.equal(parsed.description, original.description);
      assert.equal(parsed.extra, original.extra);
    });

    // Multi-level inheritance: GrandChild -> Child -> Base
    const ChildSchema = {
      root: 'Child',
      include: [BaseSchema],
      elements: {
        Child: {
          extends: 'Base',
          sequence: [
            { name: 'childField', type: 'string' },
          ],
        },
      },
    } as const satisfies XsdSchema;

    const GrandChildSchema = {
      root: 'GrandChild',
      include: [BaseSchema, ChildSchema],
      elements: {
        GrandChild: {
          extends: 'Child',
          sequence: [
            { name: 'grandChildField', type: 'string' },
          ],
        },
      },
    } as const satisfies XsdSchema;

    it('should handle multi-level inheritance', () => {
      const xml = `
        <GrandChild id="gc-1" version="1">
          <name>GC Name</name>
          <childField>Child Value</childField>
          <grandChildField>GrandChild Value</grandChildField>
        </GrandChild>
      `;

      const gc = parse(GrandChildSchema, xml) as any;

      // From Base
      assert.equal(gc.id, 'gc-1');
      assert.equal(gc.version, 1);
      assert.equal(gc.name, 'GC Name');
      // From Child
      assert.equal(gc.childField, 'Child Value');
      // Own
      assert.equal(gc.grandChildField, 'GrandChild Value');
    });

    it('should infer types from inherited fields', () => {
      // Compile-time type check: Derived should have all fields from Base + own
      const derived: Derived = {
        id: 'type-test',      // from Base (required)
        version: 1,           // from Base (optional)
        name: 'Name',         // from Base sequence
        description: 'Desc',  // from Base sequence (optional)
        category: 'cat',      // own attribute
        extra: 'extra',       // own sequence
      };

      // These should all be correctly typed
      const id: string = derived.id;
      const version: number | undefined = derived.version;
      const name: string = derived.name;
      const category: string | undefined = derived.category;
      const extra: string = derived.extra;

      assert.ok(id);
      assert.ok(name);
      assert.ok(extra);
    });
  });
});
