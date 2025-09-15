import { PluginSpec } from '@abapify/adk';

/**
 * CLI configuration interface
 */
export interface CliConfig {
  auth: AuthConfig;
  plugins: PluginsConfig;
  defaults?: DefaultsConfig;
}

/**
 * Authentication configuration
 */
export interface AuthConfig {
  type: 'btp' | 'basic' | 'mock';
  btp?: BtpAuthConfig;
  basic?: BasicAuthConfig;
  mock?: MockAuthConfig;
}

/**
 * BTP service key authentication
 */
export interface BtpAuthConfig {
  serviceKey: string; // Path to service key file
}

/**
 * Basic authentication
 */
export interface BasicAuthConfig {
  username: string;
  password: string;
  host: string;
}

/**
 * Mock authentication for testing
 */
export interface MockAuthConfig {
  enabled: boolean;
  mockData?: string; // Path to mock data directory
}

/**
 * Plugins configuration
 */
export interface PluginsConfig {
  formats: PluginSpec[];
}

/**
 * Default settings
 */
export interface DefaultsConfig {
  format?: string;
  outputPath?: string;
  objectTypes?: string[];
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Configuration loader interface
 */
export interface ConfigLoader {
  /**
   * Load configuration from file
   */
  load(configPath?: string): Promise<CliConfig>;

  /**
   * Validate configuration
   */
  validate(config: CliConfig): ConfigValidationResult;

  /**
   * Get default configuration
   */
  getDefault(): CliConfig;

  /**
   * Save configuration to file
   */
  save(config: CliConfig, configPath?: string): Promise<void>;
}
