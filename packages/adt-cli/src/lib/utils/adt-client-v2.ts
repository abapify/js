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
import { createAdtClient, LoggingPlugin, FileLoggingPlugin, type Logger, type ResponseContext, type AdtClient } from '@abapify/adt-client-v2';
import type { AdtAdapterConfig } from '@abapify/adt-client-v2';
import { loadAuthSession, isExpired, refreshCredentials, type CookieCredentials, type BasicCredentials, type AuthSession } from './auth';

// =============================================================================
// Global CLI Context (set by CLI preAction hook)
// =============================================================================

export interface CliContext {
  sid?: string;
  logger?: Logger;
  logLevel?: string;
  logOutput?: string;
  logResponseFiles?: boolean;
}

let globalCliContext: CliContext = {};

/**
 * Set global CLI context (called by CLI preAction hook)
 * This allows getAdtClientV2() to auto-read CLI options without passing them explicitly
 */
export function setCliContext(context: CliContext): void {
  globalCliContext = { ...globalCliContext, ...context };
}

/**
 * Get current CLI context
 */
export function getCliContext(): CliContext {
  return globalCliContext;
}

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

// =============================================================================
// Capture Plugin Support
// =============================================================================

/**
 * Captured response data from the last request
 */
export interface CapturedResponse {
  /** Raw XML/text response */
  xml?: string;
  /** Parsed JSON response */
  json?: unknown;
}

// Global capture storage (reset on each request)
let lastCaptured: CapturedResponse = {};

/**
 * Get the last captured response (for commands that need raw XML/JSON)
 */
export function getCaptured(): CapturedResponse {
  return lastCaptured;
}

/**
 * Reset captured data (called before each request when capture is enabled)
 */
function resetCaptured(): void {
  lastCaptured = {};
}

// =============================================================================
// Client Options
// =============================================================================

/**
 * Options for creating ADT v2 client
 */
export interface AdtClientV2Options {
  /** Optional response plugins (added after built-in plugins) */
  plugins?: AdtAdapterConfig['plugins'];
  /** Optional logger for CLI messages (defaults to global CLI logger or silent) */
  logger?: Logger;
  /** Enable request/response logging (default: from CLI --verbose flag) */
  enableLogging?: boolean;
  /** Enable response file logging (default: from CLI --log-response-files flag) */
  logResponseFiles?: boolean;
  /** Output directory for response files (default: from CLI --log-output flag or './tmp/logs') */
  logOutput?: string;
  /** Write metadata alongside response files (default: false) */
  writeMetadata?: boolean;
  /** SAP System ID (SID) - e.g., 'BHF', 'S0D' (default: from CLI --sid flag) */
  sid?: string;
  /** Enable capture plugin to capture raw XML and parsed JSON (default: false) */
  capture?: boolean;
}

/**
 * Try to auto-refresh expired session credentials
 * 
 * @param session - The expired session
 * @param sid - Optional SID for error messages
 * @returns Updated session with fresh credentials
 */
async function tryAutoRefresh(session: AuthSession, sid?: string): Promise<AuthSession> {
  // Check if plugin is available for refresh
  if (!session.auth.plugin) {
    console.error('❌ Session expired');
    console.error('💡 Run "npx adt auth login" to re-authenticate');
    process.exit(1);
  }

  console.log(`🔄 Session expired for ${session.sid}, refreshing...`);
  
  try {
    const refreshedSession = await refreshCredentials(session);
    console.log(`✅ Session refreshed for ${session.sid}`);
    return refreshedSession;
  } catch (error) {
    console.error('❌ Auto-refresh failed:', error instanceof Error ? error.message : String(error));
    const sidArg = sid ? ` --sid=${sid}` : '';
    console.error(`💡 Run "npx adt auth login${sidArg}" to re-authenticate manually`);
    process.exit(1);
  }
}

/**
 * Get authenticated ADT v2 client
 *
 * Loads auth session from CLI config and creates v2 client.
 * Automatically refreshes expired sessions when possible.
 * Exits with error if not authenticated.
 *
 * @param options - Optional configuration (plugins, logger, etc.)
 * @returns Authenticated ADT v2 client
 *
 * @example
 * // Simple usage
 * const client = await getAdtClientV2();
 *
 * @example
 * // With custom logger
 * const client = await getAdtClientV2({
 *   logger: myLogger,
 *   enableLogging: true  // Enable HTTP request/response logging
 * });
 *
 * @example
 * // With plugins
 * const client = await getAdtClientV2({
 *   plugins: [myPlugin]
 * });
 */
export async function getAdtClientV2(options?: AdtClientV2Options): Promise<AdtClient> {
  // Merge with global CLI context (explicit options take precedence)
  const ctx = getCliContext();
  const effectiveOptions = {
    sid: options?.sid ?? ctx.sid,
    logger: options?.logger ?? ctx.logger,
    logResponseFiles: options?.logResponseFiles ?? ctx.logResponseFiles,
    logOutput: options?.logOutput ?? ctx.logOutput ?? './tmp/logs',
    enableLogging: options?.enableLogging,
    writeMetadata: options?.writeMetadata ?? false,
    capture: options?.capture ?? false,
    plugins: options?.plugins ?? [],
  };

  // Priority: 1) user-provided logger, 2) global CLI logger, 3) console if enableLogging, 4) silent
  const logger = effectiveOptions.logger ?? (effectiveOptions.enableLogging ? consoleLogger : silentLogger);
  let session = loadAuthSession(effectiveOptions.sid);

  if (!session) {
    const sidMsg = effectiveOptions.sid ? ` for SID ${effectiveOptions.sid}` : '';
    console.error(`❌ Not authenticated${sidMsg}`);
    console.error(`💡 Run "npx adt auth login${effectiveOptions.sid ? ` --sid=${effectiveOptions.sid}` : ''}" to authenticate first`);
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
    // Check if session is expired - try auto-refresh first
    if (isExpired(session)) {
      session = await tryAutoRefresh(session, effectiveOptions.sid);
    }

    const creds = session.auth.credentials as CookieCredentials;
    // Decode URL-encoded cookie values (e.g., %3d -> =)
    cookieHeader = decodeURIComponent(creds.cookies);
  } else {
    console.error(`❌ Unsupported auth method: ${session.auth.method}`);
    process.exit(1);
  }

  // Build plugin list: built-in plugins first, then user plugins
  const plugins: AdtAdapterConfig['plugins'] = [];

  // Add capture plugin if enabled (must be first to capture before other plugins)
  if (effectiveOptions.capture) {
    resetCaptured();
    plugins.push({
      name: 'capture',
      process: (context: ResponseContext) => {
        lastCaptured = {
          xml: context.rawText,
          json: context.parsedData,
        };
        return context.parsedData;
      },
    });
  }

  // Add file logging plugin if enabled
  if (effectiveOptions.logResponseFiles) {
    plugins.push(new FileLoggingPlugin({
      outputDir: effectiveOptions.logOutput,
      writeMetadata: effectiveOptions.writeMetadata,
      logger,
    }));
  }

  // Add console logging plugin if enabled
  if (effectiveOptions.enableLogging) {
    plugins.push(new LoggingPlugin((msg, data) => {
      logger.info(`${msg}${data ? ` ${JSON.stringify(data)}` : ''}`);
    }));
  }

  // Add user-provided plugins last
  plugins.push(...effectiveOptions.plugins);

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
