/**
 * ADT Configuration Types
 * 
 * Configuration types for adt.config.ts/json files.
 * Includes auth plugin definition types.
 */

// =============================================================================
// Destination - System configuration
// =============================================================================

export interface Destination<TOptions = unknown> {
  /** Auth method type identifier (e.g., 'basic', 'slc', 'puppeteer') */
  type: string;
  /** Auth method-specific options (url, etc.) */
  options: TOptions;
}

// =============================================================================
// Config - Full configuration schema
// =============================================================================

/**
 * Destination input can be:
 * - A full Destination object with type and options
 * - A string URL (to be transformed by a plugin wrapper)
 */
export type DestinationInput = Destination | string;

export interface AdtConfig {
  /** Named destinations (SID -> destination config or URL string) */
  destinations?: Record<string, DestinationInput>;
}

// =============================================================================
// Auth Plugin Types
// =============================================================================

/**
 * Result of testing credentials validity
 */
export interface AuthTestResult {
  success: boolean;
  error?: string;
  statusCode?: number;
  responseTime?: number;
}

/**
 * Auth plugin interface
 * 
 * Plugins implement this to provide authentication methods.
 * Use `defineAuthPlugin` helper for type safety.
 */
export interface AuthPlugin<
  TOptions = unknown,
  TCredentials = unknown
> {
  /** Plugin name (e.g., 'puppeteer', 'basic') */
  readonly name: string;
  
  /** Human-readable display name */
  readonly displayName?: string;

  /**
   * Authenticate and return credentials
   * @param options - Plugin-specific options from destination config
   */
  authenticate(options: TOptions): Promise<TCredentials>;

  /**
   * Test if credentials are still valid
   * @param credentials - Previously obtained credentials
   */
  test(credentials: TCredentials): Promise<AuthTestResult>;

  /**
   * Refresh credentials if supported
   * @param credentials - Current credentials
   * @returns Updated credentials or null if not supported
   */
  refresh?(credentials: TCredentials): Promise<TCredentials | null>;
}
