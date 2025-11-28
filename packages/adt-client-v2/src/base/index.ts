/**
 * Base Module - Centralized External Dependencies
 *
 * All external imports (ts-xml, speci) go through this module.
 * This provides:
 * - Single source of truth for external dependencies
 * - Consistent API across the codebase
 * - Easy to swap implementations if needed
 */

// Schema functionality (ts-xml)
export {
  createSchema,
  parse,
  build,
  FieldKind,
  PrimitiveType,
  type ElementSchema,
  type InferSchema,
  type InferSchemaType,
} from './schema';

// Contract functionality (speci)
export {
  createContract,
  createHttp,
  http,
  adtHttp,
  createClient,
  type RestContract,
  type AdtRestContract,
  type AdtError,
} from './contract';
