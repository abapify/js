/**
 * ADK object interface - plugins work exclusively with these
 */
export interface AdkObject {
  readonly kind: string;
  readonly metadata: ObjectMetadata;
  readonly spec: ObjectSpec;
}

/**
 * Object metadata common to all ABAP objects
 */
export interface ObjectMetadata {
  name: string;
  description?: string;
  package?: string;
  transportRequest?: string;
  author?: string;
  createdAt?: Date;
  modifiedAt?: Date;
}

/**
 * Object specification - type-specific data from ADK
 */
export interface ObjectSpec {
  [key: string]: unknown;
}

/**
 * Core plugin interface for format plugins
 */
export interface FormatPlugin {
  readonly name: string;
  readonly version: string;
  readonly description: string;

  /**
   * Serialize a single ADK object to file system
   * CLI handles iteration and calls this for each object
   *
   * @param object - The ADK object to serialize (Class, Interface, Domain, Package, etc.)
   * @param targetPath - Base output directory
   * @param context - Context about the object's location in the package tree
   */
  serializeObject(
    object: AdkObject,
    targetPath: string,
    context: SerializationContext
  ): Promise<SerializeObjectResult>;

  /**
   * Legacy: Serialize multiple ADK objects to file system (bulk operation)
   * Used for backward compatibility and batch operations
   */
  serialize?(
    objects: AdkObject[],
    targetPath: string,
    options?: SerializeOptions
  ): Promise<SerializeResult>;

  /**
   * Deserialize file system to ADK objects (optional - for future use)
   */
  deserialize?(
    sourcePath: string,
    options?: DeserializeOptions
  ): Promise<AdkObject[]>;

  /**
   * Called before import starts (optional lifecycle hook)
   */
  beforeImport?(targetPath: string): Promise<void>;

  /**
   * Called after import completes (optional lifecycle hook)
   */
  afterImport?(targetPath: string, result: SerializeResult): Promise<void>;

  /**
   * Validate plugin configuration
   */
  validateConfig?(config: PluginConfig): ValidationResult;

  /**
   * Get supported object types
   */
  getSupportedObjectTypes(): string[];
}

/**
 * Context provided to plugin during serialization
 * Contains information about the object's location in the package hierarchy
 */
export interface SerializationContext {
  /** The package containing this object */
  package: AdkObject; // ADK_Package

  /** Path from root to this package (e.g., ["ZROOT", "ZSUB1", "ZSUB1_A"]) */
  packagePath: string[];

  /** Relative directory path for this package (e.g., "zroot/zsub1/zsub1_a") */
  packageDir: string;

  /** All parent packages (ordered from root to immediate parent) */
  parents: AdkObject[]; // ADK_Package[]

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
  compressionLevel?: number;
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
 * Serialization result
 */
export interface SerializeResult {
  success: boolean;
  filesCreated: string[];
  objectsProcessed: number;
  errors: PluginError[];
  metadata?: {
    totalSize: number;
    processingTime: number;
    [key: string]: unknown;
  };
}

/**
 * Plugin configuration
 */
export interface PluginConfig {
  enabled?: boolean;
  priority?: number;
  options: Record<string, unknown>;
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
 * Plugin error interface
 */
export interface PluginError {
  message: string;
  plugin: string;
  category: 'config' | 'serialization' | 'validation' | 'filesystem';
  context?: Record<string, unknown>;
  cause?: Error;
}

/**
 * Plugin specification from configuration
 */
export interface PluginSpec {
  name: string;
  version?: string;
  config?: PluginConfig;
}

/**
 * Plugin factory - creates a typed plugin with minimal boilerplate
 *
 * @example
 * export default createFormatPlugin({
 *   name: 'abapGit',
 *   version: '1.0.0',
 *   description: 'abapGit serializer',
 *   getSupportedObjectTypes: () => ['CLAS', 'INTF', 'DOMA', 'DEVC'],
 *   serializeObject: async (object, targetPath, context) => {
 *     // Implementation
 *     return { success: true, filesCreated: [] };
 *   }
 * });
 */
export function createFormatPlugin(plugin: FormatPlugin): FormatPlugin {
  return plugin;
}

/**
 * Plugin registry interface
 */
export interface IPluginRegistry {
  /**
   * Load plugins from configuration
   */
  loadFromConfig(pluginSpecs: PluginSpec[]): Promise<void>;

  /**
   * Get available format plugins
   */
  getAvailableFormats(): string[];

  /**
   * Get specific plugin instance
   */
  getPlugin(formatName: string): FormatPlugin | undefined;

  /**
   * Validate all configured plugins
   */
  validatePlugins(): ValidationResult[];

  /**
   * Register a plugin manually
   */
  register(plugin: FormatPlugin): void;

  /**
   * Unregister a plugin
   */
  unregister(formatName: string): void;
}
