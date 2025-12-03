/**
 * ADK v2 - ADT Integration Layer
 * 
 * Single integration point for adt-client-v2.
 * All ADK objects import types from here, not directly from adt-client-v2.
 * 
 * This provides:
 * 1. Single dependency point - only this file imports from adt-client-v2
 * 2. Re-exported types - objects import from '../base/adt'
 * 3. Proxy contract - ADK-specific contract interface
 * 
 * Architecture:
 * ```
 * adt-client-v2 (external)
 *       ↓
 * base/adt.ts (integration layer)
 *       ↓
 * objects/* (ADK objects import from here)
 * ```
 */

// ============================================
// Re-export types from adt-client-v2
// Objects import these instead of from adt-client-v2 directly
// ============================================

// Client type (return type of createAdtClient)
export type { AdtClient } from '@abapify/adt-client-v2';

// Service types
export type { TransportService } from '@abapify/adt-client-v2';

// Response types (inferred from contracts/schemas)
export type { 
  ClassResponse,
  InterfaceResponse,
  PackageResponse,
  TransportGetResponse,
} from '@abapify/adt-client-v2';

// ============================================
// ADK Contract Proxy
// Wraps adt-client-v2 contract with ADK-specific interface
// ============================================

import type { AdtClient } from '@abapify/adt-client-v2';

/**
 * ADT REST contracts accessible via client.adt.*
 * 
 * This is the typed contract layer from adt-client-v2.
 * Example: client.adt.oo.classes.get('ZCL_MY_CLASS')
 */
export type AdtContracts = AdtClient['adt'];

/**
 * ADK Contract interface
 * 
 * Proxy to adt-client-v2 contracts.
 * Provides typed access to ADT REST endpoints.
 */
export interface AdkContract {
  /** OO contracts (classes, interfaces) */
  readonly oo: AdtContracts['oo'];
  /** Packages contract */
  readonly packages: AdtContracts['packages'];
  /** CTS contracts (transports) */
  readonly cts: AdtContracts['cts'];
  /** Core contracts (discovery, sessions) */
  readonly core: AdtContracts['core'];
  /** Repository contracts (search) */
  readonly repository: AdtContracts['repository'];
}

/**
 * Create ADK contract from ADT client
 * 
 * @param client - ADT client instance from createAdtClient()
 * @returns ADK contract proxy
 */
export function createAdkContract(client: AdtClient): AdkContract {
  return {
    oo: client.adt.oo,
    packages: client.adt.packages,
    cts: client.adt.cts,
    core: client.adt.core,
    repository: client.adt.repository,
  };
}
