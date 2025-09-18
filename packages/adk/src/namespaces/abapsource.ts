import { AtomLinkType } from './atom.js';

/**
 * ABAP Source namespace (abapsource:*) - ABAP source code attributes
 * Based on XML: abapsource:fixPointArithmetic, abapsource:activeUnicodeCheck
 */
export interface AbapSourceType {
  sourceUri?: string;
  fixPointArithmetic?: boolean;
  activeUnicodeCheck?: boolean;
}

export interface SyntaxConfigurationType {
  language: {
    version: number;
    description: string;
    parserLink?: AtomLinkType;
  };
}

// ABAP Source namespace URI
export const ABAPSOURCE_NAMESPACE_URI = 'http://www.sap.com/adt/abapsource';

// ABAP Source decorator
import { namespace } from '../decorators';
export const abapsource = namespace('abapsource', ABAPSOURCE_NAMESPACE_URI);
