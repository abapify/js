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
import { createAdtClient, LoggingPlugin, FileLoggingPlugin, type Logger } from '@abapify/adt-client-v2';
import type { AdtAdapterConfig } from '@abapify/adt-client-v2';
import { loadAuthSession, isExpired, type CookieCredentials, type BasicCredentials } from './auth';

/**
 * Silent logger - suppresses all output (default for CLI)
 */
const silentLogger: Logger = {
  trace: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  fatal: () => {},
  child: () => silentLogger,
};

/**
 * Console logger - outputs to console (used when enableLogging is true)
 */
const consoleLogger: Logger = {
  trace: (msg: string) => console.debug(msg),
  debug: (msg: string) => console.debug(msg),
  info: (msg: string) => console.log(msg),
  warn: (msg: string) => console.warn(msg),
  error: (msg: string) => console.error(msg),
  fatal: (msg: string) => console.error(msg),
  child: () => consoleLogger,
};

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
  /** Enable response file logging (default: false) */
  logResponseFiles?: boolean;
  /** Output directory for response files (default: './tmp/logs') */
  logOutput?: string;
  /** Write metadata alongside response files (default: false) */
  writeMetadata?: boolean;
  /** SAP System ID (SID) - e.g., 'BHF', 'S0D' (default: uses default SID from config) */
  sid?: string;
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
  // Priority: 1) user-provided logger, 2) console if enableLogging, 3) silent
  const logger = options?.logger ?? (options?.enableLogging ? consoleLogger : silentLogger);
  const session = loadAuthSession(options?.sid);

  if (!session) {
    const sidMsg = options?.sid ? ` for SID ${options.sid}` : '';
    console.error(`❌ Not authenticated${sidMsg}`);
    console.error(`💡 Run "npx adt auth login${options?.sid ? ` --sid=${options.sid}` : ''}" to authenticate first`);
    process.exit(1);
  }

  // Extract credentials based on auth method
  const baseUrl = session.host;
  const client = session.client;
  let username: string | undefined;
  let password: string | undefined;
  let cookieHeader: string | undefined;

  if (session.auth.method === 'basic') {
    const creds = session.auth.credentials as BasicCredentials;
    username = creds.username;
    password = creds.password;
  } else if (session.auth.method === 'cookie') {
    // Check if session is expired
    if (isExpired(session)) {
      console.error('❌ Session expired');
      console.error('💡 Run "npx adt auth login" to re-authenticate');
      process.exit(1);
    }

    const creds = session.auth.credentials as CookieCredentials;
    // Decode URL-encoded cookie values (e.g., %3d -> =)
    cookieHeader = decodeURIComponent(creds.cookies);

    // Cookie-based sessions often use hosts with self-signed certs (dev environments)
    // Disable SSL verification to match browser behavior
    // process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Commented out for testing proper cert validation
  } else {
    console.error(`❌ Unsupported auth method: ${session.auth.method}`);
    process.exit(1);
  }

  // Build plugin list: user plugins + optional plugins
  const plugins = [...(options?.plugins ?? [])];

  // Add file logging plugin if enabled
  if (options?.logResponseFiles) {
    plugins.push(new FileLoggingPlugin({
      outputDir: options.logOutput ?? './tmp/logs',
      writeMetadata: options.writeMetadata ?? false,
      logger,
    }));
  }

  // Add console logging plugin if enabled
  if (options?.enableLogging) {
    plugins.push(new LoggingPlugin((msg, data) => {
      logger.info(`${msg}${data ? ` ${JSON.stringify(data)}` : ''}`);
    }));
  }

  return createAdtClient({
    baseUrl,
    username,
    password,
    cookieHeader,
    client,
    logger,
    plugins,
  });
}
