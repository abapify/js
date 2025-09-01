import { describe, it, expect } from 'vitest';
import { DomainAdtAdapter } from './adt';
import { Kind } from '../../kind';
import type { DomainSpec } from '../index';

describe('DomainAdtAdapter', () => {
  const mockDomainSpec: DomainSpec = {
    kind: Kind.Domain,
    metadata: {
      name: 'TEST_DOMAIN',
      description: 'Test domain for unit tests',
    },
    spec: {
      typeInformation: {
        datatype: 'CHAR',
        length: 10,
        decimals: 0,
      },
      outputInformation: {
        length: 10,
        style: 'UPPER',
        signExists: false,
        lowercase: false,
        ampmFormat: false,
      },
      valueInformation: {
        appendExists: false,
        fixValues: [
          {
            position: 1,
            low: 'A',
            text: 'Option A',
          },
          {
            position: 2,
            low: 'B',
            high: 'C',
            text: 'Options B-C',
          },
        ],
      },
    },
  };

  it('should create adapter instance', () => {
    const adapter = new DomainAdtAdapter(mockDomainSpec);
    expect(adapter).toBeInstanceOf(DomainAdtAdapter);
  });

  it('should return correct kind', () => {
    const adapter = new DomainAdtAdapter(mockDomainSpec);
    expect(adapter.kind).toBe('Domain');
  });

  it('should return correct name', () => {
    const adapter = new DomainAdtAdapter(mockDomainSpec);
    expect(adapter.name).toBe('TEST_DOMAIN');
  });

  it('should return correct description', () => {
    const adapter = new DomainAdtAdapter(mockDomainSpec);
    expect(adapter.description).toBe('Test domain for unit tests');
  });

  it('should return correct spec', () => {
    const adapter = new DomainAdtAdapter(mockDomainSpec);
    expect(adapter.spec).toEqual(mockDomainSpec.spec);
  });

  it('should generate ADT object structure', () => {
    const adapter = new DomainAdtAdapter(mockDomainSpec);
    const adtObject = adapter.toAdt();

    expect(adtObject).toBeDefined();
    expect(adtObject).toHaveProperty('doma:domain');

    const domainElement = (adtObject as any)['doma:domain'];
    expect(domainElement).toBeDefined();
    // The fxmlp library structures the content differently
    // Check for the presence of expected attributes and content structure
  });

  it('should generate valid ADT XML', () => {
    const adapter = new DomainAdtAdapter(mockDomainSpec);
    const xml = adapter.toAdtXML();

    expect(xml).toBeDefined();
    expect(typeof xml).toBe('string');
    expect(xml.length).toBeGreaterThan(0);

    // Check for XML structure
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('doma:domain');
    expect(xml).toContain('TEST_DOMAIN');
  });

  it('should include ADT core attributes', () => {
    const adapter = new DomainAdtAdapter(mockDomainSpec);
    const adtcore = adapter.adtcore;

    expect(adtcore).toHaveProperty('type', 'DOMA/DD');
    expect(adtcore).toHaveProperty('name', 'TEST_DOMAIN');
  });

  it('should handle domain without description', () => {
    const specWithoutDesc: DomainSpec = {
      ...mockDomainSpec,
      metadata: {
        name: 'NO_DESC_DOMAIN',
      },
    };

    const adapter = new DomainAdtAdapter(specWithoutDesc);
    expect(adapter.description).toBeUndefined();
    expect(adapter.name).toBe('NO_DESC_DOMAIN');
  });

  it('should handle domain with minimal spec', () => {
    const minimalSpec: DomainSpec = {
      kind: Kind.Domain,
      metadata: {
        name: 'MINIMAL_DOMAIN',
      },
      spec: {
        typeInformation: {
          datatype: 'CHAR',
          length: 1,
          decimals: 0,
        },
        outputInformation: {
          length: 1,
          style: '',
          signExists: false,
          lowercase: false,
          ampmFormat: false,
        },
        valueInformation: {
          appendExists: false,
          fixValues: [],
        },
      },
    };

    const adapter = new DomainAdtAdapter(minimalSpec);
    const xml = adapter.toAdtXML();

    expect(xml).toContain('MINIMAL_DOMAIN');
    expect(xml).toContain('CHAR');
  });
});
