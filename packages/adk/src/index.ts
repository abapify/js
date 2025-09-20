// Import and register all ADK object types
import { Interface } from './adt/oo/interfaces/interface';
import { Class } from './adt/oo/classes/class';
import { Domain } from './adt/ddic/domains/domain';
import { objectRegistry } from './adt/base/object-registry';

// Register all object types in the registry
objectRegistry.register('INTF', Interface);
objectRegistry.register('CLAS', Class);
objectRegistry.register('DOMA', Domain);

// === ESSENTIAL EXPORTS ===

// Main ADK object classes
export { Interface } from './adt/oo/interfaces/interface';
export { Class } from './adt/oo/classes/class';
export { Domain } from './adt/ddic/domains/domain';

// Object registry for creating objects from XML
export { objectRegistry } from './adt/base/object-registry';

// Essential types for TypeScript consumers
export type { AdkObject, AdkObjectConstructor } from './adt/base/adk-object';
export { Kind } from './adt/kind';

// Core namespace types (commonly needed)
export type { AdtCoreType, PackageRefType } from './namespaces/adtcore';
export type { AtomLinkType } from './namespaces/atom';
export type { DdicType, DdicFixedValueType } from './namespaces/ddic';
