/**
 * CLI Auth Utilities
 *
 * Thin wrapper around v1 AuthManager for loading session credentials.
 * This isolates the v1 dependency to just auth management.
 */
import { AuthManager } from '@abapify/adt-client';

/**
 * Basic auth credentials from session
 */
export interface BasicAuthCredentials {
  host: string;
  username: string;
  password: string;
  client?: string;
}

/**
 * Minimal auth session interface (subset of v1's AuthSession)
 */
export interface AuthSession {
  basicAuth?: BasicAuthCredentials;
  authType: 'oauth' | 'basic';
}

/**
 * Load auth session from CLI storage (~/.adt/auth.json)
 *
 * @returns Auth session or null if not authenticated
 */
export function loadAuthSession(): AuthSession | null {
  const authManager = new AuthManager();
  return authManager.loadSession();
}

/**
 * Get basic auth credentials or throw if not authenticated
 *
 * @returns Basic auth credentials
 * @throws Error if not authenticated or not using basic auth
 */
export function getBasicAuthCredentials(): BasicAuthCredentials {
  const session = loadAuthSession();

  if (!session) {
    throw new Error('Not authenticated. Run "npx adt auth login" first.');
  }

  if (session.authType !== 'basic' || !session.basicAuth) {
    throw new Error(
      'Basic auth credentials not found. Please login with basic auth.'
    );
  }

  return session.basicAuth;
}
