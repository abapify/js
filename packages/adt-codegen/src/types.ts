/**
 * Core types for adt-codegen (Hook-Based Architecture)
 */

import type { Logger } from './logger';

/**
 * Plugin with hooks
 */
export interface CodegenPlugin {
  name: string;
  hooks?: PluginHooks;
}

/**
 * Available hooks for plugins
 */
export interface PluginHooks {
  /**
   * Called once at the start with parsed discovery
   */
  discovery?(ctx: DiscoveryContext): void | Promise<void>;

  /**
   * Called for each workspace
   */
  workspace?(ctx: WorkspaceContext): void | Promise<void>;

  /**
   * Called for each collection in each workspace
   */
  collection?(ctx: CollectionContext): void | Promise<void>;

  /**
   * Called for each template link in each collection
   */
  templateLink?(ctx: TemplateLinkContext): void | Promise<void>;

  /**
   * Called once at the end after all processing
   */
  finalize?(ctx: GlobalContext): void | Promise<void>;
}

/**
 * Discovery context - root level
 */
export interface DiscoveryContext {
  xml: any;
  workspaces: any[];
  data: Record<string, any>;
  logger: Logger;
}

/**
 * Workspace context
 */
export interface WorkspaceContext {
  title: string;
  folderName: string;
  dir: string;
  xml: any;

  // Shared data between plugins
  data: Record<string, any>;

  // Accumulated artifacts
  artifacts: Artifact[];

  // Logger
  logger: Logger;

  // Helper to write files in workspace dir
  writeFile(name: string, content: string): Promise<void>;
}

/**
 * Collection context
 */
export interface CollectionContext {
  href: string;
  title: string;
  accepts: string[];
  category: { term: string; scheme: string };
  templateLinks: TemplateLink[];
  xml: any;

  // Parent workspace
  workspace: WorkspaceContext;

  // Shared data
  data: Record<string, any>;

  // Logger
  logger: Logger;
}

/**
 * Template link context
 */
export interface TemplateLinkContext {
  rel: string;
  template: string;

  // Parent collection
  collection: CollectionContext;

  // Shared data
  data: Record<string, any>;

  // Logger
  logger: Logger;
}

/**
 * Global context for finalize hook
 */
export interface GlobalContext {
  discovery: DiscoveryContext;
  workspaces: WorkspaceContext[];
  outputDir: string;
  logger: Logger;
}

/**
 * Template link
 */
export interface TemplateLink {
  rel: string;
  template: string;
}

/**
 * Artifact to be written
 */
export interface Artifact {
  file: string;
  content: string;
}

/**
 * Filter value types - supports single values, arrays, and regex
 */
export type FilterValue<T> = T | T[] | RegExp | RegExp[];

/**
 * Deep filter type - makes all properties optional and array-compatible
 */
export type DeepFilter<T> = {
  [K in keyof T]?: T[K] extends object ? DeepFilter<T[K]> : FilterValue<T[K]>;
};

/**
 * Workspace filter
 */
export interface WorkspaceFilter {
  title?: FilterValue<string>;
  href?: FilterValue<string>;
}

/**
 * Collection filter
 */
export interface CollectionFilter {
  title?: FilterValue<string>;
  href?: FilterValue<string>;
  category?: {
    term?: FilterValue<string>;
    scheme?: FilterValue<string>;
  };
  templateLinks?: {
    rel?: FilterValue<string>;
    type?: FilterValue<string>;
    href?: FilterValue<string>;
  };
}

/**
 * Filter configuration - single filter or array (OR condition)
 */
export type FilterConfig =
  | {
      workspace?: DeepFilter<WorkspaceFilter>;
      collection?: DeepFilter<CollectionFilter>;
    }
  | Array<{
      workspace?: DeepFilter<WorkspaceFilter>;
      collection?: DeepFilter<CollectionFilter>;
    }>;

/**
 * Codegen configuration
 */
export interface CodegenConfig {
  discovery: {
    path: string;
  };
  output: {
    baseDir: string;
    clean?: boolean;
  };
  filters?: FilterConfig;
  plugins: CodegenPlugin[];
}
