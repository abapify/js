import { describe, it, expect } from 'vitest';
import type {
  AbapSourceAttrs,
  SyntaxConfiguration,
  LanguageConfiguration,
} from './types';

describe('ABAP Source Namespace', () => {
  it('should define AbapSourceAttrs interface correctly', () => {
    const sourceAttrs: AbapSourceAttrs = {
      sourceUri: 'source/main',
      fixPointArithmetic: 'true',
      activeUnicodeCheck: 'false',
    };

    expect(sourceAttrs.sourceUri).toBe('source/main');
    expect(sourceAttrs.fixPointArithmetic).toBe('true');
    expect(sourceAttrs.activeUnicodeCheck).toBe('false');
  });

  it('should define LanguageConfiguration interface correctly', () => {
    const langConfig: LanguageConfiguration = {
      version: '5',
      description: 'ABAP for Cloud Development',
      supported: 'true',
      etag: '9165',
    };

    expect(langConfig.version).toBe('5');
    expect(langConfig.description).toBe('ABAP for Cloud Development');
    expect(langConfig.supported).toBe('true');
    expect(langConfig.etag).toBe('9165');
  });

  it('should define SyntaxConfiguration interface correctly', () => {
    const syntaxConfig: SyntaxConfiguration = {
      language: {
        version: '5',
        description: 'ABAP for Cloud Development',
        supported: 'true',
        etag: '9165',
      },
    };

    expect(syntaxConfig.language).toBeDefined();
    expect(syntaxConfig.language.version).toBe('5');
    expect(syntaxConfig.language.description).toBe(
      'ABAP for Cloud Development'
    );
  });

  it('should allow partial AbapSourceAttrs objects', () => {
    const partialSource: Partial<AbapSourceAttrs> = {
      fixPointArithmetic: 'true',
    };

    expect(partialSource.fixPointArithmetic).toBe('true');
    expect(partialSource.sourceUri).toBeUndefined();
    expect(partialSource.activeUnicodeCheck).toBeUndefined();
  });

  it('should allow optional LanguageConfiguration properties', () => {
    const minimalLang: Pick<LanguageConfiguration, 'version'> = {
      version: '3',
    };

    expect(minimalLang.version).toBe('3');
  });

  it('should handle boolean-like string values', () => {
    const sourceAttrs: AbapSourceAttrs = {
      fixPointArithmetic: 'false',
      activeUnicodeCheck: 'true',
    };

    // These are stored as strings in XML but represent boolean values
    expect(typeof sourceAttrs.fixPointArithmetic).toBe('string');
    expect(typeof sourceAttrs.activeUnicodeCheck).toBe('string');
    expect(sourceAttrs.fixPointArithmetic).toBe('false');
    expect(sourceAttrs.activeUnicodeCheck).toBe('true');
  });

  it('should support nested language configuration', () => {
    const complexSyntax: SyntaxConfiguration = {
      language: {
        version: '7.40',
        description: 'ABAP 7.40 SP08',
        supported: 'true',
        etag: 'abc123',
      },
    };

    expect(complexSyntax.language.version).toBe('7.40');
    expect(complexSyntax.language.description).toBe('ABAP 7.40 SP08');
    expect(complexSyntax.language.etag).toBe('abc123');
  });
});
