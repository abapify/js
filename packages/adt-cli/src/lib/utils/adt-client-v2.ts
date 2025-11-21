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
import { createAdtClient, type ResponsePlugin, type ResponseContext } from '@abapify/adt-client-v2';
import type { AdtAdapterConfig } from '@abapify/adt-client-v2';
import { loadAuthSession } from './auth';

/**
 * Simple logger interface for CLI messages
 */
export interface Logger {
  error(message: string): void;
  info?(message: string): void;
  debug?(message: string): void;
}

/**
 * Default console logger
 */
const defaultLogger: Logger = {
  error: (message: string) => console.error(message),
  info: (message: string) => console.log(message),
  debug: (message: string) => console.debug(message),
};

/**
 * Create logging plugin that bridges CLI logger to v2 client
 *
 * @param logger - CLI logger instance
 * @returns Response plugin for HTTP request/response logging
 */
function createLoggingPlugin(logger: Logger): ResponsePlugin {
  return {
    name: 'cli-logger',
    process(context: ResponseContext) {
      // Log HTTP requests at debug level if available
      if (logger.debug) {
        logger.debug(`[${context.method}] ${context.url}`);
      }
      // Don't modify data, just observe
      return context.parsedData;
    },
  };
}

/**
 * Options for creating ADT v2 client
 */
export interface AdtClientV2Options {
  /** Optional response plugins */
  plugins?: AdtAdapterConfig['plugins'];
  /** Optional logger for CLI messages (defaults to console) */
  logger?: Logger;
  /** Enable request/response logging (default: false) */
  enableLogging?: boolean;
}

/**
 * Get authenticated ADT v2 client
 *
 * Loads auth session from CLI config and creates v2 client.
 * Exits with error if not authenticated.
 *
 * @param options - Optional configuration (plugins, logger, etc.)
 * @returns Authenticated ADT v2 client
 *
 * @example
 * // Simple usage
 * const client = getAdtClientV2();
 *
 * @example
 * // With custom logger
 * const client = getAdtClientV2({
 *   logger: myLogger,
 *   enableLogging: true  // Enable HTTP request/response logging
 * });
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

  // Build plugin list: user plugins + optional logging plugin
  const plugins = [...(options?.plugins ?? [])];
  if (options?.enableLogging) {
    plugins.push(createLoggingPlugin(logger));
  }

  return createAdtClient({
    baseUrl: session.basicAuth.host,
    username: session.basicAuth.username,
    password: session.basicAuth.password,
    client: session.basicAuth.client,
    plugins,
  });
}
