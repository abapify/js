/**
 * ADK - ABAP Development Kit
 *
 * Minimalistic object registry and factory layer over adt-schemas.
 * Provides OOP wrappers for ABAP objects with automatic XML serialization.
 */

// Core interfaces
export * from './base/adk-object';

// Object registry (imports trigger registration)
export { ObjectRegistry, ObjectTypeRegistry, objectRegistry, Kind } from './registry';

// Factory functions
export { fromAdtXml } from './base/instance-factory';
export { GenericAbapObject } from './objects/generic';

// Object classes
export { Interface, InterfaceConstructor } from './objects/intf';
export { Class, ClassConstructor } from './objects/clas';
export { Domain, DomainConstructor } from './objects/doma';
export { Package, PackageConstructor } from './objects/devc';

// Object types
export type { Interface as InterfaceType } from './objects/intf';
export type { Class as ClassType } from './objects/clas';
export type { Domain as DomainType } from './objects/doma';
export type { Package as PackageType } from './objects/devc';
