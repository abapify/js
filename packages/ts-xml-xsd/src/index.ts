/**
 * ts-xml-xsd: XSD schema definitions for ts-xml
 *
 * Parse and build XSD files using ts-xml itself (dogfooding!)
 */

// Namespace constants
export { XSD_NS, XSD_PREFIX, XS_PREFIX } from './namespace';

// All XSD schemas
export {
  // Primitive schemas
  XsdDocumentationSchema,
  XsdAnnotationSchema,
  // Attribute schema
  XsdAttributeSchema,
  // Element schema
  XsdElementSchema,
  // Compositor schemas
  XsdSequenceSchema,
  XsdChoiceSchema,
  XsdAllSchema,
  // Type derivation schemas
  XsdEnumerationSchema,
  XsdRestrictionSchema,
  XsdExtensionSchema,
  // Content schemas
  XsdSimpleContentSchema,
  XsdComplexContentSchema,
  // Type definition schemas
  XsdSimpleTypeSchema,
  XsdComplexTypeSchema,
  // Import/Include schemas
  XsdImportSchema,
  XsdIncludeSchema,
  // Root schema
  XsdSchemaSchema,
} from './schema';

// Type exports
export type {
  XsdDocumentation,
  XsdAnnotation,
  XsdAttribute,
  XsdElement,
  XsdSequence,
  XsdChoice,
  XsdAll,
  XsdEnumeration,
  XsdRestriction,
  XsdExtension,
  XsdSimpleContent,
  XsdComplexContent,
  XsdSimpleType,
  XsdComplexType,
  XsdImport,
  XsdInclude,
  XsdSchema,
} from './schema';

// Re-export parse/build from ts-xml for convenience
export { parse, build } from 'ts-xml';
