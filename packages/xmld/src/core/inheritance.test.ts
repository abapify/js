/**
 * Test inheritance support in xmld decorators
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { xmld, root, element, attribute, namespace } from './decorators';
import { toXML } from '../serialization/serializer';
import { clearAllMetadata } from './metadata';

describe('xmld inheritance support', () => {
  beforeEach(() => {
    clearAllMetadata();
  });

  it('should support basic class inheritance', () => {
    @xmld
    class BaseXML {
      @attribute id!: string;
      @element title!: string;
    }

    @xmld
    @root('document')
    class Document extends BaseXML {
      @element content!: string;
    }

    const doc = new Document();
    doc.id = '123';
    doc.title = 'Test Document';
    doc.content = 'Document content';

    const xml = toXML(doc);

    // Should include properties from both base class and derived class
    expect(xml).toContain('id="123"');
    expect(xml).toContain('<title>Test Document</title>');
    expect(xml).toContain('<content>Document content</content>');
  });

  it('should support multi-level inheritance', () => {
    @xmld
    class BaseXML {
      @attribute id!: string;
    }

    @xmld
    @namespace('oo', 'http://www.sap.com/adt/oo')
    class OOXML extends BaseXML {
      @namespace('oo', 'http://www.sap.com/adt/oo')
      @attribute
      type!: string;
    }

    @xmld
    @root('intf:interface')
    @namespace('intf', 'http://www.sap.com/adt/oo/interfaces')
    class InterfaceXML extends OOXML {
      @element description!: string;
    }

    const intf = new InterfaceXML();
    intf.id = '123';
    intf.type = 'INTF/OI';
    intf.description = 'Test interface';

    const xml = toXML(intf);

    // Should include properties from all levels of inheritance
    expect(xml).toContain('intf:id="123"'); // id gets namespace from class
    expect(xml).toContain('oo:type="INTF/OI"');
    expect(xml).toContain(
      '<intf:description>Test interface</intf:description>'
    ); // description gets namespace from class
    expect(xml).toContain('xmlns:oo="http://www.sap.com/adt/oo"');
    expect(xml).toContain('xmlns:intf="http://www.sap.com/adt/oo/interfaces"');
  });

  it('should override properties correctly in inheritance', () => {
    @xmld
    class BaseXML {
      @attribute version = '1.0';
      @element title!: string;
    }

    @xmld
    @root('document')
    class Document extends BaseXML {
      @attribute version = '2.0'; // Override base version
      @element content!: string;
    }

    const doc = new Document();
    doc.title = 'Test';
    doc.content = 'Content';

    const xml = toXML(doc);

    // Should use the overridden version
    expect(xml).toContain('version="2.0"');
    expect(xml).toContain('<title>Test</title>');
    expect(xml).toContain('<content>Content</content>');
  });

  it('should handle namespace inheritance correctly', () => {
    @xmld
    @namespace('base', 'http://example.com/base')
    class BaseXML {
      @namespace('base', 'http://example.com/base')
      @element
      baseElement!: string;
    }

    @xmld
    @root('derived:document')
    @namespace('derived', 'http://example.com/derived')
    class DerivedXML extends BaseXML {
      @namespace('derived', 'http://example.com/derived')
      @element
      derivedElement!: string;
    }

    const doc = new DerivedXML();
    doc.baseElement = 'base value';
    doc.derivedElement = 'derived value';

    const xml = toXML(doc);

    // Should include namespaces from both base and derived classes
    expect(xml).toContain('xmlns:base="http://example.com/base"');
    expect(xml).toContain('xmlns:derived="http://example.com/derived"');
    expect(xml).toContain('<base:baseElement>base value</base:baseElement>');
    expect(xml).toContain(
      '<derived:derivedElement>derived value</derived:derivedElement>'
    );
  });

  it('should support ADK-style inheritance: InterfaceXML extends OOXML extends BaseXML', () => {
    // Base class with common attributes
    @xmld
    class BaseXML {
      @attribute id!: string;
      @attribute version!: string;
    }

    // OO-specific class with OO namespace
    @xmld
    @namespace('oo', 'http://www.sap.com/adt/oo')
    class OOXML extends BaseXML {
      @namespace('oo', 'http://www.sap.com/adt/oo')
      @attribute
      type!: string;

      @namespace('oo', 'http://www.sap.com/adt/oo')
      @element
      description!: string;
    }

    // Interface-specific class with interface namespace
    @xmld
    @root('intf:abapInterface')
    @namespace('intf', 'http://www.sap.com/adt/oo/interfaces')
    class InterfaceXML extends OOXML {
      @namespace('intf', 'http://www.sap.com/adt/oo/interfaces')
      @element
      title!: string;
    }

    const intf = new InterfaceXML();
    intf.id = 'ZIF_TEST';
    intf.version = '1.0';
    intf.type = 'INTF/OI';
    intf.description = 'Test interface description';
    intf.title = 'Test Interface';

    const xml = toXML(intf);

    // Should include all inherited properties with correct namespaces
    expect(xml).toContain('intf:id="ZIF_TEST"'); // BaseXML property with class namespace
    expect(xml).toContain('intf:version="1.0"'); // BaseXML property with class namespace
    expect(xml).toContain('oo:type="INTF/OI"'); // OOXML property with explicit namespace
    expect(xml).toContain(
      '<oo:description>Test interface description</oo:description>'
    ); // OOXML element
    expect(xml).toContain('<intf:title>Test Interface</intf:title>'); // InterfaceXML element

    // Should include all namespaces from inheritance chain
    expect(xml).toContain('xmlns:oo="http://www.sap.com/adt/oo"');
    expect(xml).toContain('xmlns:intf="http://www.sap.com/adt/oo/interfaces"');

    // Should use correct root element
    expect(xml).toContain('<intf:abapInterface');
    expect(xml).toContain('</intf:abapInterface>');
  });
});
