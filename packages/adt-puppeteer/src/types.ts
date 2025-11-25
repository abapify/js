/**
 * Puppeteer authentication types
 */

/**
 * Puppeteer authentication credentials
 * Stores cookies obtained from browser-based SSO login
 */
export interface PuppeteerCredentials {
  /** SAP system base URL */
  baseUrl: string;
  /** Cookies from authenticated session */
  cookies: CookieData[];
  /** When the session was created */
  authenticatedAt: Date;
  /** Optional: User agent used during authentication */
  userAgent?: string;
}

/**
 * Cookie data structure (compatible with Puppeteer)
 */
export interface CookieData {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * Puppeteer auth configuration options
 */
export interface PuppeteerAuthOptions {
  /** SAP system URL */
  url: string;
  /** Show browser window during login (default: false for SSO) */
  headless?: boolean;
  /** Timeout for login in ms (default: 120000 = 2 minutes) */
  timeout?: number;
  /** Custom user agent */
  userAgent?: string;
  /** 
   * Cookie names to wait for before completing auth.
   * Auth completes when ALL these cookies are present.
   * Only these cookies will be stored (security: no extra cookies).
   * @example ['MYSAPSSO2', 'sap-usercontext']
   */
  requiredCookies?: string[];
}

/**
 * Puppeteer auth type for adt-auth integration
 */
export interface PuppeteerAuth {
  type: 'puppeteer';
  credentials: PuppeteerCredentials;
}
