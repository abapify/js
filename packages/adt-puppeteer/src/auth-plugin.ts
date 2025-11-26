/**
 * Standard authPlugin export for AuthManager compatibility
 * 
 * Wraps puppeteerAuth to return AuthPluginResult format expected by AuthManager.
 */

import type { AuthPlugin, AuthPluginResult, AuthPluginOptions } from '@abapify/adt-auth';
import { puppeteerAuth, toCookieHeader } from './puppeteer-auth';

/**
 * Standard auth plugin that conforms to AuthPluginResult interface.
 * 
 * This is used by AuthManager for credential refresh.
 */
const authPlugin: AuthPlugin = {
  async authenticate(options: AuthPluginOptions): Promise<AuthPluginResult> {
    // Get puppeteer credentials (cookies as array)
    const credentials = await puppeteerAuth.authenticate(options);
    
    // Convert to standard AuthPluginResult format
    const cookieString = toCookieHeader(credentials);
    
    return {
      method: 'cookie',
      credentials: {
        cookies: cookieString,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
      },
    };
  },
};

export default authPlugin;
