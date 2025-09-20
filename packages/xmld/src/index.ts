/**
 * xmld - Generic XML Modeling with TypeScript Decorators
 * Public API exports
 */

// Core decorators - xmld is our signature decorator! 🎯
export {
  xmld,
  xml,
  root,
  element,
  attribute,
  unwrap,
  namespace,
} from './core/decorators';

// Serialization
export {
  toXML,
  toSerializationData,
  type SerializationPlugin,
  type SerializationOptions,
  type SerializationData,
} from './serialization/serializer';

// Zero-dependency transformations
export { toFastXMLObject, toFastXML } from './plugins/fast-xml-parser';

// Metadata utilities (for advanced use cases)
export {
  getClassMetadata,
  getPropertyMetadata,
  getAllPropertyMetadata,
  isXMLClass,
  type ClassMetadata,
  type PropertyMetadata,
  type NamespaceInfo,
  type Constructor,
} from './core/metadata';

// Constants (for plugin developers)
export { METADATA_TYPES } from './core/constants';
