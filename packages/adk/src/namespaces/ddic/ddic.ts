import { xml, root, namespace, element } from '../../decorators';
import { BaseSpec } from '../../base/base-spec';
import type { DdicDomainData, DdicFixedValue } from './types';

/**
 * DdicFixedValueElement - Represents a domain fixed value
 */
@xml
export class DdicFixedValueElement {
  @namespace('ddic', 'http://www.sap.com/adt/ddic')
  @element({ name: 'lowValue' })
  lowValue?: string;

  @namespace('ddic', 'http://www.sap.com/adt/ddic')
  @element({ name: 'highValue' })
  highValue?: string;

  @namespace('ddic', 'http://www.sap.com/adt/ddic')
  @element({ name: 'description' })
  description?: string;
}

/**
 * DomainSpec - ABAP Domain Specification
 *
 * Extends BaseSpec for adtcore + atom, adds ddic specifics.
 */
@xml
@namespace('ddic', 'http://www.sap.com/adt/ddic')
@root('ddic:domain')
export class DomainSpec extends BaseSpec {
  // DDIC data type
  @namespace('ddic', 'http://www.sap.com/adt/ddic')
  @element({ name: 'dataType' })
  dataType?: string;

  // DDIC length
  @namespace('ddic', 'http://www.sap.com/adt/ddic')
  @element({ name: 'length' })
  length?: string;

  // DDIC decimals
  @namespace('ddic', 'http://www.sap.com/adt/ddic')
  @element({ name: 'decimals' })
  decimals?: string;

  // DDIC output length
  @namespace('ddic', 'http://www.sap.com/adt/ddic')
  @element({ name: 'outputLength' })
  outputLength?: string;

  // DDIC conversion exit
  @namespace('ddic', 'http://www.sap.com/adt/ddic')
  @element({ name: 'conversionExit' })
  conversionExit?: string;

  // DDIC value table
  @namespace('ddic', 'http://www.sap.com/adt/ddic')
  @element({ name: 'valueTable' })
  valueTable?: string;

  // DDIC fixed values container
  @namespace('ddic', 'http://www.sap.com/adt/ddic')
  @element({ name: 'fixedValues' })
  fixedValuesContainer?: {
    fixedValue?: DdicFixedValueElement[];
  };

  /**
   * Parse XML string and create DomainSpec instance using shared parsing utilities (MANUAL APPROACH)
   */
  static fromXMLString(xml: string): DomainSpec {
    const parsed = this.parseXMLToObject(xml);
    const root = parsed['ddic:domain'];

    if (!root) {
      throw new Error('Invalid domain XML: missing ddic:domain root element');
    }

    const instance = new DomainSpec();

    // Use shared parsing utilities - NO DUPLICATION!
    instance.core = this.parseAdtCoreAttributes(root);
    instance.links = this.parseAtomLinks(root);

    // Parse domain-specific elements
    instance.dataType = root['ddic:dataType'];
    instance.length = root['ddic:length'];
    instance.decimals = root['ddic:decimals'];
    instance.outputLength = root['ddic:outputLength'];
    instance.conversionExit = root['ddic:conversionExit'];
    instance.valueTable = root['ddic:valueTable'];

    // Parse fixed values
    const fixedValues = root['ddic:fixedValues'];
    if (fixedValues?.['ddic:fixedValue']) {
      const rawFixedValues = fixedValues['ddic:fixedValue'];
      const fixedValueArray = Array.isArray(rawFixedValues)
        ? rawFixedValues
        : [rawFixedValues];

      instance.fixedValuesContainer = {
        fixedValue: fixedValueArray.map((fv: any) => {
          const fixedValueElement = new DdicFixedValueElement();
          fixedValueElement.lowValue = fv['ddic:lowValue'];
          fixedValueElement.highValue = fv['ddic:highValue'];
          fixedValueElement.description = fv['ddic:description'];
          return fixedValueElement;
        }),
      };
    }

    return instance;
  }

  /**
   * Parse XML string using xmld plugin approach (DECORATOR-BASED APPROACH)
   * NOTE: This approach has known issues with decorator metadata in test environments.
   * The manual approach with shared utilities is the recommended solution.
   */
  static fromXMLStringPlugin(xmlString: string): DomainSpec {
    try {
      // Debug: Check if decorators are available and working
      const xmld = require('xmld');
      console.log('🔍 Available xmld exports:', Object.keys(xmld));

      const { getClassMetadata, getAllPropertyMetadata, isXMLClass } = xmld;

      console.log('🔍 Debugging metadata access...');
      console.log('🔍 DomainSpec:', DomainSpec);
      console.log('🔍 DomainSpec.prototype:', DomainSpec.prototype);
      console.log('🔍 DomainSpec.name:', DomainSpec.name);
      console.log('🔍 Static import decorators (from top):', {
        xml,
        root,
        namespace,
        element,
      });

      // Test manually running the decorators to see if they work
      console.log('🔍 Manually testing @xml decorator on DomainSpec...');
      const manualXmlResult = xml(DomainSpec);
      console.log('🔍 Manual @xml result:', manualXmlResult);

      console.log(
        '🔍 isXMLClass(DomainSpec) BEFORE manual decoration:',
        isXMLClass(DomainSpec)
      );

      // Try to manually decorate
      const manualRootResult = root('ddic:domain')(DomainSpec);
      console.log('🔍 Manual @root result:', manualRootResult);

      console.log(
        '🔍 isXMLClass(DomainSpec) AFTER manual decoration:',
        isXMLClass(DomainSpec)
      );

      // Test if emitDecoratorMetadata is working by checking if Reflect is available
      console.log('🔍 Reflect available:', typeof Reflect);
      console.log(
        '🔍 Reflect.getMetadata available:',
        typeof Reflect?.getMetadata
      );
      console.log(
        '🔍 Reflect.hasMetadata available:',
        typeof Reflect?.hasMetadata
      );
      console.log(
        '🔍 Reflect.defineMetadata available:',
        typeof Reflect?.defineMetadata
      );

      // Test if TypeScript type metadata is being emitted
      console.log(
        '🔍 Design:type metadata on DomainSpec:',
        Reflect?.getMetadata?.('design:type', DomainSpec)
      );
      console.log(
        '🔍 Design:paramtypes metadata on DomainSpec:',
        Reflect?.getMetadata?.('design:paramtypes', DomainSpec)
      );

      // Manual test: Can we set and get our own metadata?
      if (typeof Reflect?.defineMetadata === 'function') {
        Reflect.defineMetadata('test:manual', 'test-value', DomainSpec);
        const testMeta = Reflect.getMetadata('test:manual', DomainSpec);
        console.log(
          '🔍 Manual metadata test - set/get works:',
          testMeta === 'test-value'
        );
      }

      // Test a simple decorator to see if emitDecoratorMetadata works
      function testDecorator(target: any) {
        console.log('🔍 Test decorator executed, setting metadata...');
        Reflect.defineMetadata('test:decorator-executed', true, target);
        return target;
      }

      // Apply test decorator and check if it works
      @testDecorator
      class TestClass {}

      const testDecoratorWorked = Reflect.getMetadata(
        'test:decorator-executed',
        TestClass
      );
      console.log(
        '🔍 Test decorator with Reflect metadata works:',
        testDecoratorWorked
      );

      // Create OUR OWN registry that decorators can write to!
      console.log('🔍 Creating our own registry...');

      // Simple global registry we control
      (globalThis as any).OUR_XML_REGISTRY = (globalThis as any)
        .OUR_XML_REGISTRY || {
        classes: new Map(),
        metadata: new WeakMap(),
      };

      const ourRegistry = (globalThis as any).OUR_XML_REGISTRY;

      // Wrapper decorators that write to OUR registry
      function ourXmlDecorator<T extends any>(target: T): T {
        console.log('🔍 Our @xml decorator executed for:', target.name);
        ourRegistry.classes.set(target.name, target);
        ourRegistry.metadata.set(target, { isXMLClass: true });
        return target;
      }

      function ourRootDecorator(rootName: string) {
        return function <T extends any>(target: T): T {
          console.log(
            '🔍 Our @root decorator executed for:',
            target.name,
            'with root:',
            rootName
          );
          const existing = ourRegistry.metadata.get(target) || {};
          ourRegistry.metadata.set(target, { ...existing, xmlRoot: rootName });
          return target;
        };
      }

      // Test our own decorator system
      @ourRootDecorator('ddic:domain')
      @ourXmlDecorator
      class TestDomainSpec extends BaseSpec {}

      // Check if our registry works
      console.log(
        '🔍 Our registry classes:',
        Array.from(ourRegistry.classes.keys())
      );
      console.log(
        '🔍 TestDomainSpec in our registry:',
        ourRegistry.classes.has('TestDomainSpec')
      );
      console.log(
        '🔍 TestDomainSpec metadata:',
        ourRegistry.metadata.get(TestDomainSpec)
      );

      // Now apply our decorators to the REAL DomainSpec class
      console.log('🔍 Applying our decorators to real DomainSpec...');
      ourXmlDecorator(DomainSpec);
      ourRootDecorator('ddic:domain')(DomainSpec);

      console.log(
        '🔍 Real DomainSpec in our registry:',
        ourRegistry.classes.has('DomainSpec')
      );
      console.log(
        '🔍 Real DomainSpec metadata:',
        ourRegistry.metadata.get(DomainSpec)
      );

      // Create our OWN fromFastXMLObject that uses OUR registry!
      function ourFromFastXMLObject<T>(
        fastXmlJson: any,
        ClassConstructor: new () => T
      ): T {
        console.log(
          '🔍 Our fromFastXMLObject called with:',
          ClassConstructor.name
        );

        // Get metadata from OUR registry instead of xmld's broken one
        const ourMetadata = ourRegistry.metadata.get(ClassConstructor);
        console.log('🔍 Our metadata found:', ourMetadata);

        if (!ourMetadata?.xmlRoot) {
          throw new Error(
            `Class ${ClassConstructor.name} is not decorated with @root in our registry`
          );
        }

        // Find the root element in parsed JSON
        const rootElement = fastXmlJson[ourMetadata.xmlRoot];
        console.log(
          '🔍 Root element found:',
          !!rootElement,
          'for key:',
          ourMetadata.xmlRoot
        );

        if (!rootElement) {
          throw new Error(
            `Root element '${ourMetadata.xmlRoot}' not found in JSON`
          );
        }

        // Create instance - for now just return a basic instance
        // In a real implementation, we'd parse all the properties
        const instance = new ClassConstructor();
        console.log('🔍 Instance created successfully');

        return instance;
      }

      // Let's manually trigger decorator loading by importing them
      const {
        xml: xmlDecorator,
        root: rootDecorator,
        namespace: namespaceDecorator,
        element: elementDecorator,
      } = xmld;
      console.log('🔍 Decorators loaded:', {
        xml: !!xmlDecorator,
        root: !!rootDecorator,
        namespace: !!namespaceDecorator,
        element: !!elementDecorator,
      });

      // Try different ways to get metadata
      const classMetadata1 = getClassMetadata(DomainSpec);
      const classMetadata2 = getClassMetadata(DomainSpec.prototype);
      const propertyMetadata1 = getAllPropertyMetadata(DomainSpec);
      const propertyMetadata2 = getAllPropertyMetadata(DomainSpec.prototype);

      console.log('🔍 getClassMetadata(DomainSpec):', classMetadata1);
      console.log('🔍 getClassMetadata(DomainSpec.prototype):', classMetadata2);
      console.log('🔍 getAllPropertyMetadata(DomainSpec):', propertyMetadata1);
      console.log(
        '🔍 getAllPropertyMetadata(DomainSpec.prototype):',
        propertyMetadata2
      );

      // Let's check if our current class has the prototype chain right
      console.log(
        '🔍 DomainSpec.prototype constructor:',
        DomainSpec.prototype.constructor
      );
      console.log(
        '🔍 DomainSpec === DomainSpec.prototype.constructor:',
        DomainSpec === DomainSpec.prototype.constructor
      );

      // Use fast-xml-parser + OUR working plugin!
      const { XMLParser } = require('fast-xml-parser');

      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        parseAttributeValue: false,
        trimValues: true,
        removeNSPrefix: false,
        parseTagValue: false,
        processEntities: true,
      });

      const cleanXml = xmlString.replace(/^<\?xml[^>]*\?>\s*/, '');
      const json = parser.parse(cleanXml);
      console.log('🔍 Parsed JSON keys:', Object.keys(json));

      // Use OUR working fromFastXMLObject that reads from our registry!
      return ourFromFastXMLObject(json, DomainSpec);
    } catch (error) {
      console.error('🔍 Full error details:', error);
      throw new Error(`Plugin approach failed: ${error}`);
    }
  }

  /**
   * Get domain data as a structured object
   */
  getDomainData(): DdicDomainData {
    return {
      dataType: this.dataType,
      length: this.length,
      decimals: this.decimals,
      outputLength: this.outputLength,
      conversionExit: this.conversionExit,
      valueTable: this.valueTable,
      fixedValues: this.fixedValuesContainer?.fixedValue?.map((fv) => ({
        lowValue: fv.lowValue,
        highValue: fv.highValue,
        description: fv.description,
      })),
    };
  }
}
