/**
 * ADT Client V2 - Minimalistic speci-based ADT client
 *
 * Uses speci's client generation instead of manually implementing HTTP calls.
 */

// Export main client factory
export { createAdtClient, type AdtClient } from './client';

// Export contract for advanced use cases
export { adtContract, type AdtContract } from '@abapify/adt-contracts';

// Export types
export type {
  AdtConnectionConfig,
  AdtRestContract,
  OperationResult,
  LockHandle,
  AdtError,
  Logger,
} from './types';

// Response types are re-exported from adt-contracts for consumers
// Note: Session and SystemInformation types are available via contract response inference

// Export adapter for advanced use cases
export {
  createAdtAdapter,
  type HttpAdapter,
  type AdtAdapterConfig,
} from './adapter';

// Export plugins
export {
  type ResponsePlugin,
  type ResponseContext,
  type FileStorageOptions,
  type TransformFunction,
  type LogFunction,
  type FileLoggingConfig,
  FileStoragePlugin,
  TransformPlugin,
  LoggingPlugin,
  FileLoggingPlugin,
} from './plugins';

// Export session management
export {
  SessionManager,
  CookieStore,
  CsrfTokenManager,
} from './utils/session';

// Re-export contract types needed for declaration generation
export type { RestEndpointDescriptor, Serializable, RestContract } from '@abapify/adt-contracts';

// Re-export contract response types for ADK consumers
// This allows ADK to depend only on adt-client-v2, not adt-contracts directly
export type { ClassResponse, InterfaceResponse } from '@abapify/adt-contracts';
export type { Package as PackageResponse } from '@abapify/adt-contracts';

// Transport response type - inferred from contract
// Note: Transport business logic has moved to @abapify/adk-v2 (AdkTransportRequest)
import type { AdtContract } from '@abapify/adt-contracts';
type CtsContract = AdtContract['cts'];
type TransportRequestsContract = CtsContract['transportrequests'];
/** Response type from cts.transportrequests.get() */
export type TransportGetResponse = Awaited<ReturnType<TransportRequestsContract['get']>>;
