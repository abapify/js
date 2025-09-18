/**
 * Type-safe representation of InterfaceXML as parsed by fast-xml-parser
 * This type is inferred from the decorators on InterfaceXML class
 */

import type { AdtCoreType } from '../../../namespaces/adtcore.js';
import type { AbapOOType } from '../../../namespaces/abapoo.js';
import type { AbapSourceType } from '../../../namespaces/abapsource.js';
import type { AtomLinkType } from '../../../namespaces/atom.js';
import type { PackageRefType } from '../../../namespaces/adtcore.js';
import type { SyntaxConfigurationType } from '../../../namespaces/abapsource.js';

/**
 * Transform a type to fast-xml-parser attribute format
 * All values become strings because fast-xml-parser doesn't parse attribute values by default
 */
type ToAttributes<T, Namespace extends string> = {
  [K in keyof T as `@_${Namespace}:${string & K}`]: string;
};

/**
 * Transform a type to fast-xml-parser element format with attributes
 */
type ToElementWithAttributes<T, Namespace extends string> = {
  [K in keyof T as `@_${Namespace}:${string & K}`]: string;
};

/**
 * Transform array type to fast-xml-parser element array format
 */
type ToElementArray<
  T,
  Namespace extends string,
  ElementName extends string = 'link'
> = T extends Array<infer U>
  ? Array<ToElementWithAttributes<U, Namespace>>
  : never;

/**
 * The exact type structure that fast-xml-parser produces when parsing InterfaceXML
 * This matches the decorators on InterfaceXML:
 * - @adtcore @attributes core -> @_adtcore:* attributes on root
 * - @abapoo @attributes oo -> @_abapoo:* attributes on root
 * - @abapsource @attributes source -> @_abapsource:* attributes on root
 * - @atom atomLinks -> atom:link element array with @_atom:* attributes
 * - @adtcore packageRef -> adtcore:packageRef element with @_adtcore:* attributes
 * - @abapsource syntaxConfiguration -> abapsource:syntaxConfiguration nested structure
 */
export type InterfaceXMLParsedType = {
  // Root attributes from @adtcore @attributes core: AdtCoreType
  '@_adtcore:name': string;
  '@_adtcore:type': string;
  '@_adtcore:description'?: string;
  '@_adtcore:descriptionTextLimit'?: string;
  '@_adtcore:language'?: string;
  '@_adtcore:masterLanguage'?: string;
  '@_adtcore:masterSystem'?: string;
  '@_adtcore:abapLanguageVersion'?: string;
  '@_adtcore:responsible'?: string;
  '@_adtcore:changedBy'?: string;
  '@_adtcore:createdBy'?: string;
  '@_adtcore:changedAt'?: string; // ISO date string
  '@_adtcore:createdAt'?: string; // ISO date string
  '@_adtcore:version'?: string; // 'active' | 'inactive'

  // Root attributes from @abapoo @attributes oo: AbapOOType
  '@_abapoo:modeled': string; // 'true' | 'false'

  // Root attributes from @abapsource @attributes source: AbapSourceType
  '@_abapsource:sourceUri': string;
  '@_abapsource:fixPointArithmetic': string; // 'true' | 'false'
  '@_abapsource:activeUnicodeCheck': string; // 'true' | 'false'

  // Element from @atom atomLinks: AtomLinkType[]
  // Note: Real SAP XML uses @_href, @_rel (no namespace prefix in attributes)
  'atom:link'?: Array<{
    '@_href': string;
    '@_rel': string;
    '@_type'?: string;
    '@_title'?: string;
    '@_etag'?: string;
    '@_xmlns:atom'?: string; // Namespace declaration
  }>;

  // Element from @adtcore packageRef?: PackageRefType
  'adtcore:packageRef'?: {
    '@_adtcore:uri': string;
    '@_adtcore:type': string; // 'DEVC/K'
    '@_adtcore:name': string;
  };

  // Complex nested element from @abapsource syntaxConfiguration?: SyntaxConfigurationType
  'abapsource:syntaxConfiguration'?: {
    'abapsource:language': {
      'abapsource:version': string;
      'abapsource:description': string;
      'atom:link'?: {
        '@_href': string;
        '@_rel': string;
        '@_type'?: string;
        '@_title'?: string;
        '@_etag'?: string;
      };
    };
  };
};

/**
 * Type-safe accessor helpers for converting parsed strings back to proper types
 */
export namespace InterfaceXMLParsed {
  export function parseBoolean(value: string | undefined): boolean {
    return value === 'true';
  }

  export function parseNumber(value: string | undefined): number | undefined {
    return value ? parseInt(value, 10) : undefined;
  }

  export function parseDate(value: string | undefined): Date | undefined {
    return value ? new Date(value) : undefined;
  }

  export function parseVersion(
    value: string | undefined
  ): 'active' | 'inactive' | undefined {
    return value as 'active' | 'inactive' | undefined;
  }
}
