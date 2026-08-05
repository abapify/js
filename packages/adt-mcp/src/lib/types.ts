/**
 * Shared types for the MCP server tools.
 */

import type { AdtClient } from '@abapify/adt-client';
import type { SapSessionContext } from './session/types.js';
import type { SessionRegistry } from './session/registry.js';
import type {
  DestinationContextRegistry,
  RequestIdentity,
} from './session/destination-registry.js';
import type { McpRequestAccess } from './tools/scope-catalogue.js';
import type { SafeExecutePolicy } from './http/invocation.js';
import type { createSourceCapabilityRegistry } from './source-capabilities.js';
import type { FlowConfig } from '@abapify/adt-config';

/**
 * Connection parameters that every tool receives.
 *
 * - `baseUrl`: Base ADT endpoint of the SAP system.
 * - `client`: Optional SAP client to connect to.
 * - `username`: Optional username for authentication.
 * - `password`: Optional password for authentication.
 */
export interface ConnectionParams {
  baseUrl: string;
  client?: string;
  username?: string;
  password?: string;
}

/**
 * Context passed to each tool handler at runtime.
 *
 * The legacy `getClient` factory remains the primary path for stdio-mode
 * tools that carry connection parameters in every call. HTTP-mode tools
 * additionally get:
 *
 *   - `registry` / `getSession` — to resolve the active `SapSessionContext`
 *     for the current MCP session (populated by future `sap_connect` tool).
 *   - `resolveSystem` — to map a logical system id (from multi-system
 *     config) to concrete connection parameters.
 */
export interface ToolContext {
  getClient: (params: ConnectionParams) => AdtClient;
  getSession?: (mcpSessionId: string) => SapSessionContext | undefined;
  registry?: SessionRegistry;
  resolveSystem?: (systemId: string) => ConnectionParams | undefined;
  /**
   * Shared-service mode. Contexts are keyed by both MCP session and the
   * public destination key; no connection material reaches a tool handler.
   */
  destinationRegistry?: DestinationContextRegistry;
  requestIdentity?: (extra: { sessionId?: string }) => RequestIdentity;
  requestAccess?: (extra: {
    sessionId?: string;
  }) => McpRequestAccess | undefined;
  /**
   * Atomically consumes the policy broker's opaque scoped check grant. The implementation
   * owns ADT Server service authentication and must return true only after
   * the policy broker responds with the successful consume result.
   */
  consumeExecutionAuthorization?: (input: {
    authorizationId: string;
    authorizationToken: string;
    principal: string;
    scopeId: string;
    executionId: string;
    systemSid: string;
    resourceKeys: readonly string[];
    destination: string;
    operationId: 'atc_run' | 'run_unit_tests';
    policy: SafeExecutePolicy;
  }) => Promise<boolean>;
  /**
   * Records the single terminal state of a consumed broker grant. It is called
   * exactly once after the SAP operation settles and must never trigger a
   * retry of that operation.
   */
  reportExecutionOutcome?: (input: {
    authorizationId: string;
    authorizationToken: string;
    outcome: 'succeeded' | 'failed' | 'outcome_unknown';
  }) => Promise<boolean>;
  /**
   * Executes a consumed safe check under a runtime that can actually
   * terminate its SAP transport at `maxDurationMs`. Returning early while the
   * supplied operation continues is forbidden.
   */
  executeWithDeadline?: (input: {
    maxDurationMs: number;
    operation: () => Promise<unknown>;
  }) => Promise<unknown>;
  /**
   * Redeems an opaque ADT source capability after destination-mode policy has
   * selected it. The resolver may return only a trusted server-relative URI.
   */
  resolveFrozenSource?: (input: {
    destination: string;
    systemSid: string;
    sourceRef: string;
  }) => Promise<{ sourceUri: string }>;
  /** Opaque, short-lived source capabilities issued by this MCP server. */
  sourceCapabilities?: ReturnType<typeof createSourceCapabilityRegistry>;
  /** Server-owned roots within which filesystem-mutating flow tools may act. */
  workspaceRoots?: readonly string[];
  /** Optional server-owned flow config; otherwise workspace config is loaded. */
  flowConfig?: FlowConfig;
}
