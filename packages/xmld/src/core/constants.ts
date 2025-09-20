/**
 * Core constants for xmld decorator system
 * Following the rule: always use proper constants for text references
 */

// Metadata type constants
export const METADATA_TYPES = {
  ELEMENT: 'element',
  ATTRIBUTE: 'attribute',
  UNWRAP: 'unwrap',
  NAMESPACE: 'namespace',
  XML_ROOT: 'xmlRoot',
  XML_CLASS: 'xmlClass',
} as const;

// Decorator operation constants
export const DECORATOR_OPERATIONS = {
  AUTO_INSTANTIATE: 'autoInstantiate',
  FLATTEN: 'flatten',
  NAMESPACE_PREFIX: 'namespacePrefix',
  NAMESPACE_URI: 'namespaceUri',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  INVALID_DECORATOR_TARGET: 'Invalid decorator target',
  MISSING_XML_ROOT: 'Class must have @root decorator to be serialized',
  INVALID_NAMESPACE: 'Invalid namespace configuration',
  AUTO_INSTANTIATION_FAILED: 'Failed to auto-instantiate property',
  CIRCULAR_REFERENCE: 'Circular reference detected in XML structure',
} as const;

// Type definitions for constants
export type MetadataType = (typeof METADATA_TYPES)[keyof typeof METADATA_TYPES];
export type DecoratorOperation =
  (typeof DECORATOR_OPERATIONS)[keyof typeof DECORATOR_OPERATIONS];
