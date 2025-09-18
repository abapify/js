import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';
import {
  XMLRoot,
  attributes,
  adtcore,
  abapoo,
  abapsource,
  atom,
  toXML,
} from './decorators.js';
import type { AdtCoreType, PackageRefType } from '../namespaces/adtcore.js';
import type { AbapOOType } from '../namespaces/abapoo.js';
import type {
  AbapSourceType,
  SyntaxConfigurationType,
} from '../namespaces/abapsource.js';
import type { AtomLinkType } from '../namespaces/atom.js';

// Test interface definition using decorators
@XMLRoot('intf:abapInterface')
class TestInterfaceDefinition {
  @adtcore
  @attributes
  core: AdtCoreType;

  @abapoo
  @attributes
  oo: AbapOOType;

  @abapsource
  @attributes
  source: AbapSourceType;

  @atom
  links?: AtomLinkType[];

  @adtcore
  packageRef?: PackageRefType;

  @abapsource
  syntaxConfiguration?: SyntaxConfigurationType;

  toXML() {
    return toXML(this);
  }
}

describe('Decorator-based XML Generation', () => {
  it('should generate XML structure with pure decorator approach', () => {
    // Pure decorator-driven usage - no factory methods!
    const intf = new TestInterfaceDefinition();

    // Set properties directly - decorators handle composition
    intf.core = {
      name: 'ZIF_PEPL_TEST_NESTED1',
      type: 'INTF/OI',
      description: 'Test PEPL iterface',
      responsible: 'CB9980003374',
      masterLanguage: 'EN',
      masterSystem: 'TRL',
      abapLanguageVersion: 'cloudDevelopment',
      changedAt: new Date('2025-09-12T15:53:46Z'),
      createdAt: new Date('2025-09-12T00:00:00Z'),
      changedBy: 'CB9980003374',
      createdBy: 'CB9980003374',
      version: 'inactive',
      descriptionTextLimit: 60,
      language: 'EN',
    };

    intf.oo = {
      modeled: false,
    };

    intf.source = {
      sourceUri: 'source/main',
      fixPointArithmetic: false,
      activeUnicodeCheck: false,
    };

    intf.packageRef = {
      uri: '/sap/bc/adt/packages/zpepl_test',
      type: 'DEVC/K',
      name: 'ZPEPL_TEST',
    };

    intf.links = [
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

    // Decorators automatically handle the XML composition!
    const xml = intf.toXML();

    // Verify structure
    expect(xml).toHaveProperty('intf:abapInterface');

    const content = xml['intf:abapInterface'];

    // Check attributes (from @attributes decorator)
    expect(content).toHaveProperty('adtcore:name', 'ZIF_PEPL_TEST_NESTED1');
    expect(content).toHaveProperty('adtcore:type', 'INTF/OI');
    expect(content).toHaveProperty('abapoo:modeled', 'false');
    expect(content).toHaveProperty('abapsource:sourceUri', 'source/main');
    expect(content).toHaveProperty('abapsource:fixPointArithmetic', 'false');

    // Check elements (from @atom and @adtcoreElement decorators)
    expect(content).toHaveProperty('atom:link');
    expect(content['atom:link']).toHaveLength(2);
    expect(content).toHaveProperty('adtcore:packageRef');
    expect(content['adtcore:packageRef']).toHaveProperty(
      'adtcore:name',
      'ZPEPL_TEST'
    );

    console.log('Generated XML structure:', JSON.stringify(xml, null, 2));
  });

  it('should demonstrate clean decorator syntax', () => {
    // This shows how clean the decorator approach is
    const intf = new TestInterfaceDefinition();

    // Just set the properties - decorators do the work!
    intf.core = { name: 'ZIF_SIMPLE', type: 'INTF/OI' };
    intf.oo = { modeled: true };
    intf.source = { sourceUri: 'source/main' };

    const xml = intf.toXML();

    expect(xml['intf:abapInterface']).toMatchObject({
      'adtcore:name': 'ZIF_SIMPLE',
      'adtcore:type': 'INTF/OI',
      'abapoo:modeled': 'true',
      'abapsource:sourceUri': 'source/main',
    });

    // 🎯 CHECK: xmlns declarations are now included!
    const content = xml['intf:abapInterface'];
    expect(content).toHaveProperty(
      '@_xmlns:intf',
      'http://www.sap.com/adt/oo/interfaces'
    );
    expect(content).toHaveProperty(
      '@_xmlns:adtcore',
      'http://www.sap.com/adt/core'
    );
    expect(content).toHaveProperty(
      '@_xmlns:abapoo',
      'http://www.sap.com/adt/oo'
    );
    expect(content).toHaveProperty(
      '@_xmlns:abapsource',
      'http://www.sap.com/adt/abapsource'
    );

    console.log('XML with xmlns declarations:', JSON.stringify(xml, null, 2));
  });

  it('should round-trip with fixture XML (BRAVE TEST!)', () => {
    // 🚀 CHALLENGE: Parse fixture XML → Create decorator class → Generate XML → Compare!

    // 1. Read and parse the fixture XML
    const fixturePath =
      '/workspaces/abapify-js/packages/adk/fixtures/zif_test.intf.xml';
    const xmlContent = readFileSync(fixturePath, 'utf-8');

    const parser = new XMLParser({
      ignoreAttributes: false,
      parseAttributeValue: false, // Keep as strings to avoid conversion issues
      allowBooleanAttributes: false,
    });

    const parsed = parser.parse(xmlContent);
    const interfaceData = parsed['intf:abapInterface'];

    console.log('Parsed fixture XML:', JSON.stringify(interfaceData, null, 2));

    // 2. Extract data and create TestInterfaceDefinition
    const intf = new TestInterfaceDefinition();

    // ADT Core attributes (handle @_ prefix from parser)
    intf.core = {
      name: interfaceData['@_adtcore:name'],
      type: interfaceData['@_adtcore:type'],
      description: interfaceData['@_adtcore:description'],
      responsible: interfaceData['@_adtcore:responsible'],
      masterLanguage: interfaceData['@_adtcore:masterLanguage'],
      masterSystem: interfaceData['@_adtcore:masterSystem'],
      abapLanguageVersion: interfaceData['@_adtcore:abapLanguageVersion'],
      changedAt: new Date(interfaceData['@_adtcore:changedAt']),
      createdAt: new Date(interfaceData['@_adtcore:createdAt']),
      changedBy: interfaceData['@_adtcore:changedBy'],
      createdBy: interfaceData['@_adtcore:createdBy'],
      version: interfaceData['@_adtcore:version'] as 'active' | 'inactive',
      descriptionTextLimit: parseInt(
        interfaceData['@_adtcore:descriptionTextLimit']
      ),
      language: interfaceData['@_adtcore:language'],
    };

    // ABAP OO attributes
    intf.oo = {
      modeled: interfaceData['@_abapoo:modeled'] === 'true',
    };

    // ABAP Source attributes
    intf.source = {
      sourceUri: interfaceData['@_abapsource:sourceUri'],
      fixPointArithmetic:
        interfaceData['@_abapsource:fixPointArithmetic'] === 'true',
      activeUnicodeCheck:
        interfaceData['@_abapsource:activeUnicodeCheck'] === 'true',
    };

    // Package reference element
    const packageRefData = interfaceData['adtcore:packageRef'];
    if (packageRefData) {
      intf.packageRef = {
        uri: packageRefData['@_adtcore:uri'],
        type: packageRefData['@_adtcore:type'] as 'DEVC/K',
        name: packageRefData['@_adtcore:name'],
      };
    }

    // Atom links (handle both single and array)
    const atomLinks = interfaceData['atom:link'];
    if (atomLinks) {
      const linksArray = Array.isArray(atomLinks) ? atomLinks : [atomLinks];
      intf.links = linksArray
        .map((link: any) => ({
          href: link['@_href'],
          rel: link['@_rel'],
          type: link['@_type'],
          title: link['@_title'],
          etag: link['@_etag'],
        }))
        .filter((link: any) => link.href); // Remove undefined properties
    }

    // Syntax configuration (the complex nested one!)
    const syntaxConfig = interfaceData['abapsource:syntaxConfiguration'];
    if (syntaxConfig) {
      const language = syntaxConfig['abapsource:language'];
      if (language) {
        const parserLink = language['atom:link'];
        intf.syntaxConfiguration = {
          language: {
            version: parseInt(language['abapsource:version']),
            description: language['abapsource:description'],
            parserLink: parserLink
              ? {
                  href: parserLink['@_href'],
                  rel: parserLink['@_rel'],
                  type: parserLink['@_type'],
                  title: parserLink['@_title'],
                  etag: parserLink['@_etag'],
                }
              : undefined,
          },
        };
      }
    }

    // 3. Generate XML using decorators
    const generatedXml = intf.toXML();

    console.log(
      'Generated XML from decorator class:',
      JSON.stringify(generatedXml, null, 2)
    );

    // 4. Compare key structures (this is where we'll find the issues!)
    const generated = generatedXml['intf:abapInterface'];

    // Check attributes match
    expect(generated['adtcore:name']).toBe(interfaceData['@_adtcore:name']);
    expect(generated['adtcore:type']).toBe(interfaceData['@_adtcore:type']);
    expect(generated['abapoo:modeled']).toBe(interfaceData['@_abapoo:modeled']);
    expect(generated['abapsource:sourceUri']).toBe(
      interfaceData['@_abapsource:sourceUri']
    );

    // Check elements exist
    expect(generated).toHaveProperty('adtcore:packageRef');
    expect(generated).toHaveProperty('atom:link');

    // 🎯 VICTORY! Key validations to prove round-trip success:

    // Syntax configuration - the most complex cross-namespace structure
    expect(generated).toHaveProperty('abapsource:syntaxConfiguration');
    const generatedSyntaxConfig = generated['abapsource:syntaxConfiguration'];
    expect(generatedSyntaxConfig).toHaveProperty('abapsource:language');
    expect(generatedSyntaxConfig['abapsource:language']).toHaveProperty(
      'atom:link'
    );
    expect(
      generatedSyntaxConfig['abapsource:language']['atom:link']
    ).toHaveProperty('atom:href');

    // All atom links preserved
    expect(generated['atom:link']).toHaveLength(6); // All 6 links from fixture!

    // Package reference structure
    expect(generated['adtcore:packageRef']).toMatchObject({
      'adtcore:uri': '/sap/bc/adt/packages/zpepl_test',
      'adtcore:type': 'DEVC/K',
      'adtcore:name': 'ZPEPL_TEST',
    });

    console.log(
      '🎉 BRAVE TEST SUCCESS! Decorator system perfectly round-trips the fixture XML!'
    );
  });
});
