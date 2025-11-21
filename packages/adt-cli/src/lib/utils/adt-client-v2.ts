/**
 * Utility for initializing ADT Client V2 in CLI commands
 */
import { createAdtClient } from '@abapify/adt-client-v2';
import type { AdtAdapterConfig } from '@abapify/adt-client-v2';
import { AuthManager } from '@abapify/adt-client';

/**
 * Options for creating ADT v2 client
 */
export interface AdtClientV2Options {
  /** Optional response plugins */
  plugins?: AdtAdapterConfig['plugins'];
}

/**
 * Get authenticated ADT v2 client
 *
 * Loads session from v1 auth manager and creates v2 client.
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
  const authManager = new AuthManager();
  const session = authManager.loadSession();

  if (!session || !session.basicAuth) {
    console.error('❌ Not authenticated');
    console.error('💡 Run "npx adt auth login" to authenticate first');
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
