/**
 * ABAP Source namespace types
 */
export interface AbapSourceAttributes {
  sourceUri: string;
  fixPointArithmetic?: boolean;
  activeUnicodeCheck?: boolean;
}

export interface SyntaxConfiguration {
  language: {
    version: number;
    description: string;
    parserLink?: AtomLink;
  };
}

export interface AtomLink {
  href: string;
  rel: string;
  type?: string;
  title?: string;
  etag?: string;
}
