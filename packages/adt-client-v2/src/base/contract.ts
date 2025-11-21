/**
 * Base Contract Module
 *
 * Centralized exports for speci REST contract functionality.
 * All external speci imports should go through this module.
 */

import {
  http as speciHttp,
  createClient as speciCreateClient,
  createHttp,
} from 'speci/rest';
import type { RestContract } from 'speci/rest';
import type { ElementSchema } from './schema';

// Re-export types
export type { RestContract };

// Re-export http methods
export const http = speciHttp;

// Re-export createClient
export const createClient = speciCreateClient;

/**
 * ADT REST Contract - extends REST contract with XML schema metadata
 *
 * Use this type for ADT API contracts that need automatic XML parsing/building.
 * The adapter will use the schema metadata to automatically serialize/deserialize XML.
 */
export type AdtRestContract = RestContract & {
  [key: string]: (...args: any[]) => {
    metadata?: {
      schema?: ElementSchema; // Shorthand for both request and response
      requestSchema?: ElementSchema; // Schema for building request XML
      responseSchema?: ElementSchema; // Schema for parsing response XML
    };
  };
};

/**
 * Create a typed ADT contract with schema metadata
 *
 * This wrapper provides type safety and eliminates the need for `satisfies AdtRestContract`.
 *
 * @example
 * const myContract = createContract({
 *   getItem: (id: string) =>
 *     http.get<ItemType, ErrorType>(`/items/${id}`, {
 *       metadata: { responseSchema: ItemSchema }
 *     })
 * });
 */
export function createContract<T extends AdtRestContract>(contract: T): T {
  return contract;
}

/**
 * ADT-specific error type
 */
export interface AdtError {
  message: string;
  code?: string;
  details?: string;
}

/**
 * Global ADT error responses
 *
 * Common HTTP error codes that ADT endpoints can return.
 * These are automatically merged with all endpoint responses.
 */
const adtGlobalErrors = {
  400: undefined as unknown as AdtError, // Bad Request
  401: undefined as unknown as AdtError, // Unauthorized
  403: undefined as unknown as AdtError, // Forbidden
  404: undefined as unknown as AdtError, // Not Found
  500: undefined as unknown as AdtError, // Internal Server Error
  503: undefined as unknown as AdtError, // Service Unavailable
} as const;

/**
 * ADT HTTP methods - pre-configured with global ADT errors
 *
 * All endpoints automatically include common error responses (400, 401, 403, 404, 500, 503).
 *
 * @example
 * // Shortcut syntax - only specify success type
 * adtHttp.get<Package>('/packages/ZTEST')
 *
 * // Full syntax - explicit control over responses
 * adtHttp.get('/packages/ZTEST', {
 *   responses: { 200: undefined as unknown as Package }
 * })
 */
export const adtHttp = createHttp(adtGlobalErrors);

// Re-export the factory for custom error types
export { createHttp };
