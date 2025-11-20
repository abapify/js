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
} from './types';

// Export discovery types
export type {
  DiscoveryXml,
  WorkspaceXml,
  CollectionXml,
} from './adt/discovery';

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
  FileStoragePlugin,
  TransformPlugin,
  LoggingPlugin,
} from './plugins';
