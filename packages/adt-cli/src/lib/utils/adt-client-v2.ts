/**
 * Utility for initializing ADT Client V2 in CLI commands
 *
 * This module provides CLI-specific auth integration for the v2 client.
 * It bridges the gap between CLI's auth management and v2's pure client API.
 *
 * Architecture Note:
 * - CLI handles auth management (via v1 AuthManager stored in ~/.adt/auth.json)
 * - This module extracts credentials and creates v2 client
 * - v2 client remains pure (no CLI/file I/O dependencies)
 */
import { createAdtClient } from '@abapify/adt-client-v2';
import type { AdtAdapterConfig } from '@abapify/adt-client-v2';
import { loadAuthSession } from './auth';

/**
 * Simple logger interface for CLI messages
 */
export interface Logger {
  error(message: string): void;
}

/**
 * Default console logger
 */
const defaultLogger: Logger = {
  error: (message: string) => console.error(message),
};

/**
 * Options for creating ADT v2 client
 */
export interface AdtClientV2Options {
  /** Optional response plugins */
  plugins?: AdtAdapterConfig['plugins'];
  /** Optional logger for error messages (defaults to console.error) */
  logger?: Logger;
}

/**
 * Get authenticated ADT v2 client
 *
 * Loads auth session from CLI config and creates v2 client.
 * Exits with error if not authenticated.
 *
 * @param options - Optional configuration (plugins, etc.)
 * @returns Authenticated ADT v2 client
 *
 * @example
 * // Simple usage
 * const client = getAdtClientV2();
 *
 * @example
 * // With plugins
 * const client = getAdtClientV2({
 *   plugins: [myPlugin]
 * });
 */
export function getAdtClientV2(options?: AdtClientV2Options) {
  const logger = options?.logger ?? defaultLogger;
  const session = loadAuthSession();

  if (!session || !session.basicAuth) {
    logger.error('❌ Not authenticated');
    logger.error('💡 Run "npx adt auth login" to authenticate first');
    process.exit(1);
  }

  return createAdtClient({
    baseUrl: session.basicAuth.host,
    username: session.basicAuth.username,
    password: session.basicAuth.password,
    client: session.basicAuth.client,
    plugins: options?.plugins,
  });
}
