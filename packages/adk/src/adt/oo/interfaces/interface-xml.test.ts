import { describe, it, expect } from 'vitest';
import { InterfaceXML } from './interface-xml.js';

describe('InterfaceXML - Clean Separation of Concerns', () => {
  it('should demonstrate pure XML layer responsibilities', () => {
    // Create InterfaceXML directly - this is the XML representation
    const interfaceXML = new InterfaceXML({
      core: {
        name: 'ZIF_XML_TEST',
        type: 'INTF/OI',
        description: 'Pure XML layer test',
      },
      oo: {
        modeled: false,
      },
      source: {
        sourceUri: 'source/main',
        fixPointArithmetic: false,
        activeUnicodeCheck: false,
      },
      atomLinks: [
        {
          href: 'source/main',
          rel: 'http://www.sap.com/adt/relations/source',
          type: 'text/plain',
        },
      ],
    });

    // InterfaceXML handles XML serialization
    const xmlString = interfaceXML.toXMLString();

    // Verify XML structure
    expect(xmlString).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xmlString).toContain('<intf:abapInterface');
    expect(xmlString).toContain('adtcore:name="ZIF_XML_TEST"');
    expect(xmlString).toContain('abapoo:modeled="false"');
    expect(xmlString).toContain('<atom:link');
  });

  it('should round-trip XML perfectly', () => {
    const originalData = {
      core: {
        name: 'ZIF_ROUNDTRIP',
        type: 'INTF/OI',
        description: 'Round-trip test interface',
        packageRef: {
          uri: '/sap/bc/adt/packages/ztest',
          type: 'DEVC/K' as const,
          name: 'ZTEST',
        },
      },
      oo: {
        modeled: true,
      },
      source: {
        sourceUri: 'source/main',
        fixPointArithmetic: false,
        activeUnicodeCheck: true,
      },
      atomLinks: [
        {
          href: 'source/main',
          rel: 'http://www.sap.com/adt/relations/source',
          type: 'text/plain',
        },
      ],
    };

    // Create → Serialize → Parse → Compare
    const interfaceXML1 = new InterfaceXML(originalData);
    const xmlString = interfaceXML1.toXMLString();
    const interfaceXML2 = InterfaceXML.fromXMLString(xmlString);

    // Verify round-trip integrity
    expect(interfaceXML2.core.name).toBe('ZIF_ROUNDTRIP');
    expect(interfaceXML2.core.type).toBe('INTF/OI');
    expect(interfaceXML2.core.description).toBe('Round-trip test interface');
    expect(interfaceXML2.oo.modeled).toBe(true);
    expect(interfaceXML2.source.sourceUri).toBe('source/main');
    expect(interfaceXML2.source.activeUnicodeCheck).toBe(true);
    expect(interfaceXML2.atomLinks).toHaveLength(1);
    expect(interfaceXML2.atomLinks[0].href).toBe('source/main');
    expect(interfaceXML2.packageRef?.name).toBe('ZTEST');
  });

  it('should demonstrate clean factory pattern', () => {
    // This shows how Interface domain object would use InterfaceXML
    const interfaceData = {
      adtcore: {
        name: 'ZIF_FACTORY_TEST',
        type: 'INTF/OI',
        description: 'Factory pattern demo',
      },
      abapoo: {
        modeled: false,
      },
      abapsource: {
        sourceUri: 'source/main',
        fixPointArithmetic: false,
        activeUnicodeCheck: false,
      },
      links: [
        {
          href: 'source/main',
          rel: 'http://www.sap.com/adt/relations/source',
        },
      ],
    };

    // Interface domain object creates InterfaceXML via factory
    const interfaceXML = InterfaceXML.fromInterface(interfaceData);

    // InterfaceXML handles serialization
    const xmlString = interfaceXML.toXMLString();

    expect(xmlString).toContain('ZIF_FACTORY_TEST');
    expect(interfaceXML.core.name).toBe('ZIF_FACTORY_TEST');
  });
});
