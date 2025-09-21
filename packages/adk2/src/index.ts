/**
 * ADK public API
 *
 * This package provides type-safe ABAP object modeling with xmld-based XML serialization.
 * Implementation follows docs/specs/adk2-on-xmld.md.
 */

// Base XML classes and generic factory
export { BaseSpec } from './base/base-spec';
export { OoSpec } from './base/oo-xml';
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

// Domain objects (Phase A)
export { Interface, Class, Domain } from './objects';
export type { AdkObject, AdkObjectConstructor } from './base/adk-object';

// Object registry (generic)
export { ObjectRegistry, createObject } from './registry';

// Object kinds and registration
export { Kind } from './kind';

// Register object types with the registry
import { Interface } from './objects/interface';
import { Class } from './objects/class';
import { Domain } from './objects/domain';
import { InterfaceConstructor } from './objects/interface';
import { ClassConstructor } from './objects/class';
import { DomainConstructor } from './objects/domain';
import { ObjectRegistry } from './registry';
import { Kind } from './kind';

ObjectRegistry.register(Kind.Interface, InterfaceConstructor as any);
ObjectRegistry.register(Kind.Class, ClassConstructor as any);
ObjectRegistry.register(Kind.Domain, DomainConstructor as any);

// Convenience factory functions
export const createInterface = () => new Interface();
export const createClass = () => new Class();
export const createDomain = () => new Domain();

// Public types placeholder (reserved for future stable types)
export type {} from './types';
