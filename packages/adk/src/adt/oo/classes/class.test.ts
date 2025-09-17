import { describe, it, expect, beforeEach } from 'vitest';
import { Class } from './class';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Class', () => {
  let realXmlFixture: string;

  beforeEach(() => {
    // Load real ADT XML fixture
    realXmlFixture = readFileSync(
      join(__dirname, '../../../../fixtures/zcl_test.clas.xml'),
      'utf-8'
    );
  });

  describe('XML Parsing from Real ADT Fixture', () => {
    it('should parse Class from real ADT XML', () => {
      const cls = Class.fromAdtXml(realXmlFixture);

      // Verify adtcore attributes
      expect(cls.name).toBe('ZCL_PEPL_TEST2');
      expect(cls.type).toBe('CLAS/OC');
      expect(cls.description).toBe('PEPL test class');
      expect(cls.masterLanguage).toBe('EN');
      expect(cls.responsible).toBe('CB9980003374');
      expect(cls.changedBy).toBe('CB9980003374');
      expect(cls.createdBy).toBe('CB9980003374');
      expect(cls.version).toBe('inactive');
      expect(cls.language).toBe('EN');

      // Verify dates
      expect(cls.changedAt).toEqual(new Date('2025-09-12T20:06:49Z'));
      expect(cls.createdAt).toEqual(new Date('2025-09-12T00:00:00Z'));
    });

    it('should parse abapsource attributes correctly', () => {
      const cls = Class.fromAdtXml(realXmlFixture);

      expect(cls.sourceUri).toBeUndefined(); // Classes don't have a single sourceUri
      expect(cls.fixPointArithmetic).toBe(true);
      expect(cls.activeUnicodeCheck).toBe(false);
    });

    it('should parse class-specific attributes correctly', () => {
      const cls = Class.fromAdtXml(realXmlFixture);

      expect(cls.final).toBe(true);
      expect(cls.abstract).toBe(false);
      expect(cls.visibility).toBe('public');
      expect(cls.category).toBe('generalObjectType');
      expect(cls.hasTests).toBe(false);
      expect(cls.sharedMemoryEnabled).toBe(false);
    });

    it('should parse class includes correctly', () => {
      const cls = Class.fromAdtXml(realXmlFixture);

      expect(cls.includes).toHaveLength(5);

      // Check definitions include
      const definitionsInclude = cls.includes.find(
        (inc) => inc.includeType === 'definitions'
      );
      expect(definitionsInclude).toBeDefined();
      expect(definitionsInclude?.sourceUri).toBe('includes/definitions');
      expect(definitionsInclude?.type).toBe('CLAS/I');

      // Check main include
      const mainInclude = cls.includes.find(
        (inc) => inc.includeType === 'main'
      );
      expect(mainInclude).toBeDefined();
      expect(mainInclude?.sourceUri).toBe('source/main');

      // Check implementations include
      const implInclude = cls.includes.find(
        (inc) => inc.includeType === 'implementations'
      );
      expect(implInclude).toBeDefined();
      expect(implInclude?.sourceUri).toBe('includes/implementations');
    });

    it('should parse abapoo attributes correctly', () => {
      const cls = Class.fromAdtXml(realXmlFixture);

      expect(cls.isModeled).toBe(false);
    });

    it('should parse package reference correctly', () => {
      const cls = Class.fromAdtXml(realXmlFixture);

      expect(cls.packageRef).toBeDefined();
      expect(cls.packageRef?.name).toBe('ZPEPL_TEST');
      expect(cls.packageRef?.type).toBe('DEVC/K');
      expect(cls.packageRef?.uri).toBe('/sap/bc/adt/packages/zpepl_test');
    });

    it('should parse atom links correctly', () => {
      const cls = Class.fromAdtXml(realXmlFixture);

      expect(cls.links).toHaveLength(6);

      // Check enhancement options link
      const enhancementLink = cls.links.find(
        (link) =>
          link.rel ===
          'http://www.sap.com/adt/relations/enhancementOptionsOfMainObject'
      );
      expect(enhancementLink).toBeDefined();
      expect(enhancementLink?.href).toBe(
        '/sap/bc/adt/oo/classes/zcl_pepl_test2/enhancements/options'
      );

      // Check object structure link
      const structureLink = cls.links.find(
        (link) =>
          link.rel === 'http://www.sap.com/adt/relations/objectstructure'
      );
      expect(structureLink).toBeDefined();
      expect(structureLink?.href).toBe('objectstructure');
    });

    it('should parse syntax configuration correctly', () => {
      const cls = Class.fromAdtXml(realXmlFixture);

      // Note: Classes don't have syntaxConfiguration in sections like interfaces do
      // The syntax configuration is embedded in the class XML but not parsed into sections
      expect(cls.sections.syntaxConfiguration).toBeUndefined();
    });
  });

  describe('XML Serialization', () => {
    it('should serialize Class to XML matching ADT format', () => {
      const cls = Class.fromAdtXml(realXmlFixture);
      const xml = cls.toAdtXml();

      // Verify XML structure
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<class:abapClass');
      expect(xml).toContain('xmlns:class="http://www.sap.com/adt/oo/classes"');
      expect(xml).toContain('xmlns:abapoo="http://www.sap.com/adt/oo"');
      expect(xml).toContain(
        'xmlns:abapsource="http://www.sap.com/adt/abapsource"'
      );
      expect(xml).toContain('xmlns:adtcore="http://www.sap.com/adt/core"');

      // Verify attributes
      expect(xml).toContain('adtcore:name="ZCL_PEPL_TEST2"');
      expect(xml).toContain('adtcore:type="CLAS/OC"');
      expect(xml).toContain('abapoo:modeled="false"');
      expect(xml).toContain('class:final="true"');
      expect(xml).toContain('class:abstract="false"');
      expect(xml).toContain('class:visibility="public"');
    });

    it('should include package reference in XML', () => {
      const cls = Class.fromAdtXml(realXmlFixture);
      const xml = cls.toAdtXml();

      expect(xml).toContain('<adtcore:packageRef');
      expect(xml).toContain('adtcore:name="ZPEPL_TEST"');
      expect(xml).toContain('adtcore:type="DEVC/K"');
    });

    it('should include atom links in XML', () => {
      const cls = Class.fromAdtXml(realXmlFixture);
      const xml = cls.toAdtXml();

      expect(xml).toContain('<atom:link');
      expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
      expect(xml).toContain('rel="http://www.sap.com/adt/relations/versions"');
    });

    it('should include class includes in XML', () => {
      const cls = Class.fromAdtXml(realXmlFixture);
      const xml = cls.toAdtXml();

      expect(xml).toContain('<class:include');
      expect(xml).toContain('class:includeType="definitions"');
      expect(xml).toContain('class:includeType="implementations"');
      expect(xml).toContain('class:includeType="main"');
      expect(xml).toContain('abapsource:sourceUri="includes/definitions"');
      expect(xml).toContain('abapsource:sourceUri="source/main"');
    });
  });

  describe('Source Code Management', () => {
    it('should handle source code sections', () => {
      const cls = Class.fromAdtXml(realXmlFixture);

      // Classes don't have getSourceMain/setSourceMain methods like interfaces
      // Source code is managed through the includes structure
      expect(cls.includes).toHaveLength(5);

      // Check that main include exists
      const mainInclude = cls.includes.find(
        (inc) => inc.includeType === 'main'
      );
      expect(mainInclude).toBeDefined();
      expect(mainInclude?.sourceUri).toBe('source/main');
    });
  });

  describe('Round-trip XML Processing', () => {
    it('should maintain data integrity through parse -> serialize -> parse cycle', () => {
      // Parse original XML
      const original = Class.fromAdtXml(realXmlFixture);

      // Serialize to XML
      const serializedXml = original.toAdtXml();

      // Parse serialized XML
      const reparsed = Class.fromAdtXml(serializedXml);

      // Verify key attributes are preserved
      expect(reparsed.name).toBe(original.name);
      expect(reparsed.type).toBe(original.type);
      expect(reparsed.description).toBe(original.description);
      expect(reparsed.final).toBe(original.final);
      expect(reparsed.abstract).toBe(original.abstract);
      expect(reparsed.visibility).toBe(original.visibility);
      expect(reparsed.isModeled).toBe(original.isModeled);
      expect(reparsed.packageRef?.name).toBe(original.packageRef?.name);
      expect(reparsed.includes).toHaveLength(original.includes.length);
    });
  });

  describe('Constructor Variations', () => {
    it('should create Class with unified input interface', () => {
      const input = {
        adtcore: {
          name: 'ZCL_TEST',
          type: 'CLAS/OC',
          description: 'Test Class',
          masterLanguage: 'EN',
          version: 'inactive' as const,
        },
        abapoo: { modeled: false },
        abapsource: { sourceUri: '' },
        class: {
          final: false,
          abstract: false,
          visibility: 'public' as const,
          category: 'generalObjectType',
          hasTests: false,
          sharedMemoryEnabled: false,
        },
        sections: {
          includes: [],
        },
      };

      const cls = new Class(input);

      expect(cls.name).toBe('ZCL_TEST');
      expect(cls.isModeled).toBe(false);
      expect(cls.final).toBe(false);
      expect(cls.visibility).toBe('public');
    });
  });
});
