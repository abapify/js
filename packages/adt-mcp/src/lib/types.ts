/**
 * Shared types for the MCP server tools.
 */

import type { AdtClient } from '@abapify/adt-client';

/**
 * Connection parameters that every tool receives.
 * When `mockBaseUrl` is set the tool connects to a local mock server
 * instead of a real SAP system.
 */
export interface ConnectionParams {
  baseUrl: string;
  client?: string;
  username?: string;
  password?: string;
}

/**
 * Context passed to each tool handler at runtime.
 */
export interface ToolContext {
  getClient: (params: ConnectionParams) => AdtClient;
}
