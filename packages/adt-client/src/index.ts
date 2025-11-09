// Main exports for @abapify/adt-client package
export type { AdtClient } from './client/adt-client';
export { AdtClientImpl } from './client/adt-client';
export { ConnectionManager } from './client/connection-manager';
export { AuthManager } from './client/auth-manager';

// Export logger utilities
export { createLogger, loggers } from './utils/logger';
export type { Logger } from './utils/logger';
export { FileLogger, createFileLogger } from './utils/file-logger';
export type { FileLogOptions, FileLoggerConfig } from './utils/file-logger';

// Service exports
export { ObjectService } from './services/repository/object-service';
export { SearchService } from './services/repository/search-service';
export { TestService } from './services/test/test-service';
export type {
  SearchOptions,
  SearchResultDetailed,
  ADTObjectInfo,
} from './services/repository/search-service';
export { TransportService } from './services/cts/transport-service';
export { AtcService } from './services/atc/atc-service';
export { GenericAdkService } from './services/adk/generic-adk-service';
export { AdkFacade } from './services/adk/adk-facade';
export type {
  AdkClientInterface,
  ObjectOperationOptions,
  ObjectOperationResult,
} from './services/adk/client-interface';
export type {
  TransportFilters,
  TransportList,
  TransportCreateOptions,
  TransportCreateResult,
  Transport,
  Task,
  TransportObject,
} from './services/cts/types';

// Service operation interfaces
export type { CtsOperations } from './services/cts/types';
export type {
  AtcOperations,
  AtcOptions,
  AtcResult,
  AtcFinding,
} from './services/atc/types';
export type {
  RepositoryOperations,
  ObjectOutline,
  CreateResult,
  UpdateResult,
  SearchResult,
  PackageContent,
  ObjectTypeInfo,
  SetSourceOptions,
  SetSourceResult,
} from './services/repository/types';
export { AdtSessionType } from './services/repository/types';
export type {
  DiscoveryOperations,
  SystemInfo,
  ADTDiscoveryService,
  ADTWorkspace,
  ADTCollection,
} from './services/discovery/types';
export { DiscoveryService } from './services/discovery/discovery-service';
export { RepositoryService } from './services/repository/repository-service';

// Handler exports
export { ObjectHandlerFactory } from './handlers/object-handler-factory';
export type { ObjectHandler } from './handlers/base-object-handler';
export { BaseObjectHandler } from './handlers/base-object-handler';
export { ClassHandler } from './handlers/class-handler';
export { ProgramHandler } from './handlers/program-handler';

// Core type exports
export type * from './types/client';
export type * from './types/core';
export type * from './types/responses';

// Utility exports
export { XmlParser } from './utils/xml-parser';
export { ErrorHandler } from './utils/error-handler';
export { ServiceKeyParser } from './utils/auth-utils';

// Factory function for creating ADT client instances
import type { AdtClientConfig } from './types/client';
import { AdtClientImpl } from './client/adt-client';

export function createAdtClient(config?: AdtClientConfig): AdtClientImpl {
  return new AdtClientImpl(config);
}
