/**
 * @abapify/adt-puppeteer
 * 
 * Puppeteer-based authentication for SAP ADT systems.
 * Supports SSO/IDP authentication via browser automation.
 * 
 * Usage with standard config + plugin options:
 * ```ts
 * import { defineConfig } from '@abapify/adt-config';
 * import { withPuppeteer } from '@abapify/adt-puppeteer';
 * 
 * export default withPuppeteer(
 *   defineConfig({
 *     destinations: {
 *       DEV: 'https://sap-dev.example.com',
 *       QAS: 'https://sap-qas.example.com',
 *     },
 *   }),
 *   { requiredCookies: ['MYSAPSSO2', 'sap-usercontext'] }
 * );
 * ```
 * 
 * Mixed auth types (per-destination):
 * ```ts
 * import { defineConfig } from '@abapify/adt-config';
 * import { puppeteer } from '@abapify/adt-puppeteer';
 * 
 * export default defineConfig({
 *   destinations: {
 *     DEV: puppeteer('https://sap-dev.example.com'),
 *     QAS: puppeteer({ url: 'https://sap-qas.example.com', requiredCookies: ['MYSAPSSO2'] }),
 *   },
 * });
 * ```
 */

import { puppeteer } from './puppeteer-auth';
import type { AdtConfig, Destination } from '@abapify/adt-config';
import type { PuppeteerAuthOptions } from './types';

/**
 * Plugin-level options applied to all destinations
 */
export interface PuppeteerPluginOptions {
  /** Cookie names to wait for (applied to all destinations) */
  requiredCookies?: string[];
  /** Default timeout for all destinations */
  timeout?: number;
  /** Default headless mode for all destinations */
  headless?: boolean;
}

/**
 * Wrap a standard config with puppeteer auth for all destinations.
 * 
 * @param config - Standard AdtConfig from defineConfig()
 * @param options - Plugin options applied to all destinations
 */
export function withPuppeteer(
  config: AdtConfig,
  options?: PuppeteerPluginOptions
): AdtConfig {
  if (!config.destinations) {
    return config;
  }

  const destinations: Record<string, Destination> = {};

  for (const [name, dest] of Object.entries(config.destinations)) {
    // If already a Destination object with type, check if it's puppeteer
    if (typeof dest === 'object' && 'type' in dest) {
      if (dest.type === 'puppeteer') {
        // Merge plugin options with destination options
        destinations[name] = {
          type: 'puppeteer',
          options: { ...options, ...(dest.options as PuppeteerAuthOptions) },
        };
      } else {
        // Keep non-puppeteer destinations as-is
        destinations[name] = dest;
      }
    } else if (typeof dest === 'string') {
      // URL string -> puppeteer destination with plugin options
      destinations[name] = puppeteer({ url: dest, ...options });
    } else {
      // Object without type -> treat as puppeteer options
      destinations[name] = puppeteer({ ...(dest as PuppeteerAuthOptions), ...options });
    }
  }

  return { ...config, destinations };
}

// Legacy alias for backwards compatibility
export const defineConfig = withPuppeteer;

// Main exports
export { puppeteerAuth, puppeteer, toHeaders, toCookieHeader } from './puppeteer-auth';

// Default export: Standard authPlugin for AuthManager compatibility
export { default } from './auth-plugin';

// Types
export type {
  PuppeteerCredentials,
  PuppeteerAuthOptions,
  PuppeteerAuth,
  CookieData,
} from './types';
