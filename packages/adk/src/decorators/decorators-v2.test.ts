import { describe, it, expect } from 'vitest';
import {
  xml as xmlDecorator,
  root,
  namespace,
  name,
  element,
  attributes,
  parent,
  toXML,
  registerNamespace,
  createNamespace,
  $attributes,
} from './decorators-v2';

// Register test namespaces directly in tests
registerNamespace('test', 'http://test.example.com/v1');
registerNamespace('intf', 'http://www.sap.com/adt/oo/interfaces');
registerNamespace('adtcore', 'http://www.sap.com/adt/core');
registerNamespace('abapoo', 'http://www.sap.com/adt/oo');
registerNamespace('atom', 'http://www.w3.org/2005/Atom');

describe('ADK Decorators v2 - Spec Compliance', () => {
  describe('@xml class decorator', () => {
    it('should enable XML serialization for class', () => {
      @xmlDecorator()
      class TestDocument {
        @root
        data: any;
      }

      const instance = new TestDocument();
      instance.data = { test: 'value' };

      // Should not throw - @xml decorator enables toXML()
      expect(() => toXML(instance)).not.toThrow();
    });

    it('should throw error for classes without @xml decorator', () => {
      class TestDocument {
        @root
        data: any;
      }

      const instance = new TestDocument();
      instance.data = { test: 'value' };

      expect(() => toXML(instance)).toThrow(
        "Class 'TestDocument' must have @xml decorator to use toXML()"
      );
    });
  });

  describe('@root decorator', () => {
    it('should create root element with property name', () => {
      @xmlDecorator()
      class TestDocument {
        @root
        myRoot: any;
      }

      const instance = new TestDocument();
      instance.myRoot = {};

      const xml = toXML(instance);
      expect(xml).toHaveProperty('myRoot');
    });

    it('should create root element with namespace', () => {
      @xmlDecorator()
      class TestDocument {
        @root
        @namespace('test')
        myRoot: any;
      }

      const instance = new TestDocument();
      instance.myRoot = {};

      const xml = toXML(instance);
      expect(xml).toHaveProperty('test:myRoot');
    });

    it('should create root element with custom name', () => {
      @xmlDecorator()
      class TestDocument {
        @root
        @name('customRoot')
        uglyPropertyName: any;
      }

      const instance = new TestDocument();
      instance.uglyPropertyName = {};

      const xml = toXML(instance);
      expect(xml).toHaveProperty('customRoot');
    });

    it('should throw error for multiple @root decorators', () => {
      expect(() => {
        @xmlDecorator()
        class TestDocument {
          @root
          first: any;

          @root // This should throw
          second: any;
        }
      }).toThrow(/Multiple @root decorators found/);
    });

    it('should throw error for missing @root decorator', () => {
      @xmlDecorator()
      class TestDocument {
        @element
        notRoot: any;
      }

      const instance = new TestDocument();
      instance.notRoot = {};

      expect(() => toXML(instance)).toThrow(
        "Class 'TestDocument' must have exactly one @root property"
      );
    });
  });

  describe('@namespace decorator', () => {
    it('should add namespace to element name', () => {
      @xmlDecorator()
      class TestDocument {
        @root
        @namespace('intf')
        interface: any;
      }

      const instance = new TestDocument();
      instance.interface = {};

      const xml = toXML(instance);
      expect(xml).toHaveProperty('intf:interface');
    });

    it('should add xmlns declaration to root element', () => {
      @xmlDecorator()
      class TestDocument {
        @root
        @namespace('intf')
        interface: any;
      }

      const instance = new TestDocument();
      instance.interface = {};

      const xml = toXML(instance);
      const content = xml['intf:interface'];
      expect(content).toHaveProperty(
        '@_xmlns:intf',
        'http://www.sap.com/adt/oo/interfaces'
      );
    });
  });

  describe('@name decorator', () => {
    it('should override property name for XML element', () => {
      @xmlDecorator()
      class TestDocument {
        @root
        @name('abapInterface')
        interface: any;
      }

      const instance = new TestDocument();
      instance.interface = {};

      const xml = toXML(instance);
      expect(xml).toHaveProperty('abapInterface');
      expect(xml).not.toHaveProperty('interface');
    });

    it('should work with namespace', () => {
      @xmlDecorator()
      class TestDocument {
        @root
        @namespace('intf')
        @name('abapInterface')
        interface: any;
      }

      const instance = new TestDocument();
      instance.interface = {};

      const xml = toXML(instance);
      expect(xml).toHaveProperty('intf:abapInterface');
    });
  });

  describe('@attributes decorator', () => {
    it('should convert object properties to XML attributes', () => {
      @xmlDecorator()
      class TestDocument {
        @root
        @namespace('intf')
        interface: any;

        @parent('intf:interface')
        @namespace('adtcore')
        @attributes
        core: any;
      }

      const instance = new TestDocument();
      instance.interface = {};
      instance.core = {
        name: 'ZIF_TEST',
        type: 'INTF/OI',
        version: 'inactive',
      };

      const xml = toXML(instance);
      const content = xml['intf:interface'];

      expect(content).toHaveProperty('@_adtcore:name', 'ZIF_TEST');
      expect(content).toHaveProperty('@_adtcore:type', 'INTF/OI');
      expect(content).toHaveProperty('@_adtcore:version', 'inactive');
    });

    it('should handle boolean values correctly', () => {
      @xmlDecorator()
      class TestDocument {
        @root
        root: any;

        @parent('root')
        @namespace('test')
        @attributes
        flags: any;
      }

      const instance = new TestDocument();
      instance.root = {};
      instance.flags = {
        enabled: true,
        disabled: false,
      };

      const xml = toXML(instance);
      const content = xml['root'];

      expect(content).toHaveProperty('@_test:enabled', 'true');
      expect(content).toHaveProperty('@_test:disabled', 'false');
    });
  });

  describe('@element decorator', () => {
    it('should create child elements', () => {
      @xmlDecorator()
      class TestDocument {
        @root
        @namespace('intf')
        interface: any;

        @parent('intf:interface')
        @namespace('adtcore')
        @element
        @name('packageRef')
        packageReference: any;
      }

      const instance = new TestDocument();
      instance.interface = {};
      instance.packageReference = {
        name: 'TEST_PACKAGE',
        type: 'DEVC/K',
      };

      const xml = toXML(instance);
      const content = xml['intf:interface'];

      expect(content).toHaveProperty('adtcore:packageRef');
      expect(content['adtcore:packageRef']).toHaveProperty(
        'name',
        'TEST_PACKAGE'
      );
      expect(content['adtcore:packageRef']).toHaveProperty('type', 'DEVC/K');
    });

    it('should handle arrays as multiple elements', () => {
      @xmlDecorator()
      class TestDocument {
        @root
        root: any;

        @parent('root')
        @namespace('atom')
        @name('link')
        links: any[];
      }

      const instance = new TestDocument();
      instance.root = {};
      instance.links = [
        { href: 'source/main', rel: 'source' },
        { href: 'versions', rel: 'versions' },
      ];

      const xml = toXML(instance);
      const content = xml['root'];

      expect(content).toHaveProperty('atom:link');
      expect(Array.isArray(content['atom:link'])).toBe(true);
      expect(content['atom:link']).toHaveLength(2);
      expect(content['atom:link'][0]).toHaveProperty('href', 'source/main');
      expect(content['atom:link'][1]).toHaveProperty('href', 'versions');
    });
  });

  describe('Namespace registry', () => {
    it('should detect namespace conflicts', () => {
      registerNamespace('conflict', 'http://example.com/v1');

      expect(() => {
        registerNamespace('conflict', 'http://example.com/v2'); // Different URI!
      }).toThrow(/Namespace conflict/);
    });

    it('should allow same namespace with same URI', () => {
      registerNamespace('duplicate', 'http://example.com/same');

      // Should not throw - same URI
      expect(() => {
        registerNamespace('duplicate', 'http://example.com/same');
      }).not.toThrow();
    });
  });

  describe('Dynamic parent resolution', () => {
    it('should default to root element when no @parent specified', () => {
      @xmlDecorator()
      class InterfaceDocument {
        @root
        @namespace('intf')
        @name('abapInterface')
        interface: any;

        // No @parent specified - should default to root element
        @namespace('adtcore')
        @attributes
        core: any;
      }

      const instance = new InterfaceDocument();
      instance.interface = {};
      instance.core = { name: 'ZIF_TEST', type: 'INTF/OI' };

      const xml = toXML(instance);
      const content = xml['intf:abapInterface'];

      // Should attach to root element automatically
      expect(content).toHaveProperty('@_adtcore:name', 'ZIF_TEST');
      expect(content).toHaveProperty('@_adtcore:type', 'INTF/OI');
    });

    it('should work with different root elements (reusable base class)', () => {
      // Base class that can be reused with different root elements
      class BaseADTDocument {
        @namespace('adtcore')
        @attributes // No @parent - dynamic!
        core: any;

        @namespace('atom')
        @name('link') // No @parent - dynamic!
        links: any[];
      }

      @xmlDecorator()
      class InterfaceDocument extends BaseADTDocument {
        @root
        @namespace('intf')
        @name('abapInterface')
        interface: any;
      }

      @xmlDecorator()
      class ClassDocument extends BaseADTDocument {
        @root
        @namespace('class')
        @name('abapClass')
        classData: any;
      }

      // Test Interface
      const intfInstance = new InterfaceDocument();
      intfInstance.interface = {};
      intfInstance.core = { name: 'ZIF_TEST' };
      intfInstance.links = [{ href: 'source/main' }];

      const intfXml = toXML(intfInstance);
      const intfContent = intfXml['intf:abapInterface'];

      expect(intfContent).toHaveProperty('@_adtcore:name', 'ZIF_TEST');
      expect(intfContent).toHaveProperty('atom:link');

      // Test Class
      const classInstance = new ClassDocument();
      classInstance.classData = {};
      classInstance.core = { name: 'ZCL_TEST' };
      classInstance.links = [{ href: 'source/main' }];

      const classXml = toXML(classInstance);
      const classContent = classXml['class:abapClass'];

      expect(classContent).toHaveProperty('@_adtcore:name', 'ZCL_TEST');
      expect(classContent).toHaveProperty('atom:link');
    });
  });

  describe('Smart namespace decorator', () => {
    it('should automatically detect attributes vs elements', () => {
      @xmlDecorator()
      class TestDocument {
        @root
        @namespace('test')
        @name('document')
        root: any;

        @createNamespace({ name: 'smart', uri: 'http://test.com/smart' })
        smartData: {
          // Simple values → attributes
          name: string;
          version: number;
          active: boolean;

          // Complex values → elements
          config: { setting: string };
          items: string[];
        };
      }

      const instance = new TestDocument();
      instance.root = {};
      instance.smartData = {
        name: 'TestName',
        version: 1,
        active: true,
        config: { setting: 'value' },
        items: ['item1', 'item2'],
      };

      const xml = toXML(instance);
      const content = xml['test:document'];

      // Simple values should become attributes
      expect(content).toHaveProperty('@_smart:name', 'TestName');
      expect(content).toHaveProperty('@_smart:version', '1');
      expect(content).toHaveProperty('@_smart:active', 'true');

      // Complex values should become elements
      expect(content).toHaveProperty('smart:config');
      expect(content).toHaveProperty('smart:items');
      expect(content['smart:config']).toEqual({ setting: 'value' });
      expect(content['smart:items']).toEqual(['item1', 'item2']);
    });
  });

  describe('Complex example - Interface Document', () => {
    it('should generate complete interface XML structure', () => {
      @xmlDecorator()
      class InterfaceDocument {
        @root
        @namespace('intf')
        @name('abapInterface')
        interface: any;

        @parent('intf:abapInterface')
        @namespace('adtcore')
        @attributes
        core: any;

        @parent('intf:abapInterface')
        @namespace('abapoo')
        @attributes
        oo: any;

        @parent('intf:abapInterface')
        @namespace('adtcore')
        @name('packageRef')
        packageReference: any;

        @parent('intf:abapInterface')
        @namespace('atom')
        @name('link')
        atomLinks: any[];
      }

      const instance = new InterfaceDocument();
      instance.interface = {};
      instance.core = {
        name: 'ZIF_TEST',
        type: 'INTF/OI',
        description: 'Test Interface',
      };
      instance.oo = {
        modeled: false,
      };
      instance.packageReference = {
        name: 'TEST_PACKAGE',
        type: 'DEVC/K',
      };
      instance.atomLinks = [
        { href: 'source/main', rel: 'source' },
        { href: 'versions', rel: 'versions' },
      ];

      const xml = toXML(instance);

      // Verify root element
      expect(xml).toHaveProperty('intf:abapInterface');

      const content = xml['intf:abapInterface'];

      // Verify attributes
      expect(content).toHaveProperty('@_adtcore:name', 'ZIF_TEST');
      expect(content).toHaveProperty('@_adtcore:type', 'INTF/OI');
      expect(content).toHaveProperty('@_adtcore:description', 'Test Interface');
      expect(content).toHaveProperty('@_abapoo:modeled', 'false');

      // Verify child elements
      expect(content).toHaveProperty('adtcore:packageRef');
      expect(content['adtcore:packageRef']).toHaveProperty(
        'name',
        'TEST_PACKAGE'
      );

      expect(content).toHaveProperty('atom:link');
      expect(Array.isArray(content['atom:link'])).toBe(true);
      expect(content['atom:link']).toHaveLength(2);

      // Verify namespace declarations
      expect(content).toHaveProperty(
        '@_xmlns:intf',
        'http://www.sap.com/adt/oo/interfaces'
      );
      expect(content).toHaveProperty(
        '@_xmlns:adtcore',
        'http://www.sap.com/adt/core'
      );
      expect(content).toHaveProperty(
        '@_xmlns:abapoo',
        'http://www.sap.com/adt/oo'
      );
      expect(content).toHaveProperty(
        '@_xmlns:atom',
        'http://www.w3.org/2005/Atom'
      );
    });
  });

  describe('Array Handling', () => {
    // Test namespace for arrays
    interface TestElements {
      item?: { id: string; name: string } | { id: string; name: string }[];
      tag?: string | string[];
    }

    interface TestAttributes {
      // No attributes for this test
    }

    const testArrayNs = createNamespace<TestElements, TestAttributes>({
      name: 'testarray',
      uri: 'http://example.com/testarray',
    });

    @xmlDecorator()
    class ArrayTestClass {
      @root
      @namespace('testarray')
      @name('document')
      rootElement: any = {};

      @testArrayNs
      testData: TestElements;

      constructor(data: { testData: TestElements }) {
        this.testData = data.testData;
      }
    }

    it('should handle object arrays correctly', () => {
      const testObj = new ArrayTestClass({
        testData: {
          item: [
            { id: '1', name: 'First' },
            { id: '2', name: 'Second' },
          ],
        },
      });

      const xml = toXML(testObj);
      const content = xml['testarray:document'];

      // Should create multiple testarray:item elements
      expect(content).toHaveProperty('testarray:item');
      expect(Array.isArray(content['testarray:item'])).toBe(true);
      expect(content['testarray:item']).toHaveLength(2);
      expect(content['testarray:item'][0]).toEqual({ id: '1', name: 'First' });
      expect(content['testarray:item'][1]).toEqual({ id: '2', name: 'Second' });
    });

    it('should handle primitive arrays correctly', () => {
      const testObj = new ArrayTestClass({
        testData: {
          tag: ['typescript', 'xml', 'decorators'],
        },
      });

      const xml = toXML(testObj);
      const content = xml['testarray:document'];

      // Should create multiple testarray:tag elements
      expect(content).toHaveProperty('testarray:tag');
      expect(Array.isArray(content['testarray:tag'])).toBe(true);
      expect(content['testarray:tag']).toHaveLength(3);
      expect(content['testarray:tag']).toEqual([
        'typescript',
        'xml',
        'decorators',
      ]);
    });

    it('should handle mixed arrays and single elements', () => {
      const testObj = new ArrayTestClass({
        testData: {
          item: [
            { id: '1', name: 'First' },
            { id: '2', name: 'Second' },
          ],
          tag: 'single-tag',
        },
      });

      const xml = toXML(testObj);
      const content = xml['testarray:document'];

      // Array should be array, single should be attribute (smart namespace behavior)
      expect(Array.isArray(content['testarray:item'])).toBe(true);
      expect(content['testarray:item']).toHaveLength(2);
      // Simple values become attributes in smart namespaces
      expect(content).toHaveProperty('@_testarray:tag', 'single-tag');
    });

    it('should handle empty arrays', () => {
      const testObj = new ArrayTestClass({
        testData: {
          item: [],
          tag: [],
        },
      });

      const xml = toXML(testObj);
      const content = xml['testarray:document'];

      // Empty arrays should create empty arrays in XML
      expect(content).toHaveProperty('testarray:item');
      expect(content).toHaveProperty('testarray:tag');
      expect(Array.isArray(content['testarray:item'])).toBe(true);
      expect(Array.isArray(content['testarray:tag'])).toBe(true);
      expect(content['testarray:item']).toHaveLength(0);
      expect(content['testarray:tag']).toHaveLength(0);
    });
  });

  describe('Smart Namespace with @name Decorator', () => {
    it('should support @name decorator for element renaming in smart namespaces', () => {
      // Register test namespaces
      registerNamespace('testdoc', 'http://test.example.com/testdoc');
      registerNamespace('testns', 'http://test.example.com/testns');

      // Create smart namespace decorator
      const testNamespace = createNamespace<{ item: any[] }, {}>({
        name: 'testns',
        uri: 'http://test.example.com/testns',
      });

      @xmlDecorator()
      class TestDocument {
        @root
        @namespace('testdoc')
        @name('document')
        root: any;

        // Test @name decorator with smart namespace
        @testNamespace
        @name('item')
        renamedProperty: { id: string; name: string }[];
      }

      const testObj = new TestDocument();
      testObj.root = {};
      testObj.renamedProperty = [
        { id: '1', name: 'First Item' },
        { id: '2', name: 'Second Item' },
      ];

      const xml = toXML(testObj);
      const content = xml['testdoc:document'];

      // Verify that @name decorator renamed the element correctly
      expect(content).toHaveProperty('testns:item');
      expect(Array.isArray(content['testns:item'])).toBe(true);
      expect(content['testns:item']).toHaveLength(2);
      expect(content['testns:item'][0]).toEqual({
        id: '1',
        name: 'First Item',
      });
      expect(content['testns:item'][1]).toEqual({
        id: '2',
        name: 'Second Item',
      });

      // Verify namespace declarations
      expect(content).toHaveProperty(
        '@_xmlns:testdoc',
        'http://test.example.com/testdoc'
      );
      expect(content).toHaveProperty(
        '@_xmlns:testns',
        'http://test.example.com/testns'
      );
    });
  });

  describe('$attributes Symbol Support', () => {
    it('should generate namespaced attributes for objects with $attributes symbol', () => {
      @xmlDecorator()
      class TestDocument {
        @root
        @namespace('intf')
        @name('abapInterface')
        interface: any;

        @parent('intf:abapInterface')
        @namespace('adtcore')
        @element
        @name('packageRef')
        packageReference: any;
      }

      const instance = new TestDocument();
      instance.interface = {};
      instance.packageReference = {
        [$attributes]: {
          uri: '/sap/bc/adt/packages/zpepl_test',
          type: 'DEVC/K',
          name: 'ZPEPL_TEST',
        },
      };

      const xml = toXML(instance);
      const content = xml['intf:abapInterface'];

      expect(content).toHaveProperty('adtcore:packageRef');

      // Should have namespaced attributes like in ADT fixtures
      expect(content['adtcore:packageRef']).toHaveProperty(
        '@_adtcore:uri',
        '/sap/bc/adt/packages/zpepl_test'
      );
      expect(content['adtcore:packageRef']).toHaveProperty(
        '@_adtcore:type',
        'DEVC/K'
      );
      expect(content['adtcore:packageRef']).toHaveProperty(
        '@_adtcore:name',
        'ZPEPL_TEST'
      );
    });

    it('should handle atom links with attributes using $attributes symbol', () => {
      @xmlDecorator()
      class TestDocument {
        @root
        @namespace('intf')
        @name('abapInterface')
        interface: any;

        @parent('intf:abapInterface')
        @namespace('atom')
        @element
        @name('link')
        atomLinks: any[];
      }

      const instance = new TestDocument();
      instance.interface = {};
      instance.atomLinks = [
        {
          [$attributes]: {
            href: 'source/main/versions',
            rel: 'http://www.sap.com/adt/relations/versions',
          },
        },
        {
          [$attributes]: {
            href: 'source/main',
            rel: 'http://www.sap.com/adt/relations/source',
            type: 'text/plain',
          },
        },
      ];

      const xml = toXML(instance);
      const content = xml['intf:abapInterface'];

      expect(content).toHaveProperty('atom:link');
      expect(Array.isArray(content['atom:link'])).toBe(true);
      expect(content['atom:link']).toHaveLength(2);

      // Should have attributes with namespace prefix (consistent with our implementation)
      expect(content['atom:link'][0]).toHaveProperty(
        '@_atom:href',
        'source/main/versions'
      );
      expect(content['atom:link'][0]).toHaveProperty(
        '@_atom:rel',
        'http://www.sap.com/adt/relations/versions'
      );
      expect(content['atom:link'][1]).toHaveProperty(
        '@_atom:href',
        'source/main'
      );
      expect(content['atom:link'][1]).toHaveProperty(
        '@_atom:type',
        'text/plain'
      );
    });
  });
});
