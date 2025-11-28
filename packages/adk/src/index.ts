/**
 * ADK - ABAP Development Kit
 *
 * Minimalistic object registry and factory layer over adt-schemas.
 * Provides OOP wrappers for ABAP objects with automatic XML serialization.
 */

// Core interfaces
export * from './base/adk-object';

// Lazy content utilities
export { createCachedLazyLoader, type LazyContent } from './base/lazy-content';

// Object registry (imports trigger registration)
export {
  ObjectRegistry,
  ObjectTypeRegistry,
  objectRegistry,
  Kind,
} from './registry';

// Factory functions
export { fromAdtXml } from './base/instance-factory';
export { GenericAbapObject } from './objects/generic';

// Object classes
export { Interface, InterfaceConstructor } from './objects/intf';
export { Class, ClassConstructor } from './objects/clas';
export { Domain, DomainConstructor } from './objects/doma';
export { Package, PackageConstructor } from './objects/devc';

// Object classes with ADK_ prefix (for clarity when used as constructors)
export { Class as ADK_Class } from './objects/clas';
export { Interface as ADK_Interface } from './objects/intf';
export { Domain as ADK_Domain } from './objects/doma';
export { Package as ADK_Package } from './objects/devc';

// Object types
export type { Interface as InterfaceType } from './objects/intf';
export type { Class as ClassType } from './objects/clas';
export type { Domain as DomainType } from './objects/doma';
export type { Package as PackageType } from './objects/devc';

// Re-export schema data types that external packages need
export type {
  ClassType as ClassSpec,
  ClassIncludeElementType as ClassInclude,
} from '@abapify/adt-schemas';

// Re-export ts-xml types needed for declaration generation (via adt-schemas)
export type { InferSchema, ElementSchema } from '@abapify/adt-schemas';
