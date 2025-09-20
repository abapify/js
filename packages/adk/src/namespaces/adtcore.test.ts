import { describe, it, expect, vi } from 'vitest';
import {
  xml as xmlDecorator,
  root,
  namespace,
  name,
  toXML,
  registerNamespace,
} from '../decorators/decorators-v2';
import { adtcore, type AdtCoreType } from './adtcore';
import { atom, type AtomLinkType } from './atom';

// Register test namespace for interface
registerNamespace('intf', 'http://www.sap.com/adt/oo/interfaces');

describe('ADT Core Namespace (@adtcore)', () => {
  it('should demonstrate smart namespace factory pattern', () => {
    @xmlDecorator()
    class InterfaceDocument {
      @root
      @namespace('intf')
      @name('abapInterface')
      interface: any;

      @adtcore // ← Smart domain decorator!
      core: AdtCoreType;
    }

    const instance = new InterfaceDocument();
    instance.interface = {};
    instance.core = {
      // Simple values → automatically become attributes
      name: 'ZIF_TEST',
      type: 'INTF/OI',
      version: 'inactive',
      responsible: 'DEVELOPER',

      // Complex values → automatically become elements
      packageRef: {
        name: 'TEST',
        type: 'DEVC/K',
      },
    };

    const xml = toXML(instance);
    const content = xml['intf:abapInterface'];

    // Verify attributes (simple values)
    expect(content).toHaveProperty('@_adtcore:name', 'ZIF_TEST');
    expect(content).toHaveProperty('@_adtcore:type', 'INTF/OI');
    expect(content).toHaveProperty('@_adtcore:version', 'inactive');
    expect(content).toHaveProperty('@_adtcore:responsible', 'DEVELOPER');

    // Verify elements (complex values)
    expect(content).toHaveProperty('adtcore:packageRef');
    expect(content['adtcore:packageRef']).toEqual({
      name: 'TEST',
      type: 'DEVC/K',
    });

    // Verify namespace declarations
    expect(content).toHaveProperty(
      '@_xmlns:intf',
      'http://www.sap.com/adt/oo/interfaces'
    );
    expect(content).toHaveProperty(
      '@_xmlns:adtcore',
      'http://www.sap.com/adt/core'
    );
  });

  it('should handle optional elements gracefully', () => {
    @xmlDecorator()
    class MinimalInterface {
      @root
      @namespace('intf')
      @name('abapInterface')
      interface: any;

      @adtcore
      core: AdtCoreType;
    }

    const instance = new MinimalInterface();
    instance.interface = {};
    instance.core = {
      // Only required attributes
      name: 'ZIF_MINIMAL',
      type: 'INTF/OI',
      // No optional elements
    };

    const xml = toXML(instance);
    const content = xml['intf:abapInterface'];

    // Should have attributes
    expect(content).toHaveProperty('@_adtcore:name', 'ZIF_MINIMAL');
    expect(content).toHaveProperty('@_adtcore:type', 'INTF/OI');

    // Should not have optional elements
    expect(content).not.toHaveProperty('adtcore:packageRef');
    expect(content).not.toHaveProperty('adtcore:syntaxConfiguration');
  });

  it('should work with complex nested elements', () => {
    @xmlDecorator()
    class ComplexInterface {
      @root
      @namespace('intf')
      @name('abapInterface')
      interface: any;

      @adtcore
      core: AdtCoreType;
    }

    const instance = new ComplexInterface();
    instance.interface = {};
    instance.core = {
      name: 'ZIF_COMPLEX',
      type: 'INTF/OI',

      // Complex nested element
      syntaxConfiguration: {
        language: 'ABAP',
        version: '7.5',
      },
    };

    const xml = toXML(instance);
    const content = xml['intf:abapInterface'];

    // Verify nested element structure
    expect(content).toHaveProperty('adtcore:syntaxConfiguration');
    expect(content['adtcore:syntaxConfiguration']).toEqual({
      language: 'ABAP',
      version: '7.5',
    });
  });

  it('should work with adtcore attributes and atom links together', () => {
    @xmlDecorator()
    class InterfaceWithLinks {
      @root
      @namespace('intf')
      @name('abapInterface')
      interface: any;

      @adtcore
      core: AdtCoreType;

      @atom
      link: AtomLinkType[];
    }

    const instance = new InterfaceWithLinks();
    instance.interface = {};
    instance.core = {
      name: 'ZIF_WITH_LINKS',
      type: 'INTF/OI',
      version: 'active',
      responsible: 'DEVELOPER',
    };
    instance.link = [
      { href: 'source/main', rel: 'http://www.sap.com/adt/relations/source' },
      { href: 'versions', rel: 'http://www.sap.com/adt/relations/versions' },
    ];

    const xml = toXML(instance);
    const content = xml['intf:abapInterface'];

    // Verify adtcore attributes
    expect(content).toHaveProperty('@_adtcore:name', 'ZIF_WITH_LINKS');
    expect(content).toHaveProperty('@_adtcore:type', 'INTF/OI');
    expect(content).toHaveProperty('@_adtcore:version', 'active');
    expect(content).toHaveProperty('@_adtcore:responsible', 'DEVELOPER');

    // Verify atom links are present as elements
    expect(content).toHaveProperty('atom:link');
    expect(Array.isArray(content['atom:link'])).toBe(true);
    expect(content['atom:link']).toHaveLength(2);
    expect(content['atom:link'][0]).toEqual({
      href: 'source/main',
      rel: 'http://www.sap.com/adt/relations/source',
    });
    expect(content['atom:link'][1]).toEqual({
      href: 'versions',
      rel: 'http://www.sap.com/adt/relations/versions',
    });
  });

  it('should work with smart namespace pattern for atom elements', () => {
    // This test verifies that smart namespaces work correctly
    // when providing elements-only interface (no attributes)
    @xmlDecorator()
    class InterfaceWithSmartAtom {
      @root
      @namespace('intf')
      @name('abapInterface')
      interface: any;

      @adtcore
      core: AdtCoreType;

      // Smart namespace pattern - direct property mapping
      @atom
      link: AtomLinkType[];
    }

    const instance = new InterfaceWithSmartAtom();
    instance.interface = {};
    instance.core = {
      name: 'ZIF_SMART_ATOM',
      type: 'INTF/OI',
    };
    instance.link = [
      { href: 'source/main', rel: 'http://www.sap.com/adt/relations/source' },
      { href: 'versions', rel: 'http://www.sap.com/adt/relations/versions' },
    ];

    const xml = toXML(instance);
    const content = xml['intf:abapInterface'];

    // Verify adtcore attributes work
    expect(content).toHaveProperty('@_adtcore:name', 'ZIF_SMART_ATOM');
    expect(content).toHaveProperty('@_adtcore:type', 'INTF/OI');

    // Verify atom links are generated from smart namespace
    expect(content).toHaveProperty('atom:link');
    expect(Array.isArray(content['atom:link'])).toBe(true);
    expect(content['atom:link']).toHaveLength(2);
    expect(content['atom:link'][0]).toEqual({
      href: 'source/main',
      rel: 'http://www.sap.com/adt/relations/source',
    });
  });

  it('should support @name decorator for element renaming', () => {
    // This test verifies that @name decorator works with smart namespaces
    // to rename XML elements while keeping property names clean
    @xmlDecorator()
    class InterfaceWithRenamedElements {
      @root
      @namespace('intf')
      @name('abapInterface')
      interface: any;

      @adtcore
      core: AdtCoreType;

      // Use @name to rename property to desired XML element name
      @atom
      @name('link')
      atomLinks: AtomLinkType[];
    }

    const instance = new InterfaceWithRenamedElements();
    instance.interface = {};
    instance.core = {
      name: 'ZIF_RENAMED',
      type: 'INTF/OI',
    };
    instance.atomLinks = [
      { href: 'source/main', rel: 'http://www.sap.com/adt/relations/source' },
      { href: 'versions', rel: 'http://www.sap.com/adt/relations/versions' },
    ];

    const xml = toXML(instance);
    const content = xml['intf:abapInterface'];

    // Verify adtcore attributes work
    expect(content).toHaveProperty('@_adtcore:name', 'ZIF_RENAMED');
    expect(content).toHaveProperty('@_adtcore:type', 'INTF/OI');

    // Verify atom links are generated with renamed element name
    expect(content).toHaveProperty('atom:link');
    expect(Array.isArray(content['atom:link'])).toBe(true);
    expect(content['atom:link']).toHaveLength(2);
    expect(content['atom:link'][0]).toEqual({
      href: 'source/main',
      rel: 'http://www.sap.com/adt/relations/source',
    });
    expect(content['atom:link'][1]).toEqual({
      href: 'versions',
      rel: 'http://www.sap.com/adt/relations/versions',
    });
  });

  it('should demonstrate the power of smart namespace factory', () => {
    // This test shows how the factory pattern eliminates verbose decorators
    @xmlDecorator()
    class ElegantInterface {
      @root
      @namespace('intf')
      @name('abapInterface')
      interface: any;

      @adtcore
      core: AdtCoreType;
    }

    const instance = new ElegantInterface();
    instance.interface = {};
    instance.core = {
      name: 'ZIF_ELEGANT',
      type: 'INTF/OI',
      version: 'active',
      responsible: 'ARCHITECT',
      description: 'Elegant interface design',
      packageRef: {
        name: 'ELEGANT_PACKAGE',
        type: 'DEVC/K',
      },
    };

    const xml = toXML(instance);
    const content = xml['intf:abapInterface'];

    // All attributes automatically detected
    expect(content).toHaveProperty('@_adtcore:name', 'ZIF_ELEGANT');
    expect(content).toHaveProperty('@_adtcore:type', 'INTF/OI');
    expect(content).toHaveProperty(
      '@_adtcore:description',
      'Elegant interface design'
    );

    // Complex values automatically become elements
    expect(content).toHaveProperty('adtcore:packageRef');
    expect(content['adtcore:packageRef']).toEqual({
      name: 'ELEGANT_PACKAGE',
      type: 'DEVC/K',
    });
  });
});
