import { describe, test, expect } from 'vitest';
import { DomainXML } from './domain-xml';
import type { DdicType } from '../../../namespaces/ddic';
import type { AdtCoreType } from '../../../namespaces/adtcore';

describe('DomainXML Round-Trip Tests', () => {
  const sampleAdtCore: AdtCoreType = {
    name: 'ZDO_TEST_DOMAIN',
    type: 'DOMA/D',
    description: 'Test Domain for Round-Trip Testing',
    responsible: 'DEVELOPER',
    masterLanguage: 'E',
    changedAt: new Date('2023-12-01T10:30:00Z'),
    createdAt: new Date('2023-11-01T09:00:00Z'),
    changedBy: 'DEVELOPER',
    createdBy: 'DEVELOPER',
    version: 'active',
    language: 'E',
  };

  const sampleDdicType: DdicType = {
    dataType: 'CHAR',
    length: 10,
    decimals: 0,
    outputLength: 10,
    conversionExit: 'ALPHA',
    valueTable: 'ZT_VALUES',
    fixedValues: [
      {
        lowValue: 'A',
        highValue: 'A',
        description: 'Option A',
      },
      {
        lowValue: 'B',
        highValue: 'B',
        description: 'Option B',
      },
      {
        lowValue: 'C',
        description: 'Option C (no high value)',
      },
    ],
  };

  test('should create DomainXML with proper structure', () => {
    const domainXML = DomainXML.fromDomain({
      adtcore: sampleAdtCore,
      domain: sampleDdicType,
    });

    // Verify properties are set correctly
    expect(domainXML.core.name).toBe('ZDO_TEST_DOMAIN');
    expect(domainXML.domain.dataType).toBe('CHAR');
    expect(domainXML.domain.fixedValues).toHaveLength(3);
    expect(domainXML.domain.fixedValues?.[0].lowValue).toBe('A');
  });

  test('should serialize DomainXML to XML with nested elements', () => {
    const domainXML = DomainXML.fromDomain({
      adtcore: sampleAdtCore,
      domain: sampleDdicType,
    });

    // Serialize to XML
    const actualXML = domainXML.toXMLString();

    // Verify XML structure contains expected elements
    expect(actualXML).toContain('<ddic:domain');
    expect(actualXML).toContain('adtcore:name="ZDO_TEST_DOMAIN"');
    expect(actualXML).toContain('<ddic:dataType>CHAR</ddic:dataType>');
    expect(actualXML).toContain('<ddic:length>10</ddic:length>');
    expect(actualXML).toContain('<ddic:fixedValues>');
    expect(actualXML).toContain('<ddic:fixedValue>');
    expect(actualXML).toContain('<ddic:lowValue>A</ddic:lowValue>');
    expect(actualXML).toContain(
      '<ddic:description>Option A</ddic:description>'
    );
  });

  test('should parse XML back to DomainXML correctly (round-trip)', () => {
    // First, create and serialize
    const originalDomainXML = DomainXML.fromDomain({
      adtcore: sampleAdtCore,
      domain: sampleDdicType,
    });

    const xml = originalDomainXML.toXMLString();

    // Then parse back
    const parsedDomainXML = DomainXML.fromXMLString(xml);

    // Verify round-trip integrity
    expect(parsedDomainXML.core.name).toBe(originalDomainXML.core.name);
    expect(parsedDomainXML.domain.dataType).toBe(
      originalDomainXML.domain.dataType
    );
    expect(parsedDomainXML.domain.length).toBe(originalDomainXML.domain.length);
    expect(parsedDomainXML.domain.fixedValues).toHaveLength(3);

    // Verify fixed values are preserved
    const parsedFixedValues = parsedDomainXML.domain.fixedValues!;
    expect(parsedFixedValues[0].lowValue).toBe('A');
    expect(parsedFixedValues[0].description).toBe('Option A');
    expect(parsedFixedValues[2].highValue).toBeUndefined(); // Option C has no high value
  });

  test('should handle domain without fixed values', () => {
    const simpleDomain: DdicType = {
      dataType: 'NUMC',
      length: 5,
      decimals: 0,
      // No fixedValues
    };

    const domainXML = DomainXML.fromDomain({
      adtcore: sampleAdtCore,
      domain: simpleDomain,
    });

    const xml = domainXML.toXMLString();

    // Should not contain fixedValues elements
    expect(xml).not.toContain('<ddic:fixedValues>');
    expect(xml).toContain('<ddic:dataType>NUMC</ddic:dataType>');

    // Round-trip test
    const parsed = DomainXML.fromXMLString(xml);
    expect(parsed.domain.dataType).toBe('NUMC');
    expect(parsed.domain.fixedValues).toBeUndefined();
  });

  test('should parse real SAP domain XML fixture', () => {
    // Use the actual fixture file
    const fixtureXML = `<?xml version="1.0" encoding="UTF-8"?>
<ddic:domain
        xmlns:ddic="http://www.sap.com/adt/ddic"
        adtcore:responsible="CB9980003374"
        adtcore:masterLanguage="EN"
        adtcore:masterSystem="TRL"
        adtcore:abapLanguageVersion="cloudDevelopment"
        adtcore:name="ZDO_PEPL_TEST_DOMAIN"
        adtcore:type="DOMA/DD"
        adtcore:changedAt="2025-09-12T15:53:46Z"
        adtcore:version="inactive"
        adtcore:createdAt="2025-09-12T00:00:00Z"
        adtcore:changedBy="CB9980003374"
        adtcore:createdBy="CB9980003374"
        adtcore:description="Test PEPL domain"
        adtcore:descriptionTextLimit="60"
        adtcore:language="EN"
        xmlns:adtcore="http://www.sap.com/adt/core">
    <ddic:dataType>CHAR</ddic:dataType>
    <ddic:length>10</ddic:length>
    <ddic:decimals>0</ddic:decimals>
    <ddic:outputLength>10</ddic:outputLength>
    <ddic:conversionExit>ALPHA</ddic:conversionExit>
    <ddic:valueTable>MARA</ddic:valueTable>
</ddic:domain>`;

    const parsed = DomainXML.fromXMLString(fixtureXML);

    expect(parsed.core.name).toBe('ZDO_PEPL_TEST_DOMAIN');
    expect(parsed.domain.dataType).toBe('CHAR');
    expect(parsed.domain.length).toBe(10);
    expect(parsed.domain.decimals).toBe(0);
  });
});
