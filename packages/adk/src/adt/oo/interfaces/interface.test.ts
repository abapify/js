import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Interface } from './interface';

describe('Interface', () => {
  let realXmlFixture: string;

  beforeEach(() => {
    // Load the real ADT XML fixture
    realXmlFixture = readFileSync(
      join(__dirname, '../../../../fixtures/zif_test.intf.xml'),
      'utf-8'
    );
  });

  describe('XML Parsing from Real ADT Fixture', () => {
    it('should parse Interface from real ADT XML', () => {
      const intf = Interface.fromAdtXml(realXmlFixture);

      // Verify adtcore attributes
      expect(intf.name).toBe('ZIF_PEPL_TEST_NESTED1');
      expect(intf.type).toBe('INTF/OI');
      expect(intf.description).toBe('Test PEPL iterface');
      expect(intf.masterLanguage).toBe('EN');
      expect(intf.responsible).toBe('CB9980003374');
      expect(intf.changedBy).toBe('CB9980003374');
      expect(intf.createdBy).toBe('CB9980003374');
      expect(intf.version).toBe('inactive');
      expect(intf.language).toBe('EN');

      // Verify dates
      expect(intf.changedAt).toEqual(new Date('2025-09-12T15:53:46Z'));
      expect(intf.createdAt).toEqual(new Date('2025-09-12T00:00:00Z'));
    });

    it('should parse abapsource attributes correctly', () => {
      const intf = Interface.fromAdtXml(realXmlFixture);

      expect(intf.sourceUri).toBe('source/main');
      expect(intf.fixPointArithmetic).toBe(false);
      expect(intf.activeUnicodeCheck).toBe(false);
    });

    it('should parse abapoo attributes correctly', () => {
      const intf = Interface.fromAdtXml(realXmlFixture);

      expect(intf.isModeled).toBe(false);
    });

    it('should parse package reference correctly', () => {
      const intf = Interface.fromAdtXml(realXmlFixture);

      expect(intf.packageRef).toBeDefined();
      expect(intf.packageRef?.name).toBe('ZPEPL_TEST');
      expect(intf.packageRef?.type).toBe('DEVC/K');
      expect(intf.packageRef?.uri).toBe('/sap/bc/adt/packages/zpepl_test');
    });

    it('should parse atom links correctly', () => {
      const intf = Interface.fromAdtXml(realXmlFixture);

      expect(intf.links).toHaveLength(6);

      // Check first link (versions)
      expect(intf.links[0].href).toBe('source/main/versions');
      expect(intf.links[0].rel).toBe(
        'http://www.sap.com/adt/relations/versions'
      );

      // Check source link with etag
      const sourceLink = intf.links.find(
        (link) =>
          link.rel === 'http://www.sap.com/adt/relations/source' &&
          link.type === 'text/plain'
      );
      expect(sourceLink).toBeDefined();
      expect(sourceLink?.etag).toBe('202509121553460001');
    });

    it('should parse syntax configuration correctly', () => {
      const intf = Interface.fromAdtXml(realXmlFixture);

      expect(intf.sections.syntaxConfiguration).toBeDefined();
      expect(intf.sections.syntaxConfiguration?.language.version).toBe(5);
      expect(intf.sections.syntaxConfiguration?.language.description).toBe(
        'ABAP for Cloud Development'
      );
    });
  });

  describe('XML Serialization', () => {
    it('should serialize Interface to XML matching ADT format', () => {
      const intf = Interface.fromAdtXml(realXmlFixture);
      const xml = intf.toAdtXml();

      // Verify XML structure
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<intf:abapInterface');
      expect(xml).toContain(
        'xmlns:intf="http://www.sap.com/adt/oo/interfaces"'
      );
      expect(xml).toContain('xmlns:abapoo="http://www.sap.com/adt/oo"');
      expect(xml).toContain(
        'xmlns:abapsource="http://www.sap.com/adt/abapsource"'
      );
      expect(xml).toContain('xmlns:adtcore="http://www.sap.com/adt/core"');

      // Verify attributes
      expect(xml).toContain('adtcore:name="ZIF_PEPL_TEST_NESTED1"');
      expect(xml).toContain('adtcore:type="INTF/OI"');
      expect(xml).toContain('abapoo:modeled="false"');
      expect(xml).toContain('abapsource:sourceUri="source/main"');
    });

    it('should include package reference in XML', () => {
      const intf = Interface.fromAdtXml(realXmlFixture);
      const xml = intf.toAdtXml();

      expect(xml).toContain('<adtcore:packageRef');
      expect(xml).toContain('adtcore:name="ZPEPL_TEST"');
      expect(xml).toContain('adtcore:type="DEVC/K"');
    });

    it('should include atom links in XML', () => {
      const intf = Interface.fromAdtXml(realXmlFixture);
      const xml = intf.toAdtXml();

      expect(xml).toContain('<atom:link');
      expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
      expect(xml).toContain('rel="http://www.sap.com/adt/relations/versions"');
    });

    it('should include syntax configuration in XML', () => {
      const intf = Interface.fromAdtXml(realXmlFixture);
      const xml = intf.toAdtXml();

      expect(xml).toContain('<abapsource:syntaxConfiguration>');
      expect(xml).toContain('<abapsource:language>');
      expect(xml).toContain('<abapsource:version>5</abapsource:version>');
      expect(xml).toContain(
        '<abapsource:description>ABAP for Cloud Development</abapsource:description>'
      );
    });
  });

  describe('Source Code Management', () => {
    it('should handle source code sections', () => {
      const intf = Interface.fromAdtXml(realXmlFixture);

      // Initially no source
      expect(intf.getSourceMain()).toBeUndefined();

      // Set source
      const sourceCode =
        'interface ZIF_PEPL_TEST_NESTED1 public.\nendinterface.';
      intf.setSourceMain(sourceCode);

      expect(intf.getSourceMain()).toBe(sourceCode);
    });
  });

  describe('Round-trip XML Processing', () => {
    it('should maintain data integrity through parse -> serialize -> parse cycle', () => {
      // Parse original XML
      const original = Interface.fromAdtXml(realXmlFixture);

      // Serialize to XML
      const serializedXml = original.toAdtXml();

      // Parse serialized XML
      const reparsed = Interface.fromAdtXml(serializedXml);

      // Verify key attributes are preserved
      expect(reparsed.name).toBe(original.name);
      expect(reparsed.type).toBe(original.type);
      expect(reparsed.description).toBe(original.description);
      expect(reparsed.sourceUri).toBe(original.sourceUri);
      expect(reparsed.isModeled).toBe(original.isModeled);
      expect(reparsed.packageRef?.name).toBe(original.packageRef?.name);
    });
  });

  describe('Constructor Variations', () => {
    it('should create Interface with unified input interface', () => {
      const input = {
        adtcore: {
          name: 'ZIF_TEST',
          type: 'INTF/OI',
          description: 'Test Interface',
          masterLanguage: 'EN',
          version: 'inactive' as const,
        },
        abapoo: { modeled: false },
        abapsource: { sourceUri: 'source/main' },
      };

      const intf = new Interface(input);

      expect(intf.name).toBe('ZIF_TEST');
      expect(intf.isModeled).toBe(false);
      expect(intf.sourceUri).toBe('source/main');
    });
  });
});
