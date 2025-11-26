/**
 * CTS Transport Service
 * 
 * Flow:
 * 1. GET /searchconfiguration/configurations → get config ID
 * 2. GET /transportrequests?targets=true&configUri=<encoded-path> → get transports
 */

import { AdtClientType } from '../../client';
import type { Logger } from '../../types';
import type { TransportResponse } from './types';

/**
 * Create CTS Transport Service
 * 
 * @param adtClient - The speci-generated ADT client (client.adt from createAdtClient)
 * @param logger - Optional logger for debug output
 * 
 * Note: We use 'any' for adtClient because speci's type inference for ts-xsd schemas
 * produces complex types that don't align with our TransportResponse type at compile time.
 * The runtime works correctly, and the service's public API is fully typed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createTransportService(adtClient: AdtClientType, logger?: Logger) {
  // Cache config URI to avoid repeated lookups
  let cachedConfigUri: string | undefined;

  /**
   * Get search configuration URI (cached)
   */
  async function getConfigUri(): Promise<string> {
    if (cachedConfigUri) return cachedConfigUri;

    logger?.debug('Fetching search configuration...');
    const response = await adtClient.cts.transportrequests.searchconfiguration.configurations.get() as any;
    
    // Response is now a parsed object with configuration array
    // Each configuration has links with href pointing to the config URI
    const configs = response?.configuration;
    if (!configs || configs.length === 0) {
      throw new Error('No search configuration found');
    }
    
    // Get the first configuration's self link
    const firstConfig = configs[0];
    const selfLink = firstConfig?.link?.find((l: { rel?: string }) => l.rel === 'self' || !l.rel);
    const uri = selfLink?.href as string | undefined;
    
    if (!uri) {
      throw new Error('No search configuration URI found');
    }
    
    cachedConfigUri = uri;
    logger?.debug('Config URI:', uri);
    return uri;
  }

  return {
    /**
     * List transports using search configuration
     */
    async list() {
      const configUri = await getConfigUri();
      
      logger?.debug('Fetching transports with config...');
      const response = await adtClient.cts.transportrequests.get({
        targets: 'true',
        configUri: configUri,
      });

      return response;
    },

    /**
     * Clear cached configuration (force refresh)
     */
    clearCache() {
      cachedConfigUri = undefined;
    },
  };
}

export type TransportService = ReturnType<typeof createTransportService>;
