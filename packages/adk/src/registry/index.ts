/**
 * Object Registry Module
 *
 * Centralized object type management:
 * - Kind definitions
 * - Type→Kind mapping
 * - Kind→Constructor registry
 */

// Core registry
export {
  ObjectRegistry,
  createObject,
  ObjectTypeRegistry,
  objectRegistry,
} from './object-registry';

// Kind enum and type mappings
export { Kind, ADT_TYPE_TO_KIND, KIND_TO_ADT_TYPE } from './kinds';

// Type mapping utilities
export {
  extractTypeFromXml,
  extractRootElement,
  mapTypeToKind,
} from './type-mapping';

// Auto-register all object types when this module is imported
import { ObjectRegistry } from './object-registry';
import { Kind } from './kinds';
import { InterfaceConstructor } from '../objects/intf';
import { ClassConstructor } from '../objects/clas';
import { DomainConstructor } from '../objects/doma';
import { PackageConstructor } from '../objects/devc';

ObjectRegistry.register(Kind.Interface, InterfaceConstructor as any);
ObjectRegistry.register(Kind.Class, ClassConstructor as any);
ObjectRegistry.register(Kind.Domain, DomainConstructor as any);
ObjectRegistry.register(Kind.Package, PackageConstructor as any);
