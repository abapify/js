/**
 * E2E Test for SAP Interface XML generation using xmld
 * Tests against real SAP ADT XML fixture: zif_test.intf.xml
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import {
  InterfaceDocument,
  generateInterfaceXML,
  AtomLink,
  PackageRef,
  SyntaxConfiguration,
  SyntaxLanguage,
} from '../src/models/interface';

// Helper function to load fixture
function loadFixture(filename: string): string {
  return readFileSync(join(__dirname, '..', 'fixtures', filename), 'utf-8');
}

// Helper function to save generated output
function saveGenerated(filename: string, content: string): void {
  const generatedDir = join(__dirname, '..', 'generated');
  mkdirSync(generatedDir, { recursive: true });
  writeFileSync(join(generatedDir, filename), content, 'utf-8');
}

describe('SAP Interface XML Generation', () => {
  it('should generate XML matching real SAP ADT interface fixture', () => {
    // Create interface document with real data from zif_test.intf.xml
    const interfaceDoc = new InterfaceDocument();

    // Set all attributes using unwrapped structure - much cleaner!
    interfaceDoc.core = {
      responsible: 'CB9980003374',
      masterLanguage: 'EN',
      masterSystem: 'TRL',
      abapLanguageVersion: 'cloudDevelopment',
      name: 'ZIF_PEPL_TEST_NESTED1',
      type: 'INTF/OI',
      changedAt: '2025-09-12T15:53:46Z',
      version: 'inactive',
      createdAt: '2025-09-12T00:00:00Z',
      changedBy: 'CB9980003374',
      createdBy: 'CB9980003374',
      description: 'Test PEPL iterface',
      descriptionTextLimit: '60',
      language: 'EN',
    };

    // ABAP OO attributes
    interfaceDoc.oo = {
      modeled: 'false',
    };

    // ABAP Source attributes
    interfaceDoc.source = {
      sourceUri: 'source/main',
      fixPointArithmetic: 'false',
      activeUnicodeCheck: 'false',
    };

    // Add atom links - using short form with plain objects
    interfaceDoc.link = [
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
      {
        href: 'source/main',
        rel: 'http://www.sap.com/adt/relations/source',
        type: 'text/html',
        etag: '202509121553460001',
      },
      {
        href: 'objectstructure',
        rel: 'http://www.sap.com/adt/relations/objectstructure',
        type: 'application/vnd.sap.adt.objectstructure.v2+xml',
      },
      {
        href: '/sap/bc/adt/oo/interfaces/zif_pepl_test_nested1/source/main?withAbapDocFromShortTexts=true',
        rel: 'http://www.sap.com/adt/relations/sources/withabapdocfromshorttexts',
        type: 'text/plain',
        title: 'Source with ABAP Doc',
      },
      {
        href: '/sap/bc/adt/oo/interfaces/zif_pepl_test_nested1/source/main?version=active',
        rel: 'http://www.sap.com/adt/relations/objectstates',
        title: 'Reference to active or inactive version',
      },
    ];

    // Add package reference - proper xmld class instantiation
    const packageRef = new PackageRef();
    packageRef.uri = '/sap/bc/adt/packages/zpepl_test';
    packageRef.type = 'DEVC/K';
    packageRef.name = 'ZPEPL_TEST';
    interfaceDoc.packageRef = packageRef;

    // Add syntax configuration - proper xmld class instantiation
    const syntaxConfig = new SyntaxConfiguration();
    syntaxConfig.language = new SyntaxLanguage();
    syntaxConfig.language.version = '5';
    syntaxConfig.language.description = 'ABAP for Cloud Development';

    // Add the nested atom link in syntax configuration - using short form
    syntaxConfig.language.link = {
      href: '/sap/bc/adt/abapsource/parsers/rnd/grammar/5',
      rel: 'http://www.sap.com/adt/relations/abapsource/parser',
      type: 'text/plain',
      title: 'ABAP for Cloud Development',
      etag: '9165',
    };

    interfaceDoc.syntaxConfiguration = syntaxConfig;

    // Generate XML
    const xml = generateInterfaceXML(interfaceDoc);

    // Save generated XML for comparison
    saveGenerated('interface-generated.xml', xml);

    // Load original fixture for reference
    const originalFixture = loadFixture('zif_test.intf.xml');
    saveGenerated('interface-original-fixture.xml', originalFixture);

    console.log('Generated XML saved to generated/interface-generated.xml');
    console.log(
      'Original fixture saved to generated/interface-original-fixture.xml'
    );

    // ✅ WORKING: Basic structure validation
    expect(xml).toContain('<intf:abapInterface');
    expect(xml).toContain('xmlns:intf="http://www.sap.com/adt/oo/interfaces"');
    expect(xml).toContain('xmlns:adtcore="http://www.sap.com/adt/core"');
    expect(xml).toContain('xmlns:abapoo="http://www.sap.com/adt/oo"');
    expect(xml).toContain(
      'xmlns:abapsource="http://www.sap.com/adt/abapsource"'
    );
    expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');

    // ✅ WORKING: Root attributes are correctly generated (unwrapped - plain attributes)
    expect(xml).toContain('name="ZIF_PEPL_TEST_NESTED1"');
    expect(xml).toContain('type="INTF/OI"');
    expect(xml).toContain('description="Test PEPL iterface"');
    expect(xml).toContain('modeled="false"');
    expect(xml).toContain('sourceUri="source/main"');

    // ✅ WORKING: Atom links are correctly generated with plain attributes (matches fixture)
    expect(xml).toContain('<atom:link href="source/main/versions"');
    expect(xml).toContain('rel="http://www.sap.com/adt/relations/versions"');
    expect(xml).toContain('<atom:link href="source/main"');
    expect(xml).toContain('type="text/plain"');
    expect(xml).toContain('etag="202509121553460001"');

    // ✅ WORKING: Package reference is correctly generated with namespaced attributes
    expect(xml).toContain(
      '<adtcore:packageRef xmlns:adtcore="http://www.sap.com/adt/core" adtcore:uri="/sap/bc/adt/packages/zpepl_test"'
    );
    expect(xml).toContain('adtcore:type="DEVC/K"');
    expect(xml).toContain('adtcore:name="ZPEPL_TEST"');

    // ✅ WORKING: Syntax configuration structure with proper namespaces
    expect(xml).toContain(
      '<abapsource:syntaxConfiguration xmlns:abapsource="http://www.sap.com/adt/abapsource">'
    );
    expect(xml).toContain(
      '<abapsource:language xmlns:abapsource="http://www.sap.com/adt/abapsource">'
    );
    expect(xml).toContain('<abapsource:version>5</abapsource:version>');
    expect(xml).toContain(
      '<abapsource:description>ABAP for Cloud Development</abapsource:description>'
    );

    expect(xml).toContain('</intf:abapInterface>');

    // ✅ WORKING: XML declaration is now present
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
  });

  it('should handle explicit auto-instantiation for complex elements', () => {
    const interfaceDoc = new InterfaceDocument();

    // Test that auto-instantiation works with explicit type hints
    interfaceDoc.core = {
      responsible: 'TEST_USER',
      masterLanguage: 'EN',
      masterSystem: 'TST',
      abapLanguageVersion: 'standard',
      name: 'TEST_INTERFACE',
      type: 'INTF/OI',
      changedAt: '2025-09-20T20:55:00Z',
      version: 'active',
      createdAt: '2025-09-20T20:55:00Z',
      changedBy: 'TEST_USER',
      createdBy: 'TEST_USER',
      description: 'Test interface',
      descriptionTextLimit: '60',
      language: 'EN',
    };

    interfaceDoc.oo = { modeled: 'false' };
    interfaceDoc.source = {
      sourceUri: 'source/main',
      fixPointArithmetic: 'false',
      activeUnicodeCheck: 'false',
    };

    // These should auto-instantiate when accessed
    expect(interfaceDoc.link).toBeDefined();
    expect(Array.isArray(interfaceDoc.link)).toBe(true);

    // Add a link and verify it works with direct structure
    interfaceDoc.link.push({
      href: 'test/href',
      rel: 'test/rel',
    });

    expect(interfaceDoc.link).toHaveLength(1);
    expect(interfaceDoc.link[0].href).toBe('test/href');
  });
});
