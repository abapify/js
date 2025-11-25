/**
 * Puppeteer Authentication Plugin
 * 
 * Uses Puppeteer to automate browser-based SSO login for SAP systems.
 * Opens a browser window, waits for user to complete SSO, captures cookies.
 */

import * as pptr from 'puppeteer';
import type { Browser, Page, Cookie } from 'puppeteer';
import { defineAuthPlugin } from '@abapify/adt-config';
import type { PuppeteerCredentials, PuppeteerAuthOptions, CookieData } from './types';

const DEFAULT_TIMEOUT = 120_000; // 2 minutes
const SYSTEM_INFO_PATH = '/sap/bc/adt/core/http/systeminformation';

/**
 * Check if a cookie name matches a pattern (supports * wildcard)
 * @example matchesCookiePattern('SAP_SESSIONID_S0D_200', 'SAP_SESSIONID_*') // true
 */
function matchesCookiePattern(cookieName: string, pattern: string): boolean {
  if (!pattern.includes('*')) {
    return cookieName === pattern;
  }
  // Convert glob pattern to regex: * -> .*
  const regexPattern = pattern.replace(/\*/g, '.*');
  return new RegExp(`^${regexPattern}$`).test(cookieName);
}

/**
 * Check if a cookie matches any of the required patterns
 */
function cookieMatchesAny(cookieName: string, patterns: string[]): boolean {
  return patterns.some(pattern => matchesCookiePattern(cookieName, pattern));
}

/**
 * Check if all required patterns have at least one matching cookie
 */
function allPatternsMatched(cookies: { name: string }[], patterns: string[]): boolean {
  return patterns.every(pattern => 
    cookies.some(c => matchesCookiePattern(c.name, pattern))
  );
}

/**
 * Wait for authentication to complete
 * Waits until the page content shows successful authentication (XML response)
 */
async function waitForAuthentication(
  page: Page,
  baseUrl: string,
  timeout: number
): Promise<void> {
  const sapHost = new URL(baseUrl).hostname;
  const startTime = Date.now();
  
  // Poll for authentication completion
  while (Date.now() - startTime < timeout) {
    const currentUrl = page.url();
    
    // Must be on SAP domain
    if (!currentUrl.includes(sapHost)) {
      await new Promise(resolve => setTimeout(resolve, 500));
      continue;
    }
    
    // Check page content - successful auth returns XML, not HTML with SAML form
    try {
      const content = await page.content();
      
      // If we see XML declaration or ADT namespace, auth is complete
      if (content.includes('<?xml') || content.includes('xmlns:adtcore')) {
        return;
      }
      
      // If we see SAML form, auth is still in progress
      if (content.includes('SAMLRequest') || content.includes('saml')) {
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
      
      // On systeminformation endpoint with non-SAML response = success
      if (currentUrl.includes('/sap/bc/adt/core/http/systeminformation') && 
          !content.includes('SAMLRequest')) {
        return;
      }
    } catch {
      // Page might be navigating, ignore errors
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  throw new Error(`Authentication timeout after ${timeout}ms`);
}

/**
 * Convert Puppeteer cookies to our format
 */
function convertCookies(cookies: Cookie[]): CookieData[] {
  return cookies.map(cookie => ({
    name: cookie.name,
    value: cookie.value,
    domain: cookie.domain,
    path: cookie.path,
    expires: cookie.expires,
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite as CookieData['sameSite'],
  }));
}

/**
 * Puppeteer authentication plugin
 * 
 * Usage:
 * ```ts
 * import { puppeteerAuth } from '@abapify/adt-puppeteer';
 * 
 * const credentials = await puppeteerAuth.authenticate({
 *   url: 'https://sap-system.example.com',
 * });
 * ```
 */
export const puppeteerAuth = defineAuthPlugin<PuppeteerAuthOptions, PuppeteerCredentials>({
  name: 'puppeteer',
  displayName: 'Puppeteer SSO',

  async authenticate(options) {
    const {
      url,
      headless = false, // Show browser by default for SSO
      timeout = DEFAULT_TIMEOUT,
      userAgent,
      requiredCookies,
    } = options;

    // Build the target URL (ADT systeminformation endpoint)
    const targetUrl = new URL(SYSTEM_INFO_PATH, url);

    let browser: Browser | null = null;

    try {
      // Launch browser
      browser = await pptr.launch({
        headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--ignore-certificate-errors',
        ],
      });

      const page = await browser.newPage();

      if (userAgent) {
        await page.setUserAgent(userAgent);
      }

      // Navigate to SAP system
      console.log(`🌐 Opening browser for SSO login: ${targetUrl.toString()}`);
      console.log('💡 Please complete the login in the browser window...');

      await page.goto(targetUrl.toString(), {
        waitUntil: 'domcontentloaded',
        timeout,
      });

      // Wait for successful authentication
      await waitForAuthentication(page, url, timeout);

      // Create CDP session to get all cookies
      const client = await page.createCDPSession();
      const sapHost = new URL(url).hostname;
      
      // Poll for required cookies
      const startWait = Date.now();
      let sapCookies: Cookie[] = [];
      const cookieWaitTimeout = 10000; // Max 10 seconds
      
      while (Date.now() - startWait < cookieWaitTimeout) {
        const { cookies: allCookies } = await client.send('Network.getAllCookies');
        
        // Filter to SAP domain cookies
        const domainCookies = allCookies.filter((c: { domain: string }) => 
          c.domain.includes(sapHost) || sapHost.includes(c.domain.replace(/^\./, ''))
        ) as Cookie[];
        
        if (requiredCookies && requiredCookies.length > 0) {
          // Wait for ALL required cookie patterns to have at least one match
          const foundCookies = domainCookies.filter(c => cookieMatchesAny(c.name, requiredCookies));
          
          if (allPatternsMatched(foundCookies, requiredCookies)) {
            // All required patterns matched - store ONLY matching cookies
            sapCookies = foundCookies;
            break;
          }
        } else {
          // No specific cookies required - use default behavior
          sapCookies = domainCookies;
          const hasSessionCookie = sapCookies.some(c => 
            c.name === 'MYSAPSSO2' || 
            c.name === 'sap-usercontext' ||
            c.name.startsWith('SAP_SESSIONID')
          );
          
          if (hasSessionCookie || sapCookies.length >= 3) {
            break;
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Debug: log all captured cookies
      console.log(`🍪 Captured ${sapCookies.length} cookies: ${sapCookies.map(c => c.name).join(', ')}`);
      
      // Final check if we got what we need
      if (requiredCookies && requiredCookies.length > 0) {
        const missingPatterns = requiredCookies.filter(
          pattern => !sapCookies.some(c => matchesCookiePattern(c.name, pattern))
        );
        if (missingPatterns.length > 0) {
          throw new Error(`Missing required cookies matching: ${missingPatterns.join(', ')}`);
        }
      }
      
      const cookieData = convertCookies(sapCookies);
      const cookieNames = sapCookies.map(c => c.name).join(', ');

      console.log(`✅ Authentication successful! Captured cookies: ${cookieNames}`);

      return {
        baseUrl: url,
        cookies: cookieData,
        authenticatedAt: new Date(),
        userAgent: userAgent || await page.evaluate(() => navigator.userAgent),
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  },

  async test(credentials) {
    const startTime = Date.now();

    try {
      // Build cookie header
      const cookieHeader = credentials.cookies
        .map(c => `${c.name}=${c.value}`)
        .join('; ');

      // Test ADT discovery endpoint
      const testUrl = new URL(SYSTEM_INFO_PATH, credentials.baseUrl);

      const response = await fetch(testUrl.toString(), {
        headers: {
          'Cookie': cookieHeader,
          'Accept': 'application/xml',
        },
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          success: true,
          statusCode: response.status,
          responseTime,
        };
      }

      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status,
        responseTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        responseTime: Date.now() - startTime,
      };
    }
  },

  async refresh() {
    // Refresh is not supported for cookie-based auth
    // User must re-authenticate via browser
    return null;
  },
});

/**
 * Convert puppeteer credentials to HTTP headers
 */
export function toHeaders(credentials: PuppeteerCredentials): Record<string, string> {
  const cookieHeader = credentials.cookies
    .map(c => `${c.name}=${c.value}`)
    .join('; ');
  return {
    Cookie: cookieHeader,
    ...(credentials.userAgent ? { 'User-Agent': credentials.userAgent } : {}),
  };
}

/**
 * Convert puppeteer credentials to cookie header string
 * Note: Cookie values from Puppeteer may be URL-encoded, we decode them for the header
 */
export function toCookieHeader(credentials: PuppeteerCredentials): string {
  return credentials.cookies
    .map(c => {
      // Decode URL-encoded cookie values (e.g., %3d -> =)
      const decodedValue = decodeURIComponent(c.value);
      return `${c.name}=${decodedValue}`;
    })
    .join('; ');
}

/**
 * Destination factory for puppeteer auth
 * 
 * Usage in adt.config.ts:
 * ```ts
 * import { puppeteer } from '@abapify/adt-puppeteer';
 * 
 * export default defineConfig({
 *   destinations: {
 *     DEV: puppeteer('https://sap-dev.example.com'),
 *     QAS: puppeteer({ url: 'https://sap-qas.example.com', timeout: 60000 }),
 *   },
 * });
 * ```
 */
export function puppeteer(urlOrOptions: string | PuppeteerAuthOptions) {
  const options = typeof urlOrOptions === 'string' 
    ? { url: urlOrOptions } 
    : urlOrOptions;
  return {
    type: 'puppeteer' as const,
    options,
  };
}
