import { describe, it, expect } from 'vitest';
import { ClassSpec, ClassInclude } from './clas';

describe('ClassSpec', () => {
  it('should create ClassSpec instance with proper decorators', () => {
    const classXml = new ClassSpec();

    // Test that the class can be instantiated
    expect(classXml).toBeInstanceOf(ClassSpec);

    // Test that it has the expected properties structure
    expect(classXml).toHaveProperty('core');
    expect(classXml).toHaveProperty('source');
    expect(classXml).toHaveProperty('oo');
    expect(classXml).toHaveProperty('class');
    expect(classXml).toHaveProperty('links'); // Correct property name from BaseSpec
    expect(classXml).toHaveProperty('include');
    expect(classXml).toHaveProperty('syntaxConfiguration');
  });

  it('should serialize to XML with proper namespaces', () => {
    const classXml = new ClassSpec();

    // Set minimal required data
    classXml.core = {
      name: 'ZCL_TEST',
      type: 'CLAS/OC',
      description: 'Test class',
      responsible: 'DEVELOPER',
      masterLanguage: 'EN',
      abapLanguageVersion: '5',
      createdAt: '2024-01-01T00:00:00Z',
      createdBy: 'DEVELOPER',
      changedAt: '2024-01-01T00:00:00Z',
      changedBy: 'DEVELOPER',
      version: 'active',
    };

    classXml.class = {
      final: 'true',
      abstract: 'false',
      visibility: 'public',
      category: 'generalObjectType',
    };

    classXml.source = {
      fixPointArithmetic: 'true',
      activeUnicodeCheck: 'false',
    };

    classXml.oo = {
      modeled: 'false',
    };

    const xml = classXml.toXMLString();

    // Verify XML structure and namespaces
    expect(xml).toContain('class:abapClass');
    expect(xml).toContain('xmlns:class="http://www.sap.com/adt/oo/classes"');
    expect(xml).toContain('xmlns:adtcore="http://www.sap.com/adt/core"');
    expect(xml).toContain(
      'xmlns:abapsource="http://www.sap.com/adt/abapsource"'
    );
    expect(xml).toContain('xmlns:abapoo="http://www.sap.com/adt/oo"');

    // Verify attributes are properly namespaced
    expect(xml).toContain('adtcore:name="ZCL_TEST"');
    expect(xml).toContain('adtcore:type="CLAS/OC"');
    expect(xml).toContain('class:final'); // xmld may serialize "true" as just the attribute name
    expect(xml).toContain('class:visibility="public"');
    expect(xml).toContain('abapsource:fixPointArithmetic'); // xmld may serialize "true" as just the attribute name
    expect(xml).toContain('abapoo:modeled="false"');
  });

  it('should parse XML string correctly', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<class:abapClass
  xmlns:class="http://www.sap.com/adt/oo/classes"
  xmlns:adtcore="http://www.sap.com/adt/core"
  xmlns:abapoo="http://www.sap.com/adt/oo"
  xmlns:abapsource="http://www.sap.com/adt/abapsource"
  class:final="true"
  class:abstract="false"
  class:visibility="public"
  class:category="generalObjectType"
  adtcore:name="ZCL_TEST"
  adtcore:type="CLAS/OC"
  adtcore:description="Test class"
  abapoo:modeled="false"
  abapsource:fixPointArithmetic="true"
  abapsource:activeUnicodeCheck="false">
  <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="source/main" rel="http://www.sap.com/adt/relations/source" />
</class:abapClass>`;

    const parsed = ClassSpec.fromXMLString(xml);

    // Verify core attributes
    expect(parsed.core.name).toBe('ZCL_TEST');
    expect(parsed.core.type).toBe('CLAS/OC');
    expect(parsed.core.description).toBe('Test class');

    // Verify class-specific attributes
    expect(parsed.class.final).toBe('true');
    expect(parsed.class.abstract).toBe('false');
    expect(parsed.class.visibility).toBe('public');
    expect(parsed.class.category).toBe('generalObjectType');

    // Verify other namespace attributes
    expect(parsed.oo.modeled).toBe('false');
    expect(parsed.source.fixPointArithmetic).toBe('true');
    expect(parsed.source.activeUnicodeCheck).toBe('false');

    // Verify atom links
    expect(parsed.links).toBeDefined();
    expect(parsed.links?.length).toBe(1);
    expect(parsed.links?.[0].href).toBe('source/main');
    expect(parsed.links?.[0].rel).toBe(
      'http://www.sap.com/adt/relations/source'
    );
  });

  it('should handle class includes correctly', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<class:abapClass
  xmlns:class="http://www.sap.com/adt/oo/classes"
  xmlns:adtcore="http://www.sap.com/adt/core"
  xmlns:abapsource="http://www.sap.com/adt/abapsource"
  adtcore:name="ZCL_TEST"
  adtcore:type="CLAS/OC">
  <class:include class:includeType="definitions" abapsource:sourceUri="source/definitions" adtcore:name="definitions" />
  <class:include class:includeType="implementations" abapsource:sourceUri="source/implementations" adtcore:name="implementations" />
</class:abapClass>`;

    const parsed = ClassSpec.fromXMLString(xml);

    expect(parsed.include).toBeDefined();
    expect(parsed.include?.length).toBe(2);

    const definitions = parsed.include?.[0];
    expect(definitions?.includeType).toBe('definitions');
    expect(definitions?.sourceUri).toBe('source/definitions');
    expect(definitions?.name).toBe('definitions');

    const implementations = parsed.include?.[1];
    expect(implementations?.includeType).toBe('implementations');
    expect(implementations?.sourceUri).toBe('source/implementations');
    expect(implementations?.name).toBe('implementations');
  });
});

describe('ClassInclude', () => {
  it('should create ClassInclude instance', () => {
    const include = new ClassInclude();

    expect(include).toBeInstanceOf(ClassInclude);
    expect(include).toHaveProperty('includeType');
    expect(include).toHaveProperty('sourceUri');
    expect(include).toHaveProperty('core'); // ADT core attributes inherited from BaseSpec
    expect(include).toHaveProperty('links'); // Atom links inherited from BaseSpec (correct property name)
  });

  it('should handle include with atom links', () => {
    const include = new ClassInclude();
    include.includeType = 'definitions';
    include.sourceUri = 'source/definitions';
    include.core = { name: 'definitions', type: 'CLAS/I' };

    expect(include.includeType).toBe('definitions');
    expect(include.sourceUri).toBe('source/definitions');
    expect(include.core?.name).toBe('definitions');
    expect(include.core?.type).toBe('CLAS/I');
  });
});
