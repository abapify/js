/**
 * CTS Transport Service
 * 
 * Flow:
 * 1. GET /searchconfiguration/configurations → get config ID
 * 2. GET /transportrequests?targets=true&configUri=<encoded-path> → get transports
 */

import { AdtClientType } from '../../client';
import type { Logger } from '../../types';

/**
 * Create CTS Transport Service
 * 
 * @param adtClient - The speci-generated ADT client (client.adt from createAdtClient)
 * @param logger - Optional logger for debug output
 */
export function createTransportService(adtClient: AdtClientType, logger?: Logger) {
  // Cache config URI to avoid repeated lookups
  let cachedConfigUri: string | undefined;

  /**
   * Get search configuration URI (cached)
   */
  async function getConfigUri(): Promise<string> {
    if (cachedConfigUri) return cachedConfigUri;

    logger?.debug('Fetching search configuration...');
    // Type is automatically inferred from speci-compatible schema
    const response = await adtClient.cts.transportrequests.searchconfiguration.configurations.get();
    
    // Response is a parsed object with configuration (single or array)
    // Each configuration has a link with href pointing to the config URI
    const configs = response?.configuration;
    if (!configs) {
      throw new Error('No search configuration found');
    }
    
    // Normalize to array (schema allows single or multiple)
    const configArray = Array.isArray(configs) ? configs : [configs];
    
    if (configArray.length === 0) {
      throw new Error('No search configuration found');
    }
    
    // Get the first configuration's link
    const firstConfig = configArray[0];
    const uri = firstConfig?.link?.href;
    
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
