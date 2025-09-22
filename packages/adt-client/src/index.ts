// Main exports for @abapify/adt-client package
export type { AdtClient } from './client/adt-client.js';
export { AdtClientImpl } from './client/adt-client.js';
export { ConnectionManager } from './client/connection-manager.js';
export { AuthManager } from './client/auth-manager.js';

// Export logger utilities
export { createLogger, loggers } from './utils/logger.js';
export type { Logger } from './utils/logger.js';

// Service exports
export { ObjectService } from './services/repository/object-service.js';
export { SearchService } from './services/repository/search-service.js';
export { TestService } from './services/test/test-service.js';
export type {
  SearchOptions,
  SearchResultDetailed,
  ADTObjectInfo,
} from './services/repository/search-service.js';
export { TransportService } from './services/cts/transport-service.js';
export { AtcService } from './services/atc/atc-service.js';
export { GenericAdkService } from './services/adk/generic-adk-service.js';
export { AdkFacade } from './services/adk/adk-facade.js';
export type {
  AdkClientInterface,
  ObjectOperationOptions,
  ObjectOperationResult,
} from './services/adk/client-interface.js';
export type {
  TransportFilters,
  TransportList,
  TransportCreateOptions,
  TransportCreateResult,
  Transport,
  Task,
  TransportObject,
} from './services/cts/types.js';

// Service operation interfaces
export type { CtsOperations } from './services/cts/types.js';
export type {
  AtcOperations,
  AtcOptions,
  AtcResult,
  AtcFinding,
} from './services/atc/types.js';
export type {
  RepositoryOperations,
  ObjectOutline,
  CreateResult,
  UpdateResult,
  SearchResult,
  PackageContent,
  ObjectTypeInfo,
} from './services/repository/types.js';
export { AdtSessionType } from './services/repository/types.js';
export type {
  DiscoveryOperations,
  SystemInfo,
  ADTDiscoveryService,
  ADTWorkspace,
  ADTCollection,
} from './services/discovery/types.js';
export { DiscoveryService } from './services/discovery/discovery-service.js';
export { RepositoryService } from './services/repository/repository-service.js';

// Handler exports
export { ObjectHandlerFactory } from './handlers/object-handler-factory.js';
export type { ObjectHandler } from './handlers/base-object-handler.js';
export { BaseObjectHandler } from './handlers/base-object-handler.js';
export { ClassHandler } from './handlers/class-handler.js';
export { ProgramHandler } from './handlers/program-handler.js';

// Core type exports
export type * from './types/client.js';
export type * from './types/core.js';
export type * from './types/responses.js';

// Utility exports
export { XmlParser } from './utils/xml-parser.js';
export { ErrorHandler } from './utils/error-handler.js';
export { ServiceKeyParser } from './utils/auth-utils.js';

// Factory function for creating ADT client instances
import type { AdtClientConfig } from './types/client.js';
import { AdtClientImpl } from './client/adt-client.js';

export function createAdtClient(config?: AdtClientConfig): AdtClientImpl {
  return new AdtClientImpl(config);
}
