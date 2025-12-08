import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateInterfaces } from '../../src/codegen/interface-generator';

describe('Interface Generator', () => {
  // Simple schema with one complex type
  const simpleSchema = {
    $xmlns: { ns: 'http://example.com' },
    targetNamespace: 'http://example.com',
    element: [
      { name: 'person', type: 'ns:Person' },
    ],
    complexType: [
      {
        name: 'Person',
        attribute: [
          { name: 'id', type: 'xsd:string' },
          { name: 'age', type: 'xsd:int' },
        ],
      },
    ],
  } as const;

  it('should generate interface for simple complex type', () => {
    const output = generateInterfaces(simpleSchema, {
      rootElement: 'person',
    });
    
    assert.ok(output.includes('export interface Person'));
    assert.ok(output.includes('id?: string'));
    assert.ok(output.includes('age?: number'));
  });

  // Schema with inheritance
  const inheritanceSchema = {
    $xmlns: { ns: 'http://example.com' },
    targetNamespace: 'http://example.com',
    element: [
      { name: 'employee', type: 'ns:Employee' },
    ],
    complexType: [
      {
        name: 'Person',
        attribute: [
          { name: 'name', type: 'xsd:string' },
        ],
      },
      {
        name: 'Employee',
        complexContent: {
          extension: {
            base: 'Person',
            attribute: [
              { name: 'role', type: 'xsd:string' },
            ],
          },
        },
      },
    ],
  } as const;

  it('should generate interface with extends clause', () => {
    const output = generateInterfaces(inheritanceSchema, {
      rootElement: 'employee',
    });
    
    assert.ok(output.includes('export interface Person'));
    assert.ok(output.includes('export interface Employee extends Person'));
    assert.ok(output.includes('role?: string'));
  });

  // Schema with nested elements
  const nestedSchema = {
    $xmlns: { ns: 'http://example.com' },
    targetNamespace: 'http://example.com',
    element: [
      { name: 'order', type: 'ns:Order' },
    ],
    complexType: [
      {
        name: 'Item',
        attribute: [
          { name: 'sku', type: 'xsd:string' },
          { name: 'quantity', type: 'xsd:int' },
        ],
      },
      {
        name: 'Order',
        sequence: {
          element: [
            { name: 'items', type: 'ns:Item', minOccurs: '0', maxOccurs: 'unbounded' },
            { name: 'note', type: 'xsd:string', minOccurs: '0' },
          ],
        },
        attribute: [
          { name: 'orderId', type: 'xsd:string', use: 'required' },
        ],
      },
    ],
  } as const;

  it('should generate interface with array types', () => {
    const output = generateInterfaces(nestedSchema, {
      rootElement: 'order',
    });
    
    assert.ok(output.includes('export interface Item'));
    assert.ok(output.includes('export interface Order'));
    assert.ok(output.includes('items?: Item[]'));
    assert.ok(output.includes('note?: string'));
    assert.ok(output.includes('orderId: string')); // required
  });

  // Deep inheritance (4 levels) - the case that breaks TS type inference
  const deepSchema = {
    $xmlns: { l1: 'http://l1', l2: 'http://l2', l3: 'http://l3', l4: 'http://l4' },
    targetNamespace: 'http://l4',
    $imports: [
      {
        $xmlns: { l1: 'http://l1' },
        targetNamespace: 'http://l1',
        complexType: [
          { name: 'L1Base', attribute: [{ name: 'id', type: 'xsd:string' }] },
        ],
      },
      {
        $xmlns: { l1: 'http://l1', l2: 'http://l2' },
        targetNamespace: 'http://l2',
        complexType: [
          { name: 'L2Obj', complexContent: { extension: { base: 'l1:L1Base', attribute: [{ name: 'l2a', type: 'xsd:string' }] } } },
        ],
      },
      {
        $xmlns: { l1: 'http://l1', l2: 'http://l2', l3: 'http://l3' },
        targetNamespace: 'http://l3',
        complexType: [
          { name: 'Item', attribute: [{ name: 'itemType', type: 'xsd:string' }] },
          { name: 'L3Obj', complexContent: { extension: { base: 'l2:L2Obj', sequence: { element: [{ name: 'items', type: 'l3:Item', minOccurs: '0', maxOccurs: 'unbounded' }] } } } },
        ],
      },
    ],
    element: [
      { name: 'obj', type: 'l4:L4Obj' },
    ],
    complexType: [
      { name: 'L4Obj', complexContent: { extension: { base: 'l3:L3Obj', attribute: [{ name: 'l4a', type: 'xsd:string' }] } } },
    ],
  } as const;

  it('should generate interfaces for deep inheritance (4 levels)', () => {
    const output = generateInterfaces(deepSchema, {
      rootElement: 'obj',
    });
    
    // All levels should be generated
    assert.ok(output.includes('export interface L1Base'), 'Should have L1Base');
    assert.ok(output.includes('export interface L2Obj extends L1Base'), 'Should have L2Obj extends L1Base');
    assert.ok(output.includes('export interface L3Obj extends L2Obj'), 'Should have L3Obj extends L2Obj');
    assert.ok(output.includes('export interface L4Obj extends L3Obj'), 'Should have L4Obj extends L3Obj');
    
    // Properties should be present
    assert.ok(output.includes('id?: string'), 'L1Base should have id');
    assert.ok(output.includes('l2a?: string'), 'L2Obj should have l2a');
    assert.ok(output.includes('items?: Item[]'), 'L3Obj should have items array');
    assert.ok(output.includes('l4a?: string'), 'L4Obj should have l4a');
    
    // Item type should be generated
    assert.ok(output.includes('export interface Item'), 'Should have Item');
    assert.ok(output.includes('itemType?: string'), 'Item should have itemType');
  });

  it('should generate all types when generateAllTypes is true', () => {
    const output = generateInterfaces(simpleSchema, {
      generateAllTypes: true,
    });
    
    assert.ok(output.includes('export interface Person'));
  });

  // Schema with simpleType enum
  const enumSchema = {
    $xmlns: { ns: 'http://example.com' },
    targetNamespace: 'http://example.com',
    element: [
      { name: 'status', type: 'ns:StatusType' },
    ],
    simpleType: [
      {
        name: 'StatusType',
        restriction: {
          base: 'xsd:string',
          enumeration: [
            { value: 'active' },
            { value: 'inactive' },
            { value: 'pending' },
          ],
        },
      },
    ],
    complexType: [
      {
        name: 'Item',
        attribute: [
          { name: 'status', type: 'ns:StatusType' },
        ],
      },
    ],
  } as const;

  it('should generate type alias for simpleType enum', () => {
    const output = generateInterfaces(enumSchema, {
      generateAllTypes: true,
    });
    
    assert.ok(output.includes("export type StatusType = 'active' | 'inactive' | 'pending'"), 'Should have enum type');
    assert.ok(output.includes('export interface Item'), 'Should have Item interface');
    assert.ok(output.includes('status?: StatusType'), 'Should use StatusType');
  });

  // Schema with simpleContent (text with attributes)
  const simpleContentSchema = {
    $xmlns: { ns: 'http://example.com' },
    targetNamespace: 'http://example.com',
    element: [
      { name: 'price', type: 'ns:PriceType' },
    ],
    complexType: [
      {
        name: 'PriceType',
        simpleContent: {
          extension: {
            base: 'xsd:decimal',
            attribute: [
              { name: 'currency', type: 'xsd:string', use: 'required' },
            ],
          },
        },
      },
    ],
  } as const;

  it('should generate interface for simpleContent with $value', () => {
    const output = generateInterfaces(simpleContentSchema, {
      rootElement: 'price',
    });
    
    assert.ok(output.includes('export interface PriceType'), 'Should have PriceType');
    assert.ok(output.includes('$value: number'), 'Should have $value for text content');
    assert.ok(output.includes('currency: string'), 'Should have currency attribute');
  });

  // Schema with include (W3C standard)
  const baseIncludeSchema = {
    $xmlns: { base: 'http://base' },
    targetNamespace: 'http://base',
    complexType: [
      { name: 'BaseType', attribute: [{ name: 'id', type: 'xsd:string' }] },
    ],
  } as const;

  const mainIncludeSchema = {
    $xmlns: { base: 'http://base', main: 'http://main' },
    targetNamespace: 'http://main',
    include: [baseIncludeSchema],  // W3C include
    element: [
      { name: 'item', type: 'main:ItemType' },
    ],
    complexType: [
      {
        name: 'ItemType',
        complexContent: {
          extension: {
            base: 'base:BaseType',
            attribute: [{ name: 'name', type: 'xsd:string' }],
          },
        },
      },
    ],
  } as const;

  it('should resolve types from include schemas', () => {
    const output = generateInterfaces(mainIncludeSchema, {
      rootElement: 'item',
    });
    
    assert.ok(output.includes('export interface BaseType'), 'Should have BaseType from include');
    assert.ok(output.includes('export interface ItemType extends BaseType'), 'Should extend BaseType');
    assert.ok(output.includes('id?: string'), 'BaseType should have id');
    assert.ok(output.includes('name?: string'), 'ItemType should have name');
  });

  // Schema with group reference
  const groupSchema = {
    $xmlns: { ns: 'http://example.com' },
    targetNamespace: 'http://example.com',
    group: [
      {
        name: 'CommonFields',
        sequence: {
          element: [
            { name: 'createdAt', type: 'xsd:dateTime' },
            { name: 'updatedAt', type: 'xsd:dateTime' },
          ],
        },
      },
    ],
    element: [{ name: 'item', type: 'ns:ItemType' }],
    complexType: [
      {
        name: 'ItemType',
        sequence: {
          element: [{ name: 'name', type: 'xsd:string' }],
        },
        group: { ref: 'ns:CommonFields' },
      },
    ],
  } as const;

  it('should resolve group references', () => {
    const output = generateInterfaces(groupSchema, { rootElement: 'item' });
    
    assert.ok(output.includes('export interface ItemType'), 'Should have ItemType');
    assert.ok(output.includes('name: string'), 'Should have name');
    assert.ok(output.includes('createdAt: string'), 'Should have createdAt from group');
    assert.ok(output.includes('updatedAt: string'), 'Should have updatedAt from group');
  });

  // Schema with any element
  const anySchema = {
    $xmlns: { ns: 'http://example.com' },
    targetNamespace: 'http://example.com',
    element: [{ name: 'container', type: 'ns:ContainerType' }],
    complexType: [
      {
        name: 'ContainerType',
        sequence: {
          element: [{ name: 'header', type: 'xsd:string' }],
          any: [{ namespace: '##any', processContents: 'lax' }],
        },
      },
    ],
  } as const;

  it('should handle any wildcard element', () => {
    const output = generateInterfaces(anySchema, { rootElement: 'container' });
    
    assert.ok(output.includes('export interface ContainerType'), 'Should have ContainerType');
    assert.ok(output.includes('header: string'), 'Should have header');
    assert.ok(output.includes('[key: string]: unknown'), 'Should have index signature for any');
  });

  // BUG: Element reference should use the element's type, not derive type from element name
  // See: https://www.w3.org/TR/xmlschema11-1/#declare-element
  // When an element has ref="ns:elementName", the type should come from the referenced element's type attribute
  describe('Element reference type resolution', () => {
    // Schema where element has explicit type different from element name
    // This mimics SAP's templatelink.xsd where:
    //   <element name="templateLink" type="adtcomp:linkType"/>
    // The type is "linkType", NOT "TemplateLink" (derived from element name)
    const baseSchema = {
      $xmlns: { base: 'http://base.example.com' },
      targetNamespace: 'http://base.example.com',
      element: [
        { name: 'templateLink', type: 'base:LinkType' },  // Element name != type name
      ],
      complexType: [
        {
          name: 'LinkType',  // This is the actual type
          attribute: [
            { name: 'href', type: 'xsd:string', use: 'required' },
            { name: 'rel', type: 'xsd:string' },
          ],
        },
      ],
    } as const;

    const containerSchema = {
      $xmlns: { 
        base: 'http://base.example.com',
        container: 'http://container.example.com',
      },
      targetNamespace: 'http://container.example.com',
      $imports: [baseSchema],
      element: [
        { name: 'container', type: 'container:ContainerType' },
      ],
      complexType: [
        {
          name: 'ContainerType',
          sequence: {
            element: [
              // Reference to element, should use LinkType, not "TemplateLink"
              { ref: 'base:templateLink', minOccurs: '0', maxOccurs: 'unbounded' },
            ],
          },
        },
      ],
    } as const;

    it('should use element type (LinkType), not element name (TemplateLink)', () => {
      const output = generateInterfaces(containerSchema, {
        rootElement: 'container',
      });
      
      // Should generate LinkType interface
      assert.ok(output.includes('export interface LinkType'), 'Should have LinkType interface');
      assert.ok(output.includes('href: string'), 'LinkType should have href');
      assert.ok(output.includes('rel?: string'), 'LinkType should have rel');
      
      // Property should reference LinkType, NOT TemplateLink
      assert.ok(
        output.includes('templateLink?: LinkType[]'),
        'Property should use LinkType (the actual type), not TemplateLink (derived from element name)'
      );
      
      // Should NOT generate a "TemplateLink" type - that would be wrong
      assert.ok(
        !output.includes('export interface TemplateLink'),
        'Should NOT generate TemplateLink interface - type should be LinkType'
      );
    });

    // More complex case: nested imports (like discovery -> templatelinkExtended -> templatelink)
    // This is the actual SAP ADT scenario that fails
    const templatelinkSchema = {
      $xmlns: { adtcomp: 'http://www.sap.com/adt/compatibility' },
      targetNamespace: 'http://www.sap.com/adt/compatibility',
      element: [
        { name: 'templateLink', type: 'adtcomp:linkType' },  // Element name != type name
      ],
      complexType: [
        {
          name: 'linkType',  // lowercase - this is the actual type
          attribute: [
            { name: 'href', type: 'xsd:string' },
            { name: 'rel', type: 'xsd:string' },
            { name: 'type', type: 'xsd:string' },
            { name: 'template', type: 'xsd:string' },
          ],
        },
      ],
    } as const;

    const templatelinkExtendedSchema = {
      $xmlns: { adtcomp: 'http://www.sap.com/adt/compatibility' },
      targetNamespace: 'http://www.sap.com/adt/compatibility',
      $imports: [templatelinkSchema],  // includes templatelink.xsd
      element: [
        { name: 'templateLinks', type: 'adtcomp:templateLinksType' },
      ],
      complexType: [
        {
          name: 'templateLinksType',
          sequence: {
            element: [
              // Reference to templateLink element - should resolve to linkType
              { ref: 'adtcomp:templateLink', minOccurs: '0', maxOccurs: 'unbounded' },
            ],
          },
        },
      ],
    } as const;

    const discoverySchema = {
      $xmlns: { 
        app: 'http://www.w3.org/2007/app',
        adtcomp: 'http://www.sap.com/adt/compatibility',
      },
      targetNamespace: 'http://www.w3.org/2007/app',
      $imports: [templatelinkExtendedSchema],  // imports templatelinkExtended
      element: [
        { name: 'collection', type: 'app:CollectionType' },
      ],
      complexType: [
        {
          name: 'CollectionType',
          sequence: {
            element: [
              { ref: 'adtcomp:templateLinks', minOccurs: '0' },
            ],
          },
          attribute: [
            { name: 'href', type: 'xsd:string', use: 'required' },
          ],
        },
      ],
    } as const;

    it('should resolve element type through nested imports (SAP ADT scenario)', () => {
      const output = generateInterfaces(discoverySchema, {
        rootElement: 'collection',
      });
      
      // Should generate linkType interface (from templatelink.xsd)
      assert.ok(
        output.includes('export interface linkType') || output.includes('export interface LinkType'),
        'Should have linkType interface from nested import'
      );
      
      // templateLinksType should reference linkType, NOT TemplateLink
      // The property name is 'templateLink' (from element name), but type should be 'linkType'
      const hasCorrectType = output.includes('templateLink?: linkType[]') || 
                             output.includes('templateLink?: LinkType[]');
      const hasWrongType = output.includes('templateLink?: TemplateLink[]');
      
      if (hasWrongType && !hasCorrectType) {
        // This is the bug - type derived from element name instead of element's type attribute
        assert.fail(
          'BUG: templateLink property uses TemplateLink (derived from element name) ' +
          'instead of linkType (the actual type from the element declaration). ' +
          'Element ref should resolve to the referenced element\'s type attribute.'
        );
      }
      
      assert.ok(hasCorrectType, 'templateLink property should use linkType (the actual type)');
    });

    // Additional test: non-W3C attributes like ecore:name should be ignored
    const schemaWithEcoreName = {
      $xmlns: { ns: 'http://example.com', ecore: 'http://www.eclipse.org/emf/2002/Ecore' },
      targetNamespace: 'http://example.com',
      element: [
        { name: 'item', type: 'ns:ItemType' },
      ],
      complexType: [
        {
          name: 'ItemType',
          // ecore:name is an Eclipse EMF annotation, NOT part of W3C XSD spec
          // It should be completely ignored - type name comes from 'name' attribute only
          'ecore:name': 'EcoreItemType',  // This should be IGNORED
          attribute: [
            { name: 'id', type: 'xsd:string' },
          ],
        },
      ],
    } as const;

    it('should ignore ecore:name and use W3C name attribute only', () => {
      const output = generateInterfaces(schemaWithEcoreName, {
        rootElement: 'item',
      });
      
      // Should use 'name' attribute (ItemType), not 'ecore:name' (EcoreItemType)
      assert.ok(
        output.includes('export interface ItemType'),
        'Should use W3C name attribute (ItemType)'
      );
      assert.ok(
        !output.includes('EcoreItemType'),
        'Should NOT use ecore:name (EcoreItemType) - it is not part of W3C XSD spec'
      );
    });
  });

  // Substitution group test - abapGit pattern
  // asx:Schema is abstract, DEVC/CLAS/etc substitute for it
  describe('Substitution group type generation', () => {
    // Base schema with abstract element
    const asxSchema = {
      $xmlns: { asx: 'http://www.sap.com/abapxml', xs: 'http://www.w3.org/2001/XMLSchema' },
      targetNamespace: 'http://www.sap.com/abapxml',
      element: [
        { name: 'Schema', abstract: true },  // Abstract element
        { name: 'abap', type: 'asx:AbapType' },
      ],
      complexType: [
        {
          name: 'AbapValuesType',
          sequence: {
            element: [
              { ref: 'asx:Schema' },  // Reference to abstract element
            ],
          },
        },
        {
          name: 'AbapType',
          sequence: {
            element: [
              { name: 'values', type: 'asx:AbapValuesType' },
            ],
          },
          attribute: [
            { name: 'version', type: 'xs:string', default: '1.0' },
          ],
        },
      ],
    } as const;

    // DEVC schema that substitutes for asx:Schema
    const devcSchema = {
      $xmlns: { asx: 'http://www.sap.com/abapxml', xs: 'http://www.w3.org/2001/XMLSchema' },
      targetNamespace: 'http://www.sap.com/abapxml',
      $imports: [asxSchema],
      element: [
        { name: 'DEVC', type: 'DevcType', substitutionGroup: 'asx:Schema' },
      ],
      complexType: [
        {
          name: 'DevcType',
          all: {
            element: [
              { name: 'CTEXT', type: 'xs:string', minOccurs: '0' },
              { name: 'PARENTCL', type: 'xs:string', minOccurs: '0' },
            ],
          },
        },
      ],
    } as const;

    // abapGit envelope schema
    const abapgitSchema = {
      $xmlns: { asx: 'http://www.sap.com/abapxml', xs: 'http://www.w3.org/2001/XMLSchema' },
      targetNamespace: 'http://www.sap.com/abapxml',
      $imports: [asxSchema],
      element: [
        {
          name: 'abapGit',
          complexType: {
            sequence: {
              element: [
                { ref: 'asx:abap' },
              ],
            },
            attribute: [
              { name: 'version', type: 'xs:string', use: 'required' },
              { name: 'serializer', type: 'xs:string', use: 'required' },
              { name: 'serializer_version', type: 'xs:string', use: 'required' },
            ],
          },
        },
      ],
    } as const;

    it('should generate AbapValuesType with Schema property', () => {
      const output = generateInterfaces(asxSchema, {
        generateAllTypes: true,
      });
      
      assert.ok(output.includes('export interface AbapValuesType'), 'Should have AbapValuesType');
      assert.ok(output.includes('export interface AbapType'), 'Should have AbapType');
      // Schema is abstract - should still generate a property for it
      assert.ok(output.includes('Schema'), 'AbapValuesType should have Schema property');
    });

    it('should generate DevcType for substitution element', () => {
      const output = generateInterfaces(devcSchema, {
        generateAllTypes: true,
      });
      
      assert.ok(output.includes('export interface DevcType'), 'Should have DevcType');
      assert.ok(output.includes('CTEXT?: string'), 'DevcType should have CTEXT');
      assert.ok(output.includes('PARENTCL?: string'), 'DevcType should have PARENTCL');
    });

    it('should generate abapGit envelope type', () => {
      const output = generateInterfaces(abapgitSchema, {
        rootElement: 'abapGit',
      });
      
      // Should have the envelope type (inline complexType)
      assert.ok(output.includes('abap'), 'Should have abap property');
      assert.ok(output.includes('version'), 'Should have version attribute');
      assert.ok(output.includes('serializer'), 'Should have serializer attribute');
      assert.ok(output.includes('serializer_version'), 'Should have serializer_version attribute');
    });

    // The key test: when we have a concrete schema (DEVC) that substitutes asx:Schema,
    // the generated type for AbapValuesType should ideally use the concrete type
    // This is currently a limitation - AbapValuesType.Schema is typed as unknown/any
    // because the generator doesn't know which substitutes are available
    it('should handle substitution group in values type', () => {
      // Combined schema with both asx and devc
      const combinedSchema = {
        $xmlns: { asx: 'http://www.sap.com/abapxml', xs: 'http://www.w3.org/2001/XMLSchema' },
        targetNamespace: 'http://www.sap.com/abapxml',
        element: [
          { name: 'Schema', abstract: true },
          { name: 'DEVC', type: 'DevcType', substitutionGroup: 'asx:Schema' },
          { name: 'abap', type: 'asx:AbapType' },
        ],
        complexType: [
          {
            name: 'DevcType',
            all: {
              element: [
                { name: 'CTEXT', type: 'xs:string', minOccurs: '0' },
              ],
            },
          },
          {
            name: 'AbapValuesType',
            sequence: {
              element: [
                { ref: 'asx:Schema' },
              ],
            },
          },
          {
            name: 'AbapType',
            sequence: {
              element: [
                { name: 'values', type: 'asx:AbapValuesType' },
              ],
            },
          },
        ],
      } as const;

      const output = generateInterfaces(combinedSchema, {
        generateAllTypes: true,
      });
      
      console.log('Generated output:\n', output);
      
      // Schema property should be typed as DevcType (the substitute type)
      assert.ok(output.includes('export interface DevcType'), 'Should have DevcType');
      assert.ok(output.includes('export interface AbapValuesType'), 'Should have AbapValuesType');
      
      // Check if Schema property uses the substitute type
      const hasTypedSchema = output.includes('Schema: DevcType') || 
                             output.includes('Schema?: DevcType');
      
      assert.ok(hasTypedSchema, 'AbapValuesType.Schema should be typed as DevcType (the substitute type)');
    });
  });
});
