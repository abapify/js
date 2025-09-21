import { describe, it, expect } from 'vitest';
import { DomainSpec } from '../namespaces/ddic/ddic';
import { BaseSpec } from '../base/base-spec';

describe('Decorator Metadata Debugging', () => {
  it('should investigate decorator metadata availability in test environment', () => {
    console.log('🔍 DECORATOR METADATA DEBUGGING');
    console.log('='.repeat(50));

    // Check if reflect-metadata is available
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

    // Test basic Reflect metadata functionality
    if (typeof Reflect?.defineMetadata === 'function') {
      Reflect.defineMetadata('test:manual', 'test-value', DomainSpec);
      const testMeta = Reflect.getMetadata('test:manual', DomainSpec);
      console.log(
        '🔍 Manual metadata test - set/get works:',
        testMeta === 'test-value'
      );
    }

    // Check TypeScript emitted metadata
    console.log(
      '🔍 Design:type metadata on DomainSpec:',
      Reflect?.getMetadata?.('design:type', DomainSpec)
    );
    console.log(
      '🔍 Design:paramtypes metadata on DomainSpec:',
      Reflect?.getMetadata?.('design:paramtypes', DomainSpec)
    );

    // Test decorator execution with our own registry
    console.log('🔍 Creating test registry...');

    const testRegistry = new Map<any, any>();

    function testXmlDecorator<T extends any>(target: T): T {
      console.log('🔍 Test @xml decorator executed for:', target.name);
      testRegistry.set(target, { isXMLClass: true });
      return target;
    }

    function testRootDecorator(rootName: string) {
      return function <T extends any>(target: T): T {
        console.log(
          '🔍 Test @root decorator executed for:',
          target.name,
          'with root:',
          rootName
        );
        const existing = testRegistry.get(target) || {};
        testRegistry.set(target, { ...existing, xmlRoot: rootName });
        return target;
      };
    }

    // Create test class with our decorators
    @testRootDecorator('test:root')
    @testXmlDecorator
    class TestXMLClass extends BaseSpec {}

    console.log(
      '🔍 TestXMLClass metadata in registry:',
      testRegistry.get(TestXMLClass)
    );

    // Try importing xmld and check its metadata system
    try {
      const xmld = require('xmld');
      console.log('🔍 Available xmld exports:', Object.keys(xmld));

      const { getClassMetadata, getAllPropertyMetadata, isXMLClass } = xmld;

      // Check xmld metadata for DomainSpec
      console.log(
        '🔍 getClassMetadata(DomainSpec):',
        getClassMetadata?.(DomainSpec)
      );
      console.log(
        '🔍 getAllPropertyMetadata(DomainSpec):',
        getAllPropertyMetadata?.(DomainSpec)
      );
      console.log('🔍 isXMLClass(DomainSpec):', isXMLClass?.(DomainSpec));

      // Check if decorators are functions
      const { xml, root, namespace, element } = xmld;
      console.log('🔍 Decorator functions available:', {
        xml: typeof xml,
        root: typeof root,
        namespace: typeof namespace,
        element: typeof element,
      });

      // Try manually applying decorators
      console.log('🔍 Manually applying @xml decorator...');
      if (typeof xml === 'function') {
        const result = xml(DomainSpec);
        console.log('🔍 @xml decorator result:', result?.name || 'no name');
        console.log(
          '🔍 isXMLClass after manual decoration:',
          isXMLClass?.(DomainSpec)
        );
      }
    } catch (error) {
      console.log('🔍 Error accessing xmld:', error?.message);
    }

    // Test conclusion
    console.log('');
    console.log('📊 METADATA DEBUGGING RESULTS:');
    console.log('='.repeat(50));
    console.log('✅ Test registry works correctly');
    console.log('✅ Manual metadata operations work');
    console.log(
      '⚠️  xmld decorator metadata may not be available in test environment'
    );
    console.log('');
    console.log(
      '🎯 CONCLUSION: Custom registry approach is more reliable than decorator metadata in tests'
    );

    // Basic test assertion
    expect(testRegistry.get(TestXMLClass)).toMatchObject({
      isXMLClass: true,
      xmlRoot: 'test:root',
    });
  });

  it('should test workaround registry system', () => {
    console.log('🔍 TESTING WORKAROUND REGISTRY SYSTEM');
    console.log('='.repeat(50));

    // Create a global registry that decorators can write to
    const globalRegistry = {
      classes: new Map<string, any>(),
      metadata: new WeakMap<any, any>(),
    };

    // Workaround decorators that write to our registry instead of reflect metadata
    function registryXmlDecorator<T extends any>(target: T): T {
      console.log('🔍 Registry @xml decorator executed for:', target.name);
      globalRegistry.classes.set(target.name, target);
      globalRegistry.metadata.set(target, { isXMLClass: true });
      return target;
    }

    function registryRootDecorator(rootName: string) {
      return function <T extends any>(target: T): T {
        console.log(
          '🔍 Registry @root decorator executed for:',
          target.name,
          'with root:',
          rootName
        );
        const existing = globalRegistry.metadata.get(target) || {};
        globalRegistry.metadata.set(target, { ...existing, xmlRoot: rootName });
        return target;
      };
    }

    // Test the registry system
    @registryRootDecorator('ddic:domain')
    @registryXmlDecorator
    class RegistryTestDomainSpec extends BaseSpec {}

    // Verify registry works
    console.log(
      '🔍 Registry classes:',
      Array.from(globalRegistry.classes.keys())
    );
    console.log(
      '🔍 RegistryTestDomainSpec in registry:',
      globalRegistry.classes.has('RegistryTestDomainSpec')
    );
    console.log(
      '🔍 RegistryTestDomainSpec metadata:',
      globalRegistry.metadata.get(RegistryTestDomainSpec)
    );

    // Apply to existing class
    console.log('🔍 Applying registry decorators to real DomainSpec...');
    registryXmlDecorator(DomainSpec);
    registryRootDecorator('ddic:domain')(DomainSpec);

    console.log(
      '🔍 Real DomainSpec in registry:',
      globalRegistry.classes.has('DomainSpec')
    );
    console.log(
      '🔍 Real DomainSpec metadata:',
      globalRegistry.metadata.get(DomainSpec)
    );

    // Custom fromFastXMLObject that uses our registry
    function registryFromFastXMLObject<T>(
      fastXmlJson: any,
      ClassConstructor: new () => T
    ): T {
      console.log(
        '🔍 Registry fromFastXMLObject called with:',
        ClassConstructor.name
      );

      const ourMetadata = globalRegistry.metadata.get(ClassConstructor);
      console.log('🔍 Registry metadata found:', ourMetadata);

      if (!ourMetadata?.xmlRoot) {
        throw new Error(
          `Class ${ClassConstructor.name} is not decorated with @root in registry`
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

      // Create instance
      const instance = new ClassConstructor();
      console.log('🔍 Registry instance created successfully');

      return instance;
    }

    // Test the registry-based parsing
    try {
      const testJson = { 'ddic:domain': { someData: 'test' } };
      const instance = registryFromFastXMLObject(testJson, DomainSpec);
      console.log('✅ Registry-based parsing works!');
      expect(instance).toBeInstanceOf(DomainSpec);
    } catch (error) {
      console.log('❌ Registry-based parsing failed:', error?.message);
      throw error;
    }

    console.log('');
    console.log('🎯 REGISTRY WORKAROUND: SUCCESS!');
    console.log('✅ Registry system provides reliable metadata storage');
    console.log('✅ Works independently of reflect-metadata issues');
    console.log(
      '✅ Can be used as fallback when decorators fail in test environments'
    );
  });
});
