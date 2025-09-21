import { xml, namespace, attributes, element } from 'xmld';
import { BaseSpec } from './base-spec';
import type {
  AbapSourceAttrs,
  SyntaxConfiguration,
} from '../namespaces/abapsource';
import type { AbapOOAttrs } from '../namespaces/abapoo';

/**
 * OoSpec - Shared foundation for ABAP OO object specifications (Interfaces and Classes)
 *
 * Extends BaseSpec with:
 * - ABAP Source attributes (abapsource namespace)
 * - ABAP OO attributes (abapoo namespace)
 * - Syntax configuration element
 *
 * Uses xmld decorators for automatic parsing - no manual parsing needed!
 */
@xml
export abstract class OoSpec extends BaseSpec {
  // ABAP Source attributes (flattened on root)
  @attributes
  @namespace('abapsource', 'http://www.sap.com/adt/abapsource')
  source!: AbapSourceAttrs;

  // ABAP OO attributes (flattened on root)
  @attributes
  @namespace('abapoo', 'http://www.sap.com/adt/oo')
  oo!: AbapOOAttrs;

  // ABAP Source nested configuration element
  @namespace('abapsource', 'http://www.sap.com/adt/abapsource')
  @element({ name: 'syntaxConfiguration' })
  syntaxConfiguration?: SyntaxConfiguration;

  /**
   * Parse abapsource attributes from root (shared utility)
   */
  static parseAbapSourceAttributes(root: any): AbapSourceAttrs {
    return {
      sourceUri: root['@_abapsource:sourceUri'],
      fixPointArithmetic: root['@_abapsource:fixPointArithmetic'],
      activeUnicodeCheck: root['@_abapsource:activeUnicodeCheck'],
    };
  }

  /**
   * Parse abapoo attributes from root (shared utility)
   */
  static parseAbapOOAttributes(root: any): AbapOOAttrs {
    return {
      modeled: root['@_abapoo:modeled'],
    };
  }

  /**
   * Parse syntax configuration from root (shared utility)
   */
  static parseSyntaxConfiguration(root: any): SyntaxConfiguration | undefined {
    const syntaxConfig = root['abapsource:syntaxConfiguration'];
    if (!syntaxConfig?.['abapsource:language']) {
      return undefined;
    }

    const lang = syntaxConfig['abapsource:language'];
    return {
      language: {
        // Handle both attribute style (@_abapsource:version) and element style (abapsource:version)
        version: lang['@_abapsource:version'] || lang['abapsource:version'],
        description:
          lang['@_abapsource:description'] || lang['abapsource:description'],
        supported:
          lang['@_abapsource:supported'] || lang['abapsource:supported'],
        etag: lang['@_abapsource:etag'] || lang['@_etag'],
      },
    };
  }
}
