/**
 * ADK public API
 *
 * This package provides type-safe ABAP object modeling with xmld-based XML serialization.
 * Implementation follows docs/specs/adk-on-xmld.md.
 */

// Base classes and types
export * from './base/adk-object';
export * from './base/base-spec';
export * from './base/oo-xml';
export * from './base/lazy-content';
export { createFromXml } from './base/generic-factory';

// Namespace-based exports (Phase A)
export type { AdtCoreAttrs } from './namespaces/adtcore';
export { AtomLink } from './namespaces/atom';
export type { AtomRelation } from './namespaces/atom';
export type {
  AbapSourceAttrs,
  SyntaxConfiguration,
} from './namespaces/abapsource';
export type { AbapOOAttrs } from './namespaces/abapoo';

// Object XML classes (Phase A)
export { IntfSpec } from './namespaces/intf';
export { ClassSpec, ClassInclude } from './namespaces/class';
export { DomainSpec, DdicFixedValueElement } from './namespaces/ddic';
export {
  AdtPackageSpec,
  PackageSpec,
  DevcCore,
} from './namespaces/packages';
export type {
  DevcData,
  PackageAttributes,
  PackageRef,
  ApplicationComponent,
  SoftwareComponent,
  TransportLayer,
  Transport,
  PakNamespace,
  PackageData,
} from './namespaces/packages';

// Object kinds and registration
export { Kind } from './kind';

// Register object types with the registry
import { Interface } from './objects/interface';
import { Class } from './objects/class';
import { Domain } from './objects/domain';
import { Package } from './objects/package';
import { InterfaceConstructor } from './objects/interface';
import { ClassConstructor } from './objects/class';
import { DomainConstructor } from './objects/domain';
import { PackageConstructor } from './objects/package';
import { ObjectRegistry, ObjectTypeRegistry } from './registry';
import { Kind } from './kind';

ObjectRegistry.register(Kind.Interface, InterfaceConstructor as any);
ObjectRegistry.register(Kind.Class, ClassConstructor as any);
ObjectRegistry.register(Kind.Domain, DomainConstructor as any);
ObjectRegistry.register(Kind.Package, PackageConstructor as any);

// Export a facade instance that ADT client can use
export const objectRegistry = new ObjectTypeRegistry();

// Convenience factory functions
export const createInterface = () => new Interface();
export const createClass = () => new Class();
export const createDomain = () => new Domain();
export const createPackage = (name: string, description?: string) => new Package(name, description);

// Export object types for use by adt-client
export type { Interface } from './objects/interface';
export type { Class } from './objects/class';
export type { Domain } from './objects/domain';
export type { Package } from './objects/package';

// Export factories
export { AdkPackageFactory } from './factories/package-factory';

// Public types placeholder (reserved for future stable types)
export type {} from './types';
