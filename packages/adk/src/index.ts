export * from './adt';

// Explicitly export key components for ADT client integration
export { objectRegistry } from './adt/base/object-registry.js';
export type { AdkObject, AdkObjectConstructor } from './adt/base/adk-object.js';

// Export generic decorator system
export {
  XMLRoot,
  attributes,
  namespace,
  element,
  toXML,
} from './decorators/index.js';

// Export SAP-specific decorators (from their respective namespaces)
export { adtcore } from './namespaces/adtcore.js';
export { abapoo } from './namespaces/abapoo.js';
export { abapsource } from './namespaces/abapsource.js';
export { atom } from './namespaces/atom.js';
export { classNs } from './namespaces/class.js';

// Export XML parser wrappers
export { $attr, $elem, $clean } from './xml-helpers/index.js';

// Export namespace types
export type * from './namespaces/index.js';

// Client operation interfaces (CRUD, transport, etc.) are now in @abapify/adt-client package
// ADK only exports pure object modeling interfaces
