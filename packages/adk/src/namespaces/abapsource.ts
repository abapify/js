/**
 * ABAP Source namespace (abapsource:*) - ABAP source code mixed content
 * Based on SAP ADT XML: abapsource:sourceUri="..." (attributes) + <abapsource:syntaxConfiguration> (child element)
 */

// Attributes that become XML attributes on the element
export interface AbapSourceAttributes {
  sourceUri?: string;
  fixPointArithmetic?: boolean;
  activeUnicodeCheck?: boolean;
}

// Syntax configuration structure (for child elements)
export interface SyntaxConfigurationType {
  language?: {
    version?: string;
    description?: string;
    supported?: boolean;
    etag?: string;
    // Note: parser link would be a child atom:link element
  };
}

// Elements that become XML child elements
export interface AbapSourceElements {
  syntaxConfiguration?: SyntaxConfigurationType;
}

/**
 * ABAP Source namespace (abapsource:*) - Smart namespace with automatic attribute/element detection
 * Attributes: simple values (string, number, boolean)
 * Elements: complex values (objects, arrays)
 */
export type AbapSourceType = AbapSourceAttributes & AbapSourceElements;

// ABAP Source decorator - smart namespace with automatic attribute/element detection
import { createNamespace } from '../decorators/decorators-v2';

export const abapsource = createNamespace<
  AbapSourceElements,
  AbapSourceAttributes
>({
  name: 'abapsource',
  uri: 'http://www.sap.com/adt/abapsource',
});
