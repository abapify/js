/**
 * ADK v2 - Global Context Provider
 * 
 * Provides a global ADK context that can be set once and used by all ADK objects.
 * This eliminates the need to pass context to every ADK operation.
 * 
 * Usage:
 *   // Initialize once (e.g., in CLI bootstrap)
 *   import { initializeAdk } from '@abapify/adk-v2';
 *   initializeAdk(client);
 * 
 *   // Then use ADK objects without passing context
 *   const transport = await AdkTransportRequest.get('S0DK900001');
 * 
 * For testing or multi-connection scenarios, you can still pass explicit context:
 *   const transport = await AdkTransportRequest.get('S0DK900001', customCtx);
 */

import type { AdkContext, AdkServices } from './context';

// =============================================================================
// Global State
// =============================================================================

let globalContext: AdkContext | null = null;

// =============================================================================
// Public API
// =============================================================================

/**
 * Initialize the global ADK context from an ADT client.
 * 
 * Call this once during application bootstrap (e.g., in CLI initialization).
 * After initialization, ADK objects can be used without passing context.
 * 
 * @param client - ADT client v2 instance with services
 * @throws Error if client doesn't have required services
 * 
 * @example
 * ```ts
 * import { initializeAdk } from '@abapify/adk-v2';
 * import { getAdtClientV2 } from './utils/adt-client-v2';
 * 
 * const client = await getAdtClientV2();
 * initializeAdk(client);
 * 
 * // Now ADK objects work without context
 * const transport = await AdkTransportRequest.get('S0DK900001');
 * ```
 */
export function initializeAdk(client: { services: AdkServices }): void {
  if (!client?.services) {
    throw new Error('ADK initialization failed: client must have services property');
  }
  
  globalContext = {
    services: client.services,
  };
}

/**
 * Get the global ADK context.
 * 
 * Used internally by ADK objects when no explicit context is provided.
 * 
 * @returns The global ADK context
 * @throws Error if ADK has not been initialized
 * 
 * @example
 * ```ts
 * // Internal usage in ADK objects:
 * static async get(number: string, ctx?: AdkContext): Promise<AdkTransportRequest> {
 *   const context = ctx ?? getGlobalContext();
 *   // ...
 * }
 * ```
 */
export function getGlobalContext(): AdkContext {
  if (!globalContext) {
    throw new Error(
      'ADK not initialized. Call initializeAdk(client) before using ADK objects.\n' +
      'Example:\n' +
      '  import { initializeAdk } from \'@abapify/adk-v2\';\n' +
      '  initializeAdk(client);'
    );
  }
  return globalContext;
}

/**
 * Check if ADK has been initialized.
 * 
 * Useful for conditional logic or error handling.
 * 
 * @returns true if initializeAdk() has been called
 */
export function isAdkInitialized(): boolean {
  return globalContext !== null;
}

/**
 * Reset the global ADK context.
 * 
 * Primarily for testing purposes. Clears the global context.
 */
export function resetAdk(): void {
  globalContext = null;
}

/**
 * Get the global context or return undefined if not initialized.
 * 
 * Unlike getGlobalContext(), this doesn't throw - useful when you want
 * to check if context exists before using it.
 * 
 * @returns The global context or undefined
 */
export function tryGetGlobalContext(): AdkContext | undefined {
  return globalContext ?? undefined;
}
