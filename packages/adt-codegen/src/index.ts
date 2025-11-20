/**
 * @abapify/adt-codegen
 *
 * Hook-based code generation toolkit for SAP ADT APIs
 */

export { CodegenFramework } from './framework';
export { definePlugin } from './plugin';
export { defineConfig, defineAdtConfig } from './config';
export { defineFilters } from './filters';
export { ConsoleLogger, type Logger } from './logger';

// Built-in plugins (re-exported from plugins/index)
export {
  workspaceSplitterPlugin,
  extractCollectionsPlugin,
  extractCollections,
  bootstrapSchemasPlugin,
  bootstrapSchemas,
  generateTypesPlugin,
} from './plugins/index';

export type {
  ExtractCollectionsOptions,
  CollectionData,
  BootstrapSchemasOptions,
  SchemaInfo,
} from './plugins/index';

export type {
  CodegenPlugin,
  PluginHooks,
  CodegenConfig,
  DiscoveryContext,
  WorkspaceContext,
  CollectionContext,
  TemplateLinkContext,
  GlobalContext,
  TemplateLink,
  Artifact,
  FilterConfig,
  FilterValue,
  DeepFilter,
  WorkspaceFilter,
  CollectionFilter,
} from './types';
