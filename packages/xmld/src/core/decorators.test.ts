/**
 * Tests for xmld decorators
 * Testing one feature at a time as requested
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  xmld,
  root,
  element,
  attribute,
  unwrap,
  namespace,
} from './decorators';
import {
  getClassMetadata,
  getPropertyMetadata,
  clearAllMetadata,
  getAllRegisteredXMLClasses,
} from './metadata';
import { toXML, toSerializationData } from '../serialization/serializer';
import { toFastXMLObject, toFastXML } from '../plugins/fast-xml-parser';

describe('xmld decorators', () => {
  beforeEach(() => {
    clearAllMetadata();
  });

  describe('@xml decorator', () => {
    it('should mark class as XML-enabled', () => {
      @xmld
      class TestClass {}

      const metadata = getClassMetadata(TestClass.prototype);
      expect(metadata?.isXMLClass).toBe(true);
    });

    it('should register class in global registry', () => {
      @xmld
      class TestClass {}

      const registry = getAllRegisteredXMLClasses();
      expect(registry.has('TestClass')).toBe(true);
      expect(registry.get('TestClass')).toBe(TestClass);
    });
  });

  describe('@root decorator', () => {
    it('should set XML root element name', () => {
      @root('testElement')
      class TestClass {}

      const metadata = getClassMetadata(TestClass.prototype);
      expect(metadata?.xmlRoot).toBe('testElement');
    });

    it('should throw error for empty element name', () => {
      expect(() => {
        @root('')
        class TestClass {}
      }).toThrow();
    });

    it('should work with @xml decorator', () => {
      @xmld
      @root('document')
      class Document {}

      const metadata = getClassMetadata(Document.prototype);
      expect(metadata?.isXMLClass).toBe(true);
      expect(metadata?.xmlRoot).toBe('document');
    });
  });

  describe('@element decorator', () => {
    it('should mark property as element', () => {
      class TestClass {
        @element
        title!: string;
      }

      const metadata = getPropertyMetadata(TestClass.prototype, 'title');
      expect(metadata?.type).toBe('element');
      expect(metadata?.name).toBe('title');
    });

    it('should not affect non-decorated properties', () => {
      class TestClass {
        @element
        title!: string;

        // Not decorated - should be ignored
        internal!: string;
      }

      const titleMetadata = getPropertyMetadata(TestClass.prototype, 'title');
      const internalMetadata = getPropertyMetadata(
        TestClass.prototype,
        'internal'
      );

      expect(titleMetadata?.type).toBe('element');
      expect(internalMetadata).toBeUndefined();
    });
  });

  describe('@attribute decorator', () => {
    it('should mark property as attribute', () => {
      class TestClass {
        @attribute
        id!: string;
      }

      const metadata = getPropertyMetadata(TestClass.prototype, 'id');
      expect(metadata?.type).toBe('attribute');
      expect(metadata?.name).toBe('id');
    });
  });

  describe('@unwrap decorator', () => {
    it('should mark property for unwrapping', () => {
      class TestClass {
        @unwrap
        meta!: any;
      }

      const metadata = getPropertyMetadata(TestClass.prototype, 'meta');
      expect(metadata?.unwrap).toBe(true);
    });

    it('should work with @element decorator', () => {
      class TestClass {
        @unwrap
        @element
        meta!: any;
      }

      const metadata = getPropertyMetadata(TestClass.prototype, 'meta');
      expect(metadata?.unwrap).toBe(true);
      expect(metadata?.type).toBe('element');
    });

    it('should work with @attribute decorator', () => {
      class TestClass {
        @unwrap
        @attribute
        attrs!: any;
      }

      const metadata = getPropertyMetadata(TestClass.prototype, 'attrs');
      expect(metadata?.unwrap).toBe(true);
      expect(metadata?.type).toBe('attribute');
    });
  });

  describe('@namespace decorator', () => {
    it('should set namespace on class', () => {
      @namespace('test', 'http://example.com/test')
      class TestClass {}

      const metadata = getClassMetadata(TestClass.prototype);
      expect(metadata?.namespace?.prefix).toBe('test');
      expect(metadata?.namespace?.uri).toBe('http://example.com/test');
    });

    it('should set namespace on property', () => {
      class TestClass {
        @namespace('dc', 'http://purl.org/dc/elements/1.1/')
        @element
        creator!: string;
      }

      const metadata = getPropertyMetadata(TestClass.prototype, 'creator');
      expect(metadata?.namespace?.prefix).toBe('dc');
      expect(metadata?.namespace?.uri).toBe('http://purl.org/dc/elements/1.1/');
    });

    it('should throw error for invalid namespace', () => {
      expect(() => {
        @namespace('', 'http://example.com')
        class TestClass {}
      }).toThrow();

      expect(() => {
        @namespace('test', '')
        class TestClass {}
      }).toThrow();
    });
  });

  describe('Auto-instantiation', () => {
    it('should setup explicit auto-instantiation for arrays', () => {
      @xmld
      class Item {
        @element
        title!: string;
      }

      @xmld
      class Feed {
        @element({ type: Item, array: true })
        items: Item[] = [];
      }

      const feed = new Feed();
      const metadata = getPropertyMetadata(Feed.prototype, 'items');

      expect(metadata?.autoInstantiate).toBe(Item);
      expect(metadata?.isArray).toBe(true);
    });

    it('should setup explicit auto-instantiation for objects', () => {
      @xmld
      class Author {
        @element
        name!: string;
      }

      @xmld
      class Document {
        @element({ type: Author })
        author!: Author;
      }

      const doc = new Document();
      const metadata = getPropertyMetadata(Document.prototype, 'author');

      expect(metadata?.autoInstantiate).toBe(Author);
      expect(metadata?.isArray).toBe(false);
    });

    it('should not setup auto-instantiation without explicit type', () => {
      @xmld
      class Author {
        @element
        name!: string;
      }

      @xmld
      class Document {
        @element
        author!: Author; // No explicit type - no auto-instantiation
      }

      const doc = new Document();
      const metadata = getPropertyMetadata(Document.prototype, 'author');

      expect(metadata?.autoInstantiate).toBeUndefined();
      expect(metadata?.isArray).toBeUndefined();
    });

    it('should validate that type is @xmld decorated', () => {
      // Regular class without @xmld
      class RegularClass {
        name!: string;
      }

      @xmld
      class Document {
        @element({ type: RegularClass })
        data!: RegularClass;
      }

      const doc = new Document();
      const metadata = getPropertyMetadata(Document.prototype, 'data');

      // Should not set up auto-instantiation for non-@xmld classes
      expect(metadata?.autoInstantiate).toBeUndefined();
    });
  });

  describe('Integration tests', () => {
    it('should create complete XML structure', () => {
      interface MetaInfo {
        title: string;
        author: string;
      }

      @xmld
      @root('document')
      class Document {
        @attribute
        id!: string;

        @unwrap
        @element
        meta!: MetaInfo;

        @element
        content!: string;
      }

      const doc = new Document();
      doc.id = '123';
      doc.meta = { title: 'Test Document', author: 'John Doe' };
      doc.content = 'Document content';

      const xml = toXML(doc);

      // Should contain root element with attribute
      expect(xml).toContain('<document id="123"');
      // Should contain unwrapped meta elements
      expect(xml).toContain('<title>Test Document</title>');
      expect(xml).toContain('<author>John Doe</author>');
      // Should contain content element
      expect(xml).toContain('<content>Document content</content>');
    });

    it('should handle namespaced elements', () => {
      @xmld
      @root('feed')
      @namespace('atom', 'http://www.w3.org/2005/Atom')
      class AtomFeed {
        @element
        id!: string;

        @namespace('dc', 'http://purl.org/dc/elements/1.1/')
        @element
        creator!: string;
      }

      const feed = new AtomFeed();
      feed.id = 'feed-123';
      feed.creator = 'John Doe';

      const xml = toXML(feed);

      // Should contain namespace declarations
      expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
      expect(xml).toContain('xmlns:dc="http://purl.org/dc/elements/1.1/"');
      // Should contain namespaced elements
      expect(xml).toContain('<atom:id>feed-123</atom:id>');
      expect(xml).toContain('<dc:creator>John Doe</dc:creator>');
    });

    it('should handle nested classes with namespaces', () => {
      // This is the failing scenario from our SAP e2e test
      @xmld
      @root('abapsource:language')
      @namespace('abapsource', 'http://www.sap.com/adt/abapsource')
      class SyntaxLanguage {
        @namespace('abapsource', 'http://www.sap.com/adt/abapsource')
        @element
        version!: string;

        @namespace('abapsource', 'http://www.sap.com/adt/abapsource')
        @element
        description!: string;
      }

      @xmld
      @root('abapsource:syntaxConfiguration')
      @namespace('abapsource', 'http://www.sap.com/adt/abapsource')
      class SyntaxConfiguration {
        @element({ type: SyntaxLanguage })
        language!: SyntaxLanguage;
      }

      const config = new SyntaxConfiguration();
      config.language = new SyntaxLanguage();
      config.language.version = '5';
      config.language.description = 'ABAP for Cloud Development';

      const xml = toXML(config);

      console.log('Generated XML for nested namespaces:', xml);

      // Should contain namespace declarations
      expect(xml).toContain(
        'xmlns:abapsource="http://www.sap.com/adt/abapsource"'
      );

      // Root element should have namespace prefix
      expect(xml).toContain('<abapsource:syntaxConfiguration');

      // Nested class root should have namespace prefix
      expect(xml).toContain('<abapsource:language');

      // 🚨 THIS IS THE FAILING PART - nested elements should have namespace prefixes
      expect(xml).toContain('<abapsource:version>5</abapsource:version>');
      expect(xml).toContain(
        '<abapsource:description>ABAP for Cloud Development</abapsource:description>'
      );
    });

    it('should handle atom:link elements with attributes correctly', () => {
      @xmld
      @root('atom:link')
      @namespace('atom', 'http://www.w3.org/2005/Atom')
      class AtomLink {
        @attribute
        href!: string;

        @attribute
        rel!: string;

        @attribute
        type?: string;

        @attribute
        etag?: string;
      }

      @xmld
      @root('test:document')
      @namespace('test', 'http://example.com/test')
      class TestDocument {
        @element({ type: AtomLink, array: true })
        links: AtomLink[] = [];
      }

      const doc = new TestDocument();

      // Direct array assignment with auto-instantiation
      doc.links = [
        {
          href: 'source/main/versions',
          rel: 'http://www.sap.com/adt/relations/versions',
        },
        {
          href: 'source/main',
          rel: 'http://www.sap.com/adt/relations/source',
          type: 'text/plain',
          etag: '202509121553460001',
        },
      ];

      const xml = toXML(doc);

      // Should contain proper atom:link elements with namespaced attributes (xmld behavior)
      expect(xml).toContain(
        '<atom:link xmlns:atom="http://www.w3.org/2005/Atom" atom:href="source/main/versions" atom:rel="http://www.sap.com/adt/relations/versions"'
      );
      expect(xml).toContain(
        '<atom:link xmlns:atom="http://www.w3.org/2005/Atom" atom:href="source/main" atom:rel="http://www.sap.com/adt/relations/source" atom:type="text/plain" atom:etag="202509121553460001"'
      );
    });

    it('should handle deeply nested namespaces', () => {
      @xmld
      @root('atom:link')
      @namespace('atom', 'http://www.w3.org/2005/Atom')
      class AtomLink {
        @attribute
        href!: string;

        @attribute
        rel!: string;
      }

      @xmld
      @root('abapsource:language')
      @namespace('abapsource', 'http://www.sap.com/adt/abapsource')
      class SyntaxLanguage {
        @namespace('abapsource', 'http://www.sap.com/adt/abapsource')
        @element
        version!: string;

        @element({ type: AtomLink })
        link?: AtomLink;
      }

      @xmld
      @root('abapsource:syntaxConfiguration')
      @namespace('abapsource', 'http://www.sap.com/adt/abapsource')
      class SyntaxConfiguration {
        @element({ type: SyntaxLanguage })
        language!: SyntaxLanguage;
      }

      const config = new SyntaxConfiguration();
      config.language = new SyntaxLanguage();
      config.language.version = '5';
      config.language.link = new AtomLink();
      config.language.link.href = '/test/url';
      config.language.link.rel = 'test-relation';

      const xml = toXML(config);

      console.log('Generated XML for deeply nested namespaces:', xml);

      // Should handle multiple namespaces correctly
      expect(xml).toContain(
        'xmlns:abapsource="http://www.sap.com/adt/abapsource"'
      );
      expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');

      // All elements should have correct namespace prefixes
      expect(xml).toContain('<abapsource:syntaxConfiguration');
      expect(xml).toContain('<abapsource:language');
      expect(xml).toContain('<abapsource:version>5</abapsource:version>');
      expect(xml).toContain(
        '<atom:link xmlns:atom="http://www.w3.org/2005/Atom" atom:href="/test/url" atom:rel="test-relation"'
      );
    });
  });

  describe('Zero-dependency transformations', () => {
    it('should extract SerializationData without dependencies', () => {
      @xmld
      @root('test:document')
      @namespace('test', 'http://example.com/test')
      class TestDocument {
        @attribute
        id!: string;

        @element
        title!: string;
      }

      const doc = new TestDocument();
      doc.id = '123';
      doc.title = 'Test Document';

      const data = toSerializationData(doc);

      expect(data.rootElement).toBe('test:document');
      expect(data.namespaces.get('test')).toBe('http://example.com/test');
      expect(data.attributes['test:id']).toBe('123');
      expect(data.elements['test:title']).toBe('Test Document');
    });

    it('should transform to fast-xml-parser compatible object', () => {
      @xmld
      @root('test:document')
      @namespace('test', 'http://example.com/test')
      class TestDocument {
        @attribute
        id!: string;

        @element
        title!: string;
      }

      const doc = new TestDocument();
      doc.id = '123';
      doc.title = 'Test Document';

      const data = toSerializationData(doc);
      const fastXMLObject = toFastXMLObject(data);

      expect(fastXMLObject).toEqual({
        'test:document': {
          '@_xmlns:test': 'http://example.com/test',
          '@_test:id': '123',
          'test:title': 'Test Document',
        },
      });
    });

    it('should work with the convenience toFastXML function', () => {
      @xmld
      @root('test:document')
      @namespace('test', 'http://example.com/test')
      class TestDocument {
        @attribute
        id!: string;

        @element
        title!: string;
      }

      const doc = new TestDocument();
      doc.id = '123';
      doc.title = 'Test Document';

      const fastXMLObject = toFastXML(doc);

      expect(fastXMLObject).toEqual({
        'test:document': {
          '@_xmlns:test': 'http://example.com/test',
          '@_test:id': '123',
          'test:title': 'Test Document',
        },
      });
    });

    it('should handle nested classes correctly', () => {
      @xmld
      @root('abapsource:language')
      @namespace('abapsource', 'http://www.sap.com/adt/abapsource')
      class SyntaxLanguage {
        @namespace('abapsource', 'http://www.sap.com/adt/abapsource')
        @element
        version!: string;

        @namespace('abapsource', 'http://www.sap.com/adt/abapsource')
        @element
        description!: string;
      }

      @xmld
      @root('abapsource:syntaxConfiguration')
      @namespace('abapsource', 'http://www.sap.com/adt/abapsource')
      class SyntaxConfiguration {
        @element({ type: SyntaxLanguage })
        language!: SyntaxLanguage;
      }

      const config = new SyntaxConfiguration();
      config.language = new SyntaxLanguage();
      config.language.version = '5';
      config.language.description = 'ABAP for Cloud Development';

      const fastXMLObject = toFastXML(config);

      expect(fastXMLObject).toEqual({
        'abapsource:syntaxConfiguration': {
          '@_xmlns:abapsource': 'http://www.sap.com/adt/abapsource',
          'abapsource:language': {
            '@_xmlns:abapsource': 'http://www.sap.com/adt/abapsource',
            'abapsource:version': '5',
            'abapsource:description': 'ABAP for Cloud Development',
          },
        },
      });
    });
  });
});
