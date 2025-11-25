/**
 * Base interface for authentication methods
 */

import type {
  AuthConfig,
  AuthCredentials,
  ConnectionTestResult,
} from '../types';

/**
 * Authentication method interface
 * 
 * Each auth method (basic, SLC, OAuth) implements this interface
 */
export interface AuthMethod<
  TConfig extends AuthConfig = AuthConfig,
  TCredentials extends AuthCredentials = AuthCredentials
> {
  /**
   * Method name (e.g., 'basic', 'slc', 'oauth')
   */
  readonly name: string;

  /**
   * Authenticate and return credentials
   * 
   * @param config - Authentication configuration
   * @returns Credentials to be stored
   */
  authenticate(config: TConfig): Promise<TCredentials>;

  /**
   * Test if credentials are valid
   * 
   * @param credentials - Stored credentials
   * @returns Test result with success status
   */
  test(credentials: TCredentials): Promise<ConnectionTestResult>;

  /**
   * Refresh credentials if supported (e.g., OAuth token refresh)
   * 
   * @param credentials - Current credentials
   * @returns Updated credentials or null if refresh not supported
   */
  refresh?(credentials: TCredentials): Promise<TCredentials | null>;
}
