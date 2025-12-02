/**
 * ADT Client V2 - Minimalistic speci-based ADT client
 *
 * Uses speci's client generation instead of manually implementing HTTP calls.
 */

// Export main client factory
export { createAdtClient, type AdtClient } from './client';

// Export contract for advanced use cases
export { adtContract, type AdtContract } from './contract';

// Export types
export type {
  AdtConnectionConfig,
  AdtRestContract,
  ClassXml,
  OperationResult,
  LockHandle,
  AdtError,
  Logger,
} from './types';

// Discovery types are now inferred from adt-contracts/adt-schemas-xsd

// Export core HTTP types
export type { SessionXml } from './adt/core/http/sessions-schema';
export type { SystemInformationJson } from './adt/core/http/systeminformation-schema';

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

// Export CTS transport service
export { createTransportService, type TransportService } from './services/cts/transport-service';
export type { TransportRequest, TransportTask, TransportObject } from './services/cts/types';

// Re-export speci types needed for declaration generation
export type { RestEndpointDescriptor, Serializable, RestContract } from 'speci/rest';
