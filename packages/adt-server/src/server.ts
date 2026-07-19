import http from 'node:http';
import { SourceVersionTooLargeError } from '@abapify/adt-client';
import { z } from 'zod';
import {
  createHttpMcpHandler,
  type DestinationContextRegistry,
  type McpInvocationVerifier,
  type ToolContext,
} from '@abapify/adt-mcp';
import { openApiDocument, openApiYaml } from './openapi.js';
import {
  RestSourceCapabilityError,
  createRestSourceCapabilityService,
} from './source-capabilities.js';
import {
  RestPageCursorError,
  createRestPageCursorService,
} from './page-cursors.js';
import {
  packagePageResponse,
  packageSearchResult,
  parsePackageSearchQuery,
  sourceVersionReadBody,
  sourceVersionReadResponse,
  transportDetailResponse,
  transportListResponse,
  transportObjectsResponse,
  transportPathParameter,
  parseTransportSearchQuery,
  transportSourceManifestBody,
  transportSourceManifestResponse,
  type TransportSearchCriteria,
  type TransportSourceManifestInput,
} from './rest-schemas.js';

const MAX_JSON_BODY_BYTES = 64 * 1024;

type RawSourceVersion = {
  sourceUri: string;
};

type RawTransportSourceManifest = {
  requestedTransports: unknown;
  scopeTransports: unknown;
  entries: ReadonlyArray<{
    component: {
      sourceUri?: string;
      versionsUri?: string;
    };
    base?: RawSourceVersion;
    head?: RawSourceVersion;
  }>;
};

export interface DestinationSummary {
  key: string;
  displayName: string;
  systemSids: string[];
  authConfigured: boolean;
  version: number;
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
  searchObjects(destination: string): Promise<unknown>;
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
  resolveFrozenSource: NonNullable<ToolContext['resolveFrozenSource']>;
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
  pageCursors?: ReturnType<typeof createRestPageCursorService>;
}

export interface RunningAdtServer {
  url: string;
  close(): Promise<void>;
}

class InvalidJsonBodyError extends Error {}

async function readJsonBody(request: http.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const bytes = Buffer.from(chunk);
    size += bytes.length;
    if (size > MAX_JSON_BODY_BYTES) throw new InvalidJsonBodyError();
    chunks.push(bytes);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
  } catch {
    throw new InvalidJsonBodyError();
  }
}

function readQuery(request: http.IncomingMessage): Record<string, string> {
  const url = new URL(request.url ?? '/', 'http://adt-server.invalid');
  return Object.fromEntries(url.searchParams.entries());
}

function writeProblem(
  response: http.ServerResponse,
  status: number,
  title: string,
): void {
  response.writeHead(status, { 'content-type': 'application/problem+json' });
  response.end(JSON.stringify({ title, status }));
}

function toRestTransportSourceManifest(
  manifest: RawTransportSourceManifest,
  capabilities: ReturnType<typeof createRestSourceCapabilityService>,
  destination: string,
) {
  const toVersion = (version: RawSourceVersion) => {
    const { sourceUri, ...metadata } = version;
    return {
      ...metadata,
      sourceCapability: capabilities.issue({ destination, sourceUri }),
    };
  };
  return {
    requestedTransports: manifest.requestedTransports,
    scopeTransports: manifest.scopeTransports,
    entries: manifest.entries.map((entry) => {
      const {
        component: {
          sourceUri: _sourceUri,
          versionsUri: _versionsUri,
          ...component
        },
        base,
        head,
        ...metadata
      } = entry;
      return {
        ...metadata,
        component,
        ...(base ? { base: toVersion(base) } : {}),
        ...(head ? { head: toVersion(head) } : {}),
      };
    }),
  };
}

export async function startAdtServer(
  options: AdtServerOptions,
): Promise<RunningAdtServer> {
  const host = options.host ?? '127.0.0.1';
  const sourceCapabilities =
    options.sourceCapabilities ?? createRestSourceCapabilityService();
  const pageCursors = options.pageCursors ?? createRestPageCursorService();
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
          resolveFrozenSource: options.mcp.resolveFrozenSource,
        },
      })
    : undefined;

  const server = http.createServer((request, response) => {
    void (async () => {
      const path = (request.url ?? '/').split('?', 1)[0];
      if (mcpHandler && (path === '/mcp' || path === '/mcp/')) {
        await mcpHandler.handle(request, response);
        return;
      }
      if (request.method === 'GET' && path === '/healthz') {
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ status: 'ok' }));
        return;
      }
      if (request.method === 'GET' && path === '/readyz') {
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ status: 'ready' }));
        return;
      }
      if (request.method === 'GET' && path === '/openapi.json') {
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(JSON.stringify(openApiDocument));
        return;
      }
      if (request.method === 'GET' && path === '/openapi.yaml') {
        response.writeHead(200, { 'content-type': 'application/yaml' });
        response.end(openApiYaml());
        return;
      }
      const isDestinationList =
        request.method === 'GET' && path === '/v1/destinations';
      const match =
        /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/(transports|packages|objects)$/u.exec(
          path,
        );
      const sourceManifestMatch =
        /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/transport-source-manifests$/u.exec(
          path,
        );
      const sourceVersionReadMatch =
        /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/source-versions:read$/u.exec(
          path,
        );
      const transportDetailMatch =
        /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/transports\/([^/]+?)(\/objects)?$/u.exec(
          path,
        );
      const isRestOperation =
        isDestinationList ||
        (request.method === 'GET' && match) ||
        (request.method === 'GET' && transportDetailMatch) ||
        (request.method === 'POST' &&
          (sourceManifestMatch || sourceVersionReadMatch));
      if (isRestOperation) {
        if (!options.restAuthorizer) {
          response.writeHead(404, {
            'content-type': 'application/problem+json',
          });
          response.end(JSON.stringify({ title: 'Not found', status: 404 }));
          return;
        }

        let authorized = false;
        try {
          authorized = await options.restAuthorizer.authorize(request);
        } catch {
          authorized = false;
        }
        if (!authorized) {
          response.writeHead(401, {
            'content-type': 'application/problem+json',
          });
          response.end(JSON.stringify({ title: 'Unauthorized', status: 401 }));
          return;
        }
      }
      if (isDestinationList) {
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(
          JSON.stringify({ data: await options.operations.listDestinations() }),
        );
        return;
      }
      if (request.method === 'GET' && match) {
        const [, destination, resource] = match;
        if (resource === 'packages') {
          try {
            const { criteria, page } = parsePackageSearchQuery(
              readQuery(request),
            );
            const result = packageSearchResult.parse(
              await options.operations.searchPackages(destination!, criteria),
            );
            const data = packagePageResponse.parse(
              pageCursors.paginate({
                ...result,
                ...page,
                fingerprint: `packages:${destination}:${criteria.q ?? '*'}:${criteria.maxResults ?? 5_000}`,
                keyOf: (entry) => entry.name,
              }),
            );
            response.writeHead(200, { 'content-type': 'application/json' });
            response.end(JSON.stringify(data));
          } catch (error) {
            if (
              error instanceof z.ZodError ||
              error instanceof RestPageCursorError
            ) {
              writeProblem(response, 400, 'Invalid request');
              return;
            }
            throw error;
          }
          return;
        }
        try {
          const data =
            resource === 'transports'
              ? transportListResponse.parse(
                  await options.operations.listTransports(
                    destination,
                    parseTransportSearchQuery(readQuery(request)),
                  ),
                )
              : await options.operations.searchObjects(destination);
          response.writeHead(200, { 'content-type': 'application/json' });
          response.end(JSON.stringify(data));
        } catch (error) {
          if (error instanceof z.ZodError) {
            writeProblem(response, 400, 'Invalid request');
            return;
          }
          throw error;
        }
        return;
      }
      if (request.method === 'GET' && transportDetailMatch) {
        const [, destination, rawTransport, objectsSuffix] =
          transportDetailMatch;
        try {
          const transport = transportPathParameter.parse(rawTransport);
          if (objectsSuffix) {
            if (!options.operations.listTransportObjects) {
              writeProblem(response, 404, 'Not found');
              return;
            }
            const data = transportObjectsResponse.parse(
              await options.operations.listTransportObjects(
                destination!,
                transport,
              ),
            );
            response.writeHead(200, { 'content-type': 'application/json' });
            response.end(JSON.stringify(data));
            return;
          }
          if (!options.operations.getTransportDetail) {
            writeProblem(response, 404, 'Not found');
            return;
          }
          const data = transportDetailResponse.parse(
            await options.operations.getTransportDetail(
              destination!,
              transport,
            ),
          );
          response.writeHead(200, { 'content-type': 'application/json' });
          response.end(JSON.stringify(data));
        } catch (error) {
          if (error instanceof z.ZodError) {
            writeProblem(response, 400, 'Invalid request');
            return;
          }
          throw error;
        }
        return;
      }
      if (request.method === 'POST' && sourceManifestMatch) {
        if (!options.operations.buildTransportSourceManifest) {
          writeProblem(response, 404, 'Not found');
          return;
        }
        let input: TransportSourceManifestInput;
        try {
          input = transportSourceManifestBody.parse(
            await readJsonBody(request),
          );
        } catch (error) {
          if (
            error instanceof z.ZodError ||
            error instanceof InvalidJsonBodyError
          ) {
            writeProblem(response, 400, 'Invalid request');
            return;
          }
          throw error;
        }
        const manifest = await options.operations.buildTransportSourceManifest(
          sourceManifestMatch[1]!,
          input,
        );
        const data = transportSourceManifestResponse.parse(
          toRestTransportSourceManifest(
            manifest,
            sourceCapabilities,
            sourceManifestMatch[1]!,
          ),
        );
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(JSON.stringify(data));
        return;
      }
      if (request.method === 'POST' && sourceVersionReadMatch) {
        if (!options.operations.readImmutableSource) {
          writeProblem(response, 404, 'Not found');
          return;
        }
        let input: ReturnType<typeof sourceVersionReadBody.parse>;
        try {
          input = sourceVersionReadBody.parse(await readJsonBody(request));
        } catch (error) {
          if (
            error instanceof z.ZodError ||
            error instanceof InvalidJsonBodyError
          ) {
            writeProblem(response, 400, 'Invalid request');
            return;
          }
          throw error;
        }
        try {
          const source = sourceCapabilities.resolve({
            sourceCapability: input.sourceCapability,
            destination: sourceVersionReadMatch[1]!,
          });
          const result = await options.operations.readImmutableSource({
            destination: sourceVersionReadMatch[1]!,
            sourceUri: source.sourceUri,
            maxBytes: input.maxBytes,
          });
          if (
            typeof result.source !== 'string' ||
            result.bytes !== Buffer.byteLength(result.source, 'utf8') ||
            result.bytes > input.maxBytes
          ) {
            throw new Error(
              'Bounded source operation returned an invalid body',
            );
          }
          const data = sourceVersionReadResponse.parse(result);
          response.writeHead(200, { 'content-type': 'application/json' });
          response.end(JSON.stringify(data));
        } catch (error) {
          if (error instanceof RestSourceCapabilityError) {
            writeProblem(response, 404, 'Source unavailable');
            return;
          }
          if (error instanceof SourceVersionTooLargeError) {
            writeProblem(response, 413, 'Source too large');
            return;
          }
          throw error;
        }
        return;
      }
      response.writeHead(404, { 'content-type': 'application/problem+json' });
      response.end(JSON.stringify({ title: 'Not found', status: 404 }));
    })().catch(() => {
      if (response.headersSent) {
        response.end();
        return;
      }
      response.writeHead(500, { 'content-type': 'application/problem+json' });
      response.end(
        JSON.stringify({ title: 'Internal server error', status: 500 }),
      );
    });
  });

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
