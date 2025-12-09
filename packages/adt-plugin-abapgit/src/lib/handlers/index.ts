/**
 * abapGit Handler System
 * 
 * Use `createHandler` factory to create handlers.
 * Handlers auto-register when created.
 */

// Export factory and types
export { createHandler } from './base';
export type { 
  XsdSchema, 
  SerializedFile, 
  ObjectHandler, 
  AbapObjectType,
  HandlerDefinition,
  HandlerContext,
} from './base';

// Export registry functions (also triggers handler loading)
export { getHandler, isSupported, getSupportedTypes } from './registry';
