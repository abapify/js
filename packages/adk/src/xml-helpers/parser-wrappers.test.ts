import { describe, it, expect } from 'vitest';
import { $attr, $elem, $clean } from './parser-wrappers.js';
import { adtcore } from '../namespaces/adtcore.js';
import { abapoo } from '../namespaces/abapoo.js';
import type { AdtCoreType } from '../namespaces/adtcore.js';

describe('Parser Wrapper Functions', () => {
  const adtcoreInput: Partial<AdtCoreType> = {
    name: 'ZCL_TEST',
    type: 'CLAS/OC',
    packageRef: {
      uri: '/test/path',
      type: 'DEVC/K',
      name: 'TEST',
    },
  };

  const namespaceResult = adtcore(adtcoreInput);

  describe('$attr - Convert to fast-xml-parser format', () => {
    it('should convert namespace format to fast-xml-parser attributes', () => {
      const result = $attr(namespaceResult);

      expect(result).toEqual({
        '@_adtcore:name': 'ZCL_TEST',
        '@_adtcore:type': 'CLAS/OC',
        '@_adtcore:packageRef': {
          '@_adtcore:uri': '/test/path',
          '@_adtcore:type': 'DEVC/K',
          '@_adtcore:name': 'TEST',
        },
      });
    });

    it('should handle nested objects recursively', () => {
      const input = {
        'adtcore:name': 'TEST',
        'adtcore:nested': {
          'class:final': 'true',
          'atom:href': '/link',
        },
      };

      const result = $attr(input);

      expect(result).toEqual({
        '@_adtcore:name': 'TEST',
        '@_adtcore:nested': {
          '@_class:final': 'true',
          '@_atom:href': '/link',
        },
      });
    });

    it('should preserve non-namespace keys', () => {
      const input = {
        'adtcore:name': 'TEST',
        plainKey: 'value',
        number: 42,
      };

      const result = $attr(input);

      expect(result).toEqual({
        '@_adtcore:name': 'TEST',
        plainKey: 'value',
        number: 42,
      });
    });
  });

  describe('$elem - Passthrough for element format', () => {
    it('should return input unchanged', () => {
      const result = $elem(namespaceResult);
      expect(result).toBe(namespaceResult);
    });
  });

  describe('$clean - Convert from fast-xml-parser to namespace format', () => {
    it('should convert fast-xml-parser format to clean namespaces', () => {
      const parserInput = {
        '@_adtcore:name': 'ZCL_TEST',
        '@_adtcore:type': 'CLAS/OC',
        '@_adtcore:packageRef': {
          '@_adtcore:uri': '/test/path',
          '@_adtcore:type': 'DEVC/K',
          '@_adtcore:name': 'TEST',
        },
      };

      const result = $clean(parserInput);

      expect(result).toEqual({
        'adtcore:name': 'ZCL_TEST',
        'adtcore:type': 'CLAS/OC',
        'adtcore:packageRef': {
          'adtcore:uri': '/test/path',
          'adtcore:type': 'DEVC/K',
          'adtcore:name': 'TEST',
        },
      });
    });

    it('should be inverse of $attr', () => {
      const original = namespaceResult;
      const roundTrip = $clean($attr(original));

      expect(roundTrip).toEqual(original);
    });
  });

  describe('Composable Usage Patterns', () => {
    it('should work with composition: $attr(adtcore(input))', () => {
      const result = $attr(
        adtcore({
          name: 'ZCL_COMPOSED',
          type: 'CLAS/OC',
        })
      );

      expect(result).toEqual({
        '@_adtcore:name': 'ZCL_COMPOSED',
        '@_adtcore:type': 'CLAS/OC',
      });
    });

    it('should work with multiple namespaces: $attr({ ...adtcore(a), ...abapoo(b) })', () => {
      const adtcoreData = adtcore({ name: 'ZCL_TEST', type: 'CLAS/OC' });
      const abapooData = abapoo({ modeled: true });

      const combined = { ...adtcoreData, ...abapooData };
      const result = $attr(combined);

      expect(result).toEqual({
        '@_adtcore:name': 'ZCL_TEST',
        '@_adtcore:type': 'CLAS/OC',
        '@_abapoo:modeled': 'true',
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty objects', () => {
      expect($attr({})).toEqual({});
      expect($clean({})).toEqual({});
    });

    it('should handle null and undefined', () => {
      expect($attr(null as any)).toBe(null);
      expect($clean(undefined as any)).toBe(undefined);
    });

    it('should handle primitive values', () => {
      expect($attr('string' as any)).toBe('string');
      expect($clean(42 as any)).toBe(42);
    });
  });
});
