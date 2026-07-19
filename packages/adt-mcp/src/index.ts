/**
 * @abapify/adt-mcp – MCP server for SAP ADT operations
 *
 * Re-exports the server factory so consumers can embed the MCP server
 * programmatically (e.g. in integration tests).
 */

export { createMcpServer, type McpServerOptions } from './lib/server';
export { registerTools } from './lib/tools/index';
export {
  MCP_TOOL_SCOPE_CATALOGUE,
  assertMcpToolIsClassified,
  isMcpToolAllowed,
  operationClassForMcpTool,
  type McpOperationClass,
  type McpRequestAccess,
  type McpToolScope,
} from './lib/tools/scope-catalogue.js';
export type { ConnectionParams, ToolContext } from './lib/types';
export type { SapSessionContext } from './lib/session/types';
export {
  createDestinationContextRegistry,
  type DestinationContext,
  type DestinationContextFactory,
  type DestinationContextRegistry,
  type DestinationContextRegistryOptions,
  type DestinationLease,
  type DestinationLeaseProvider,
  type RequestIdentity,
} from './lib/session/destination-registry.js';
export {
  createSessionRegistry,
  type SessionRegistry,
  type SessionRegistryOptions,
} from './lib/session/registry';
export {
  startHttpServer,
  type HttpServerOptions,
  type RunningHttpServer,
} from './lib/http/server';
export {
  loadMultiSystemConfig,
  type MultiSystemConfig,
  type SystemEntry,
} from './lib/http/multi-system';
