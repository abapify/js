/**
 * xs:all and substitutionGroup Tests
 * 
 * Tests for:
 * 1. xs:all - unordered elements (all must appear, order doesn't matter)
 * 2. substitutionGroup - element substitution
 * 3. abstract elements
 */

import { describe, test as it } from 'node:test';
import { strict as assert } from 'node:assert';
import { parse, build, type XsdSchema, type InferXsd } from '../../src/index';
import { parseXsdToSchemaData } from '../../src/codegen/index';

describe('xs:all', () => {
  // Schema with xs:all (unordered elements)
  const PersonSchema = {
    element: [
      { name: 'Person', type: 'PersonType' },
    ],
    complexType: {
      PersonType: {
        all: [
          { name: 'FirstName', type: 'string' },
          { name: 'LastName', type: 'string' },
          { name: 'Age', type: 'int', minOccurs: 0 },
        ],
      },
    },
  } as const satisfies XsdSchema;

  describe('type inference', () => {
    it('should infer types from xs:all fields', () => {
      type Person = InferXsd<typeof PersonSchema>;
      
      // Type check - this should compile
      const person: Person = {
        FirstName: 'John',
        LastName: 'Doe',
        Age: 30,
      };
      
      assert.equal(person.FirstName, 'John');
      assert.equal(person.LastName, 'Doe');
      assert.equal(person.Age, 30);
    });

    it('should make minOccurs:0 fields optional', () => {
      type Person = InferXsd<typeof PersonSchema>;
      
      // Age is optional (minOccurs: 0)
      const person: Person = {
        FirstName: 'Jane',
        LastName: 'Doe',
        // Age is omitted - should be valid
      };
      
      assert.equal(person.FirstName, 'Jane');
      assert.equal(person.Age, undefined);
    });
  });

  describe('parse', () => {
    it('should parse XML with elements in any order', () => {
      // Elements in different order than schema definition
      const xml = `<Person>
        <LastName>Doe</LastName>
        <Age>25</Age>
        <FirstName>John</FirstName>
      </Person>`;
      
      const result = parse(PersonSchema, xml);
      
      assert.equal(result.FirstName, 'John');
      assert.equal(result.LastName, 'Doe');
      assert.equal(result.Age, 25);
    });

    it('should handle missing optional elements', () => {
      const xml = `<Person>
        <FirstName>Jane</FirstName>
        <LastName>Doe</LastName>
      </Person>`;
      
      const result = parse(PersonSchema, xml);
      
      assert.equal(result.FirstName, 'Jane');
      assert.equal(result.LastName, 'Doe');
      assert.equal(result.Age, undefined);
    });
  });

  describe('build', () => {
    it('should build XML from data', () => {
      const data = {
        FirstName: 'John',
        LastName: 'Doe',
        Age: 30,
      };
      
      const xml = build(PersonSchema, data, { xmlDecl: false });
      
      assert.ok(xml.includes('<FirstName>John</FirstName>'));
      assert.ok(xml.includes('<LastName>Doe</LastName>'));
      assert.ok(xml.includes('<Age>30</Age>'));
    });

    it('should omit undefined optional fields', () => {
      const data = {
        FirstName: 'Jane',
        LastName: 'Doe',
      };
      
      const xml = build(PersonSchema, data, { xmlDecl: false });
      
      assert.ok(xml.includes('<FirstName>Jane</FirstName>'));
      assert.ok(xml.includes('<LastName>Doe</LastName>'));
      assert.ok(!xml.includes('<Age>'));
    });
  });

  describe('roundtrip', () => {
    it('should roundtrip data through parse and build', () => {
      const original = {
        FirstName: 'John',
        LastName: 'Doe',
        Age: 42,
      };
      
      const xml = build(PersonSchema, original, { xmlDecl: false });
      const parsed = parse(PersonSchema, xml);
      
      assert.deepEqual(parsed, original);
    });
  });
});

describe('substitutionGroup', () => {
  // Schema with abstract element and substitution group
  const ShapeSchema = {
    element: [
      { name: 'Shape', type: 'ShapeType', abstract: true },
      { name: 'Circle', type: 'CircleType', substitutionGroup: 'Shape' },
      { name: 'Rectangle', type: 'RectangleType', substitutionGroup: 'Shape' },
    ],
    complexType: {
      ShapeType: {
        sequence: [
          { name: 'color', type: 'string' },
        ],
      },
      CircleType: {
        extends: 'ShapeType',
        sequence: [
          { name: 'radius', type: 'int' },
        ],
      },
      RectangleType: {
        extends: 'ShapeType',
        sequence: [
          { name: 'width', type: 'int' },
          { name: 'height', type: 'int' },
        ],
      },
    },
  } as const satisfies XsdSchema;

  describe('element declarations', () => {
    it('should have abstract property on element', () => {
      const shapeEl = ShapeSchema.element.find(e => e.name === 'Shape');
      assert.equal(shapeEl?.abstract, true);
    });

    it('should have substitutionGroup property on element', () => {
      const circleEl = ShapeSchema.element.find(e => e.name === 'Circle');
      assert.equal(circleEl?.substitutionGroup, 'Shape');
    });
  });

  describe('parse concrete elements', () => {
    it('should parse Circle element', () => {
      const xml = `<Circle>
        <color>red</color>
        <radius>10</radius>
      </Circle>`;
      
      const result = parse(ShapeSchema, xml) as any;
      
      assert.equal(result.color, 'red');
      assert.equal(result.radius, 10);
    });

    it('should parse Rectangle element', () => {
      const xml = `<Rectangle>
        <color>blue</color>
        <width>100</width>
        <height>50</height>
      </Rectangle>`;
      
      const result = parse(ShapeSchema, xml) as any;
      
      assert.equal(result.color, 'blue');
      assert.equal(result.width, 100);
      assert.equal(result.height, 50);
    });
  });

  describe('build concrete elements', () => {
    it('should build Circle element', () => {
      const data = {
        color: 'green',
        radius: 15,
      };
      
      const xml = build(ShapeSchema, data, { xmlDecl: false, elementName: 'Circle' });
      
      assert.ok(xml.includes('<Circle>'));
      assert.ok(xml.includes('<color>green</color>'));
      assert.ok(xml.includes('<radius>15</radius>'));
    });
  });
});

describe('xs:all with attributes', () => {
  const ConfigSchema = {
    element: [
      { name: 'Config', type: 'ConfigType' },
    ],
    complexType: {
      ConfigType: {
        all: [
          { name: 'Name', type: 'string' },
          { name: 'Value', type: 'string' },
        ],
        attributes: [
          { name: 'id', type: 'string', required: true },
          { name: 'enabled', type: 'boolean' },
        ],
      },
    },
  } as const satisfies XsdSchema;

  it('should parse xs:all with attributes', () => {
    const xml = `<Config id="cfg1" enabled="true">
      <Value>test-value</Value>
      <Name>test-name</Name>
    </Config>`;
    
    const result = parse(ConfigSchema, xml);
    
    assert.equal(result.id, 'cfg1');
    assert.equal(result.enabled, true);
    assert.equal(result.Name, 'test-name');
    assert.equal(result.Value, 'test-value');
  });

  it('should build xs:all with attributes', () => {
    const data = {
      id: 'cfg2',
      enabled: false,
      Name: 'my-config',
      Value: 'my-value',
    };
    
    const xml = build(ConfigSchema, data, { xmlDecl: false });
    
    assert.ok(xml.includes('id="cfg2"'));
    assert.ok(xml.includes('enabled="false"'));
    assert.ok(xml.includes('<Name>my-config</Name>'));
    assert.ok(xml.includes('<Value>my-value</Value>'));
  });
});

describe('codegen - xs:all', () => {
  it('should parse xs:all from XSD', () => {
    const xsd = `<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
      <xs:element name="Person" type="PersonType"/>
      <xs:complexType name="PersonType">
        <xs:all>
          <xs:element name="FirstName" type="xs:string"/>
          <xs:element name="LastName" type="xs:string"/>
          <xs:element name="Age" type="xs:int" minOccurs="0"/>
        </xs:all>
      </xs:complexType>
    </xs:schema>`;

    const { schemaData } = parseXsdToSchemaData(xsd);

    // Should have PersonType with 'all' field
    const personType = schemaData.complexType?.['PersonType'] as any;
    assert.ok(personType, 'Should have PersonType');
    assert.ok(personType.all, 'Should have all field');
    assert.equal(personType.all.length, 3);
    
    // Check field names
    const fieldNames = personType.all.map((f: any) => f.name);
    assert.ok(fieldNames.includes('FirstName'));
    assert.ok(fieldNames.includes('LastName'));
    assert.ok(fieldNames.includes('Age'));
  });
});

describe('codegen - substitutionGroup', () => {
  it('should parse abstract and substitutionGroup from XSD', () => {
    const xsd = `<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"
                           xmlns:asx="http://www.sap.com/abapxml">
      <xs:element name="Schema" type="xs:anyType" abstract="true"/>
      <xs:element name="VSEOCLASS" type="VseoClassType" substitutionGroup="asx:Schema"/>
      <xs:complexType name="VseoClassType">
        <xs:all>
          <xs:element name="CLSNAME" type="xs:string"/>
        </xs:all>
      </xs:complexType>
    </xs:schema>`;

    const { schemaData } = parseXsdToSchemaData(xsd);

    // Check abstract element
    const schemaEl = schemaData.element.find(e => e.name === 'Schema');
    assert.ok(schemaEl, 'Should have Schema element');
    assert.equal((schemaEl as any).abstract, true, 'Schema should be abstract');

    // Check substitutionGroup element
    const vseoEl = schemaData.element.find(e => e.name === 'VSEOCLASS');
    assert.ok(vseoEl, 'Should have VSEOCLASS element');
    assert.equal((vseoEl as any).substitutionGroup, 'Schema', 'Should have substitutionGroup');
  });
});
