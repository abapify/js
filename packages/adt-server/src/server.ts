import http from 'node:http';
import {
  createHttpMcpHandler,
  type DestinationContextRegistry,
  type McpInvocationVerifier,
} from '@abapify/adt-mcp';
import { createRestAtcDocumentationCapabilityService } from './atc-documentation-capabilities.js';
import { createRestSourceCapabilityService } from './source-capabilities.js';
import { assertSecret } from './sealed-capability.js';
import { createRestPageCursorService } from './page-cursors.js';
import {
  type TransportSearchCriteria,
  type TransportSourceManifestInput,
  type AtcRunBody,
} from './rest-schemas.js';
import {
  createRequestHandler,
  type RawTransportSourceManifest,
  type AtcRunOperationResult,
} from './request-handler.js';

type AtcRunOperationInput = AtcRunBody & { destination: string };

export interface DestinationSummary {
  key: string;
  displayName: string;
  systemSids: string[];
  authConfigured: boolean;
  version: number;
}

export type FrozenSourceResolution =
  | { sourceUri: string }
  | { sourceCapability: string };

export type ResolveFrozenSource = (input: {
  destination: string;
  systemSid: string;
  sourceRef: string;
}) => Promise<FrozenSourceResolution>;

/**
 * The ADT broker may return a direct adapter URI or a source capability
 * previously issued by this same sidecar REST process. Redeem the latter
 * before the MCP package can acquire a destination context or invoke SAP.
 */
export async function resolveMcpFrozenSource(
  resolveFrozenSource: ResolveFrozenSource,
  sourceCapabilities: ReturnType<typeof createRestSourceCapabilityService>,
  input: Parameters<ResolveFrozenSource>[0],
): Promise<{ sourceUri: string }> {
  const resolved = await resolveFrozenSource(input);
  if ('sourceUri' in resolved) return resolved;
  return sourceCapabilities.resolve({
    sourceCapability: resolved.sourceCapability,
    destination: input.destination,
  });
}

/** The runtime supplies this from ADT's private broker; it never exposes a connection lease. */
export interface AdtServerOperations {
  listDestinations(): Promise<DestinationSummary[]>;
  listTransports(
    destination: string,
    criteria?: TransportSearchCriteria,
  ): Promise<unknown>;
  searchPackages(
    destination: string,
    criteria?: import('./rest-schemas.js').PackageSearchCriteria,
  ): Promise<unknown>;
  /** Reads a bounded hierarchy below one named package; never a global forest. */
  getPackageTree(destination: string, rootPackage: string): Promise<unknown>;
  searchObjects(
    destination: string,
    criteria?: import('./rest-schemas.js').ObjectSearchCriteria,
  ): Promise<unknown>;
  listPackageObjects(
    destination: string,
    packageName: string,
  ): Promise<unknown>;
  /** Public canonical metadata projection; raw ADT URIs remain broker-local. */
  getObjectMetadata?(
    destination: string,
    objectType: string,
    objectName: string,
  ): Promise<unknown>;
  /** Public metadata-only history; immutable source locators remain local. */
  getObjectSourceHistory?(
    destination: string,
    objectType: string,
    objectName: string,
  ): Promise<unknown>;
  /** Bounded current/named source selected only by canonical object identity. */
  readObjectSource?(input: {
    destination: string;
    objectType: string;
    objectName: string;
    version?: string;
  }): Promise<{ bytes: number; source: string }>;
  /** Runs ATC from canonical scope selectors; ADT paths remain broker-local. */
  runAtc?(input: AtcRunOperationInput): Promise<AtcRunOperationResult>;
  /** Reads an issued ATC documentation relation under a caller-selected cap. */
  readAtcFindingDocumentation?(input: {
    destination: string;
    documentationUri: string;
    maxBytes: number;
  }): Promise<{ bytes: number; html: string }>;
  /** Public canonical detail; never contains SAP URI fields. */
  getTransportDetail?(destination: string, transport: string): Promise<unknown>;
  /** Public canonical aggregate; never contains SAP URI fields. */
  listTransportObjects?(
    destination: string,
    transport: string,
  ): Promise<unknown>;
  /** Supplied by the broker adapter when immutable-source REST is enabled. */
  buildTransportSourceManifest?(
    destination: string,
    input: TransportSourceManifestInput,
  ): Promise<RawTransportSourceManifest>;
  /** Must enforce the requested byte limit before retaining an upstream body. */
  readImmutableSource?(input: {
    destination: string;
    sourceUri: string;
    maxBytes: number;
  }): Promise<{ bytes: number; source: string }>;
}

/**
 * The only MCP configuration accepted by the shared ADT Server listener.
 * The sidecar always creates an invocation-authenticated handler; callers
 * cannot select a weaker HTTP authentication mode here.
 */
export interface AdtServerMcpOptions {
  invocationVerifier: McpInvocationVerifier;
  /** Ownership transfers to the running server, which shuts it down on close. */
  destinationRegistry: DestinationContextRegistry;
  /**
   * Private ADT broker resolver for the opaque, signed source capabilities
   * carried only in an AI Review invocation policy.
   */
  resolveFrozenSource: ResolveFrozenSource;
  allowedHosts?: string[];
}

/**
 * Authenticates trusted service-to-service callers of the broker-backed REST
 * compatibility API. The broker credential must never be accepted inbound.
 */
export interface RestServiceAuthorizer {
  authorize(request: http.IncomingMessage): boolean | Promise<boolean>;
}

export interface AdtServerOptions {
  operations: AdtServerOperations;
  host?: string;
  port?: number;
  mcp?: AdtServerMcpOptions;
  restAuthorizer?: RestServiceAuthorizer;
  /** Production REST uses a deployment-shared secret; tests may use a local one. */
  sourceCapabilities?: ReturnType<typeof createRestSourceCapabilityService>;
  /** Override the default test secret used to create source capabilities. */
  sourceCapabilitiesSecret?: string;
  /** Shares REST state with source capabilities across sidecar replicas. */
  atcDocumentationCapabilities?: ReturnType<
    typeof createRestAtcDocumentationCapabilityService
  >;
  /** Override the default test secret used to create ATC documentation capabilities. */
  atcDocumentationCapabilitiesSecret?: string;
  pageCursors?: ReturnType<typeof createRestPageCursorService>;
  /** Override the default test secret used to create page cursors. */
  pageCursorSecret?: string;
}

export interface RunningAdtServer {
  url: string;
  close(): Promise<void>;
}

export async function startAdtServer(
  options: AdtServerOptions,
): Promise<RunningAdtServer> {
  const host = options.host ?? '127.0.0.1';
  const restEnabled = !!options.restAuthorizer;
  const mcpEnabled = !!options.mcp;
  const sourceCapabilities =
    options.sourceCapabilities ??
    (mcpEnabled || restEnabled
      ? createRestSourceCapabilityService({
          secret: assertSecret(
            options.sourceCapabilitiesSecret,
            'sourceCapabilitiesSecret',
          ),
        })
      : undefined);
  const atcDocumentationCapabilities =
    options.atcDocumentationCapabilities ??
    (restEnabled
      ? createRestAtcDocumentationCapabilityService({
          secret: assertSecret(
            options.atcDocumentationCapabilitiesSecret,
            'atcDocumentationCapabilitiesSecret',
          ),
        })
      : undefined);
  const pageCursors =
    options.pageCursors ??
    (restEnabled
      ? createRestPageCursorService({
          secret: assertSecret(options.pageCursorSecret, 'pageCursorSecret'),
        })
      : undefined);
  const mcpHandler = options.mcp
    ? createHttpMcpHandler({
        host,
        allowedHosts: options.mcp.allowedHosts,
        authMode: 'invocation',
        invocationVerifier: options.mcp.invocationVerifier,
        destinationServer: {
          destinationRegistry: options.mcp.destinationRegistry,
          // adt-mcp derives identity and access directly from the verified
          // invocation in this mode. These callbacks only satisfy its shared
          // destination-server interface and cannot become another authority.
          requestIdentity: ({ invocation }) => {
            if (!invocation) {
              throw new Error('ADT Server MCP invocation is missing');
            }
            return {
              principal: invocation.principal,
              agentId: invocation.agentId,
            };
          },
          requestAccess: ({ invocation }) =>
            invocation
              ? {
                  classes: invocation.classes,
                  destinationKeys: invocation.destinationKeys,
                }
              : undefined,
          resolveFrozenSource: async (input) =>
            await resolveMcpFrozenSource(
              options.mcp!.resolveFrozenSource,
              sourceCapabilities!,
              input,
            ),
        },
      })
    : undefined;

  const server = http.createServer(
    createRequestHandler({
      options,
      mcpHandler,
      sourceCapabilities,
      atcDocumentationCapabilities,
      pageCursors,
    }),
  );
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(options.port ?? 3002, host, () => resolve());
  });

  const address = server.address() as { port: number };
  let closed = false;
  return {
    url: `http://${host}:${address.port}`,
    close: async () => {
      if (closed) return;
      closed = true;
      const listenerClosed = new Promise<void>((resolve) =>
        server.close(() => resolve()),
      );
      try {
        await mcpHandler?.close();
        await options.mcp?.destinationRegistry.shutdown();
      } finally {
        server.closeAllConnections();
        await listenerClosed;
      }
    },
  };
}
