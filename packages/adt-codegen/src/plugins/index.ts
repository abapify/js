/**
 * Plugin exports
 */

export { workspaceSplitterPlugin } from './workspace-splitter';
export {
  extractCollectionsPlugin,
  extractCollections,
} from './extract-collections';
export { bootstrapSchemasPlugin, bootstrapSchemas } from './bootstrap-schemas';
export { generateTypesPlugin } from './generate-types';

// Re-export types
export type {
  ExtractCollectionsOptions,
  CollectionData,
} from './extract-collections';
export type { BootstrapSchemasOptions, SchemaInfo } from './bootstrap-schemas';
