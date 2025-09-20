import { describe, it, expect } from 'vitest';
import {
  xml,
  root,
  namespace,
  name,
  toXML,
  createNamespace,
} from '../../decorators/decorators-v2';
import { BaseXML } from './base-xml-v2';
import type { AdtCoreType } from '../../namespaces/adtcore';
import type { AtomLinkType } from '../../namespaces/atom';

// Test-only sample namespace - not part of main codebase
interface SampleAttributes {
  sampleId: string;
  enabled: boolean;
  priority?: number;
}

interface SampleElements {
  config?: {
    setting1: string;
    setting2: number;
  };
  items?: string[];
}

type SampleType = SampleAttributes & SampleElements;

const sample = createNamespace<SampleElements, SampleAttributes>({
  name: 'sample',
  uri: 'http://example.com/sample',
});

/**
 * SampleXML - Test implementation extending BaseXML
 * Demonstrates the architecture specification pattern
 */
@xml()
class SampleXML extends BaseXML {
  // Root element
  @root
  @namespace('sample')
  @name('testObject')
  rootElement: any = {};

  // Sample-specific namespace (only add what's unique to this object)
  @sample
  sampleData: SampleType;

  constructor(data: {
    core: AdtCoreType;
    atomLinks?: AtomLinkType[];
    sampleData: SampleType;
  }) {
    // Call super with base class data
    super({ core: data.core, atomLinks: data.atomLinks });
    this.sampleData = data.sampleData;
  }

  // Static parsing method following the spec
  static fromXMLString(xml: string): SampleXML {
    const parsed = BaseXML.parseXMLString(xml);
    const root = parsed['sample:testObject'];

    // Reuse base class parsers
    const core = BaseXML.parseAdtCoreAttributes(root);
    const atomLinks = BaseXML.parseAtomLinks(root);

    // Parse sample-specific data
    const sampleData: SampleType = {
      // Attributes (simple values)
      sampleId: root['@_sample:sampleId'],
      enabled: root['@_sample:enabled'] === 'true',
      priority: root['@_sample:priority']
        ? parseInt(root['@_sample:priority'])
        : undefined,

      // Elements (complex values)
      config: root['sample:config']
        ? {
            setting1: root['sample:config']['setting1'],
            setting2: parseInt(root['sample:config']['setting2']),
          }
        : undefined,
      items: root['sample:items']
        ? Array.isArray(root['sample:items'])
          ? root['sample:items']
          : [root['sample:items']]
        : undefined,
    };

    return new SampleXML({ core, atomLinks, sampleData });
  }
}

describe('BaseXML v2 Architecture', () => {
  describe('BaseXML Foundation', () => {
    it('should provide ADT Core attributes to all XML objects', () => {
      const sampleXML = new SampleXML({
        core: {
          name: 'TEST_SAMPLE',
          type: 'SAMPLE/OBJ',
          description: 'Test sample object',
          responsible: 'DEVELOPER',
        },
        sampleData: {
          sampleId: 'SAMPLE_001',
          enabled: true,
          priority: 5,
        },
      });

      expect(sampleXML.core.name).toBe('TEST_SAMPLE');
      expect(sampleXML.core.type).toBe('SAMPLE/OBJ');
      expect(sampleXML.core.description).toBe('Test sample object');
      expect(sampleXML.core.responsible).toBe('DEVELOPER');
    });

    it('should provide Atom links to all XML objects', () => {
      const atomLinks: AtomLinkType[] = [
        { href: 'source/main', rel: 'http://www.sap.com/adt/relations/source' },
        { href: 'versions', rel: 'http://www.sap.com/adt/relations/versions' },
      ];

      const sampleXML = new SampleXML({
        core: { name: 'TEST', type: 'SAMPLE/OBJ' },
        atomLinks,
        sampleData: { sampleId: 'TEST', enabled: true },
      });

      expect(sampleXML.link).toHaveLength(2);
      expect(sampleXML.link![0].href).toBe('source/main');
      expect(sampleXML.link![1].href).toBe('versions');
    });
  });

  describe('Smart Namespace Decorator', () => {
    it('should automatically detect attributes vs elements', () => {
      const sampleXML = new SampleXML({
        core: { name: 'TEST', type: 'SAMPLE/OBJ' },
        sampleData: {
          // Simple values → should become attributes
          sampleId: 'ATTR_TEST',
          enabled: true,
          priority: 10,

          // Complex values → should become elements
          config: {
            setting1: 'value1',
            setting2: 42,
          },
          items: ['item1', 'item2', 'item3'],
        },
      });

      const xml = toXML(sampleXML);
      const content = xml['sample:testObject'];

      // Check that simple values became attributes
      expect(content).toHaveProperty('@_sample:sampleId', 'ATTR_TEST');
      expect(content).toHaveProperty('@_sample:enabled', 'true');
      expect(content).toHaveProperty('@_sample:priority', '10');

      // Check that complex values became elements
      expect(content).toHaveProperty('sample:config');
      expect(content['sample:config']).toEqual({
        setting1: 'value1',
        setting2: '42', // XML serialization converts numbers to strings
      });
      expect(content).toHaveProperty('sample:items');
      expect(content['sample:items']).toEqual(['item1', 'item2', 'item3']);
    });
  });

  describe('XML Serialization', () => {
    it('should debug XML structure', () => {
      const sampleXML = new SampleXML({
        core: { name: 'DEBUG', type: 'SAMPLE/OBJ' },
        atomLinks: [{ href: 'test', rel: 'test-rel' }],
        sampleData: { sampleId: 'DEBUG', enabled: true },
      });

      const xml = toXML(sampleXML);

      // Test if atom:link is now correctly generated according to the specification
      expect(xml['sample:testObject']).toHaveProperty('atom:link');
      expect(xml['sample:testObject']['atom:link']).toEqual([
        {
          href: 'test',
          rel: 'test-rel',
        },
      ]);
    });

    it('should generate correct XML structure with all namespaces', () => {
      const sampleXML = new SampleXML({
        core: {
          name: 'ZSM_TEST',
          type: 'SAMPLE/OBJ',
          description: 'Test sample for XML generation',
          responsible: 'CB9980003374',
        },
        atomLinks: [
          {
            href: 'source/main',
            rel: 'http://www.sap.com/adt/relations/source',
            type: 'text/plain',
          },
        ],
        sampleData: {
          sampleId: 'XML_TEST',
          enabled: true,
          priority: 7,
          config: {
            setting1: 'test_value',
            setting2: 100,
          },
        },
      });

      const xml = toXML(sampleXML);
      const content = xml['sample:testObject'];

      // Verify base namespace elements are present (from BaseXML)
      expect(content).toHaveProperty('@_adtcore:name', 'ZSM_TEST');
      expect(content).toHaveProperty('@_adtcore:type', 'SAMPLE/OBJ');
      expect(content).toHaveProperty(
        '@_adtcore:description',
        'Test sample for XML generation'
      );
      expect(content).toHaveProperty('@_adtcore:responsible', 'CB9980003374');

      // Verify atom links are present (from BaseXML)
      expect(content).toHaveProperty('atom:link');
      expect(content['atom:link']).toEqual([
        {
          href: 'source/main',
          rel: 'http://www.sap.com/adt/relations/source',
          type: 'text/plain',
        },
      ]);

      // Verify sample namespace attributes and elements are present
      expect(content).toHaveProperty('@_sample:sampleId', 'XML_TEST');
      expect(content).toHaveProperty('@_sample:enabled', 'true');
      expect(content).toHaveProperty('@_sample:priority', '7');
      expect(content).toHaveProperty('sample:config');

      // Verify namespace declarations
      expect(content).toHaveProperty(
        '@_xmlns:sample',
        'http://example.com/sample'
      );
      expect(content).toHaveProperty(
        '@_xmlns:adtcore',
        'http://www.sap.com/adt/core'
      );
      expect(content).toHaveProperty(
        '@_xmlns:atom',
        'http://www.w3.org/2005/Atom'
      );
    });

    it('should serialize to valid XML string', () => {
      const sampleXML = new SampleXML({
        core: {
          name: 'ZSM_STRING_TEST',
          type: 'SAMPLE/OBJ',
        },
        sampleData: {
          sampleId: 'STRING_TEST',
          enabled: false,
        },
      });

      const xmlString = sampleXML.toXMLString();

      // Should contain XML declaration
      expect(xmlString).toContain('<?xml version="1.0" encoding="UTF-8"?>');

      // Should contain root element with namespaces
      expect(xmlString).toContain('<sample:testObject');
      expect(xmlString).toContain('xmlns:sample="http://example.com/sample"');
      expect(xmlString).toContain(
        'xmlns:adtcore="http://www.sap.com/adt/core"'
      );

      // Should contain attributes
      expect(xmlString).toContain('adtcore:name="ZSM_STRING_TEST"');
      expect(xmlString).toContain('sample:sampleId="STRING_TEST"');
      expect(xmlString).toContain('sample:enabled="false"');
    });
  });

  describe('XML Parsing', () => {
    it('should parse XML back to object correctly', () => {
      const originalXML = new SampleXML({
        core: {
          name: 'PARSE_TEST',
          type: 'SAMPLE/OBJ',
          description: 'Parse test object',
        },
        atomLinks: [{ href: 'test/link', rel: 'test-relation' }],
        sampleData: {
          sampleId: 'PARSE_001',
          enabled: true,
          priority: 3,
          config: {
            setting1: 'parsed_value',
            setting2: 999,
          },
        },
      });

      // Serialize to XML string
      const xmlString = originalXML.toXMLString();

      // Parse back to object
      const parsedXML = SampleXML.fromXMLString(xmlString);

      // Verify core attributes were parsed correctly
      expect(parsedXML.core.name).toBe('PARSE_TEST');
      expect(parsedXML.core.type).toBe('SAMPLE/OBJ');
      expect(parsedXML.core.description).toBe('Parse test object');

      // Verify atom links were parsed correctly
      expect(parsedXML.link).toHaveLength(1);
      expect(parsedXML.link![0].href).toBe('test/link');
      expect(parsedXML.link![0].rel).toBe('test-relation');

      // Verify sample data was parsed correctly
      expect(parsedXML.sampleData.sampleId).toBe('PARSE_001');
      expect(parsedXML.sampleData.enabled).toBe(true);
      expect(parsedXML.sampleData.priority).toBe(3);
      expect(parsedXML.sampleData.config?.setting1).toBe('parsed_value');
      expect(parsedXML.sampleData.config?.setting2).toBe(999);
    });
  });

  describe('Architecture Compliance', () => {
    it('should follow the specification pattern', () => {
      // This test verifies that our implementation follows the ADT XML Architecture Specification

      const sampleXML = new SampleXML({
        core: { name: 'SPEC_TEST', type: 'SAMPLE/OBJ' },
        sampleData: { sampleId: 'SPEC_001', enabled: true },
      });

      // 1. Should extend BaseXML
      expect(sampleXML).toBeInstanceOf(BaseXML);

      // 2. Should have @xml() decorator (verified by toXML working)
      expect(() => toXML(sampleXML)).not.toThrow();

      // 3. Should have root element defined
      const xml = toXML(sampleXML);
      expect(xml).toHaveProperty('sample:testObject');

      // 4. Should reuse base class parsers (verified by static methods existing)
      expect(typeof BaseXML.parseAdtCoreAttributes).toBe('function');
      expect(typeof BaseXML.parseAtomLinks).toBe('function');

      // 5. Should not duplicate common namespaces (adtcore and atom come from BaseXML)
      expect(sampleXML.core).toBeDefined(); // From BaseXML @adtcore
      expect(sampleXML.link).toBeDefined(); // From BaseXML @atom
      expect(sampleXML.sampleData).toBeDefined(); // From SampleXML @sample
    });
  });
});
