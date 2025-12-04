/**
 * Plugin types for adt-plugin-abapgit
 * 
 * These types define the contract between CLI and plugin.
 * The plugin receives ADK v2 objects from the CLI.
 */

import type { AdkObject, AdkPackage } from '@abapify/adk-v2';

/**
 * Context provided to plugin during serialization
 */
export interface SerializationContext {
  /** The package containing this object */
  package: AdkPackage;
  
  /** Path from root to this package (e.g., ["ZROOT", "ZSUB1", "ZSUB1_A"]) */
  packagePath: string[];
  
  /** Relative directory path for this package (e.g., "zroot/zsub1/zsub1_a") */
  packageDir: string;
  
  /** All parent packages (ordered from root to immediate parent) */
  parents: AdkPackage[];
  
  /** Total objects being processed (for progress tracking) */
  totalObjects: number;
  
  /** Current object index (for progress tracking) */
  currentIndex: number;
}

/**
 * Result of serializing a single object
 */
export interface SerializeObjectResult {
  success: boolean;
  filesCreated: string[];
  errors?: string[];
}

/**
 * Serialization options
 */
export interface SerializeOptions {
  includeMetadata?: boolean;
  fileStructure?: 'flat' | 'grouped' | 'hierarchical';
  [key: string]: unknown;
}

/**
 * Deserialization options
 */
export interface DeserializeOptions {
  validateStructure?: boolean;
  strictMode?: boolean;
  [key: string]: unknown;
}

/**
 * Bulk serialization result
 */
export interface SerializeResult {
  success: boolean;
  filesCreated: string[];
  objectsProcessed: number;
  errors: Array<{ message: string; plugin: string }>;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Plugin configuration
 */
export interface PluginConfig {
  enabled?: boolean;
  options: Record<string, unknown>;
}

/**
 * Format plugin interface
 * 
 * Plugins implement this interface to serialize/deserialize ADK objects.
 */
export interface FormatPlugin {
  readonly name: string;
  readonly version: string;
  readonly description: string;

  /**
   * Serialize a single ADK object to file system
   */
  serializeObject(
    object: AdkObject,
    targetPath: string,
    context: SerializationContext
  ): Promise<SerializeObjectResult>;

  /**
   * Legacy bulk serialization (optional)
   */
  serialize?(
    objects: AdkObject[],
    targetPath: string,
    options?: SerializeOptions
  ): Promise<SerializeResult>;

  /**
   * Deserialize files to ADK objects (optional)
   */
  deserialize?(
    sourcePath: string,
    options?: DeserializeOptions
  ): Promise<AdkObject[]>;

  /**
   * Called before import starts (optional)
   */
  beforeImport?(targetPath: string): Promise<void>;

  /**
   * Called after import completes (optional)
   */
  afterImport?(targetPath: string, result?: SerializeResult): Promise<void>;

  /**
   * Validate plugin configuration (optional)
   */
  validateConfig?(config: PluginConfig): ValidationResult;

  /**
   * Get supported object types
   */
  getSupportedObjectTypes(): string[];
}

/**
 * Helper to create a format plugin with type checking
 */
export function createFormatPlugin(plugin: FormatPlugin): FormatPlugin {
  return plugin;
}
