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

// Export discovery types
export type {
  DiscoveryXml,
  WorkspaceXml,
  CollectionXml,
} from './adt/discovery';

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
  FileStoragePlugin,
  TransformPlugin,
  LoggingPlugin,
} from './plugins';

// Export session management
export {
  SessionManager,
  CookieStore,
  CsrfTokenManager,
} from './utils/session';
