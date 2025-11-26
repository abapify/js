/**
 * ts-xml-codegen
 *
 * Generate ts-xml schemas from XSD files
 */

export { generateTsXmlSchemas, type GeneratorOptions } from './generator';

// Re-export XSD types for convenience
export type {
  XsdSchema,
  XsdComplexType,
  XsdSimpleType,
  XsdElement,
  XsdAttribute,
} from 'ts-xml-xsd';
