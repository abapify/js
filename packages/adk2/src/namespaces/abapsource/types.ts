/**
 * ABAP Source namespace
 *
 * Attributes are stored as strings in XML. Domain layer may coerce to booleans/numbers.
 */
export interface AbapSourceAttrs {
  sourceUri?: string;
  fixPointArithmetic?: string; // 'true' | 'false'
  activeUnicodeCheck?: string; // 'true' | 'false'
}

export interface SyntaxConfiguration {
  language?: {
    version?: string;
    description?: string;
    supported?: string; // 'true' | 'false'
    etag?: string;
  };
}
