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
   * Serialize ADK objects to file system
   */
  serialize(
    objects: AdkObject[],
    targetPath: string,
    options?: SerializeOptions
  ): Promise<SerializeResult>;

  /**
   * Deserialize file system to ADK objects
   */
  deserialize(
    sourcePath: string,
    options?: DeserializeOptions
  ): Promise<AdkObject[]>;

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
