/**
 * ADK v2 - Context
 * 
 * Injected into models. Provides typed client access.
 */

// TODO: Import from @abapify/adt-client-v2 when ready
// import type { AdtClientV2 } from '@abapify/adt-client-v2';

/**
 * Context provided to all models
 */
export interface AdkContext {
  /**
   * Typed ADT client
   * TODO: Replace 'unknown' with AdtClientV2 when available
   */
  readonly client: unknown;
}
