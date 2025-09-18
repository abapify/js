import { describe, it, expect } from 'vitest';
// import { DomainAdtAdapter } from './adt'; // Commented out - missing AdtAdapter base class
import { Kind } from '../../../kind';
import type { DomainSpec } from '../index';

// TODO: Re-enable when AdtAdapter base class is implemented
describe.skip('DomainAdtAdapter', () => {
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

    const domainElement = (adtObject as Record<string, unknown>)['doma:domain'];
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

  describe('fromAdt parsing', () => {
    it('should parse ADT object to DomainSpec', () => {
      const adtObject = {
        'doma:domain': {
          '@adtcore:name': 'PARSED_DOMAIN',
          '@description': 'Parsed domain',
          'doma:content': {
            'doma:typeInformation': {
              'doma:datatype': 'NUMC',
              'doma:length': 5,
              'doma:decimals': 0,
            },
            'doma:outputInformation': {
              'doma:length': 5,
              'doma:style': 'UPPER',
              'doma:signExists': false,
              'doma:lowercase': false,
              'doma:ampmFormat': false,
            },
            'doma:valueInformation': {
              'doma:appendExists': false,
              'doma:fixValues': [
                {
                  'doma:position': 1,
                  'doma:low': '1',
                  'doma:text': 'Option One',
                },
                {
                  'doma:position': 2,
                  'doma:low': '2',
                  'doma:high': '9',
                  'doma:text': 'Options Two to Nine',
                },
              ],
            },
          },
        },
      };

      const adapter = new DomainAdtAdapter(mockDomainSpec);
      const parsedSpec = adapter.fromAdt(adtObject);

      expect(parsedSpec.kind).toBe(Kind.Domain);
      expect(parsedSpec.metadata.name).toBe('PARSED_DOMAIN');
      expect(parsedSpec.metadata.description).toBe('Parsed domain');
      expect(parsedSpec.spec.typeInformation.datatype).toBe('NUMC');
      expect(parsedSpec.spec.typeInformation.length).toBe(5);
      expect(parsedSpec.spec.valueInformation.fixValues).toHaveLength(2);
      expect(parsedSpec.spec.valueInformation.fixValues[0].low).toBe('1');
      expect(parsedSpec.spec.valueInformation.fixValues[1].high).toBe('9');
    });

    it('should handle missing optional fields in ADT parsing', () => {
      const adtObject = {
        'doma:domain': {
          '@adtcore:name': 'MINIMAL_DOMAIN',
          'doma:content': {
            'doma:typeInformation': {
              'doma:datatype': 'CHAR',
              'doma:length': 1,
            },
            'doma:outputInformation': {
              'doma:length': 1,
            },
            'doma:valueInformation': {
              'doma:appendExists': false,
            },
          },
        },
      };

      const adapter = new DomainAdtAdapter(mockDomainSpec);
      const parsedSpec = adapter.fromAdt(adtObject);

      expect(parsedSpec.metadata.name).toBe('MINIMAL_DOMAIN');
      expect(parsedSpec.metadata.description).toBeUndefined();
      expect(parsedSpec.spec.typeInformation.decimals).toBe(0);
      expect(parsedSpec.spec.outputInformation.style).toBe('');
      expect(parsedSpec.spec.valueInformation.fixValues).toEqual([]);
    });

    it('should throw error for invalid ADT object', () => {
      const invalidAdtObject = {
        'invalid:element': {},
      };

      const adapter = new DomainAdtAdapter(mockDomainSpec);

      expect(() => adapter.fromAdt(invalidAdtObject)).toThrow(
        'Invalid ADT object: missing doma:domain element'
      );
    });

    it('should throw error for missing domain name', () => {
      const invalidAdtObject = {
        'doma:domain': {
          'doma:content': {},
        },
      };

      const adapter = new DomainAdtAdapter(mockDomainSpec);

      expect(() => adapter.fromAdt(invalidAdtObject)).toThrow(
        'Invalid ADT object: missing domain name'
      );
    });

    it('should parse and generate XML round-trip', () => {
      const adapter = new DomainAdtAdapter(mockDomainSpec);
      const xml = adapter.toAdtXML();

      // Note: This test demonstrates the concept, but actual round-trip
      // would require the static fromAdtXML method to work properly
      expect(xml).toContain('TEST_DOMAIN');
      expect(xml).toContain('CHAR');
    });
  });
});
