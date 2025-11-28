/**
 * ADT Client V2 - Two-Layer Architecture
 *
 * Provides both low-level contract access and high-level service APIs:
 * - client.adt.*       - Raw ADT REST contracts (speci-generated)
 * - client.services.*  - Business logic and orchestration
 * - client.fetch()     - Generic HTTP utility method
 */

import { createClient } from './base';
import { adtContract } from './contract';
import { createAdtAdapter, type AdtAdapterConfig } from './adapter';
import { createTransportService } from './services/cts';
import type { HttpRequestOptions, RestClient } from 'speci/rest';

/**
 * Fetch options for generic HTTP requests
 */
export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
}

/**
 * Create ADT client with two-layer architecture
 *
 * @example
 * // Basic usage
 * const client = createAdtClient({
 *   baseUrl: 'https://sap-system.com:8000',
 *   username: 'user',
 *   password: 'pass',
 *   client: '100'
 * });
 *
 * // Low-level contract access
 * const session = await client.adt.core.http.sessions.getSession();
 * const info = await client.adt.core.http.systeminformation.getSystemInformation();
 *
 * // High-level service API (future)
 * // await client.services.classes.get('ZCL_MY_CLASS');
 *
 * // Generic fetch utility
 * const response = await client.fetch('/sap/bc/adt/arbitrary/endpoint', {
 *   method: 'GET',
 *   headers: { Accept: 'application/xml' }
 * });
 */

export type AdtClientType = RestClient<typeof adtContract>
export function createAdtClient(config: AdtAdapterConfig) {
  const adapter = createAdtAdapter(config);
  const adtClient = createClient(adtContract, {
    baseUrl: config.baseUrl,
    adapter,
  });

  return {
    /**
     * Low-level ADT REST contracts
     * Direct access to speci-generated client methods
     */
    adt: adtClient,

    /**
     * High-level service APIs
     * Business logic, validation, and orchestration
     */
    services: {
      /** CTS Transport management */
      transports: createTransportService(adtClient, config.logger),
    },

    /**
     * Generic fetch utility for arbitrary ADT endpoints
     * Useful for debugging, testing, or accessing undocumented APIs
     *
     * @param url - The ADT endpoint path (e.g., '/sap/bc/adt/core/http/sessions')
     * @param options - Request options (method, headers, body)
     * @returns Raw response as string
     */
    async fetch(url: string, options?: FetchOptions): Promise<string> {
      const method = options?.method || 'GET';
      const headers = options?.headers || {};
      const body = options?.body;

      const requestOptions: HttpRequestOptions = {
        method,
        url,
        headers,
        body,
      };

      // Make request through adapter and return as string
      const response = await adapter.request<string>(requestOptions);
      return response;
    },
  };
}

export type AdtClient = ReturnType<typeof createAdtClient>;
