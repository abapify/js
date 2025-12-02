/**
 * ADK v2 - Context
 * 
 * Injected into models. Provides typed client access.
 * 
 * Architecture:
 * - ADK objects receive services via context
 * - Services handle HTTP/XML (ADK never does raw HTTP)
 * - ADK focuses on business logic and object model
 */

import type { TransportService } from '@abapify/adt-client-v2';
import type { LockHandle } from './model';

// Re-export for convenience
export type { TransportService };

/**
 * Generic lock service for ADT objects
 * Uses the standard ADT lock API: POST {uri}?_action=LOCK
 */
export interface LockService {
  lock(uri: string): Promise<LockHandle>;
  unlock(uri: string, handle: LockHandle): Promise<void>;
}

/**
 * Services available through context
 */
export interface AdkServices {
  transports: TransportService;
  /** Generic lock service for any ADT object */
  locks?: LockService;
}

/**
 * Context provided to all ADK objects
 */
export interface AdkContext {
  /**
   * High-level service APIs
   * ADK objects use services for all HTTP operations
   */
  readonly services: AdkServices;
  
  /**
   * Raw fetch for edge cases (debugging, undocumented endpoints)
   * @deprecated Prefer using services
   */
  readonly fetch?: (url: string, options?: { method?: string; headers?: Record<string, string>; body?: string }) => Promise<string>;
}
