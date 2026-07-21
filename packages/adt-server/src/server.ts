import http from 'node:http';
import {
  AdtResponseTooLargeError,
  SourceVersionTooLargeError,
} from '@abapify/adt-client';
import { z } from 'zod';
import {
  createHttpMcpHandler,
  type DestinationContextRegistry,
  type McpInvocationVerifier,
} from '@abapify/adt-mcp';
import { openApiDocument, openApiYaml } from './openapi.js';
import {
  createRestAtcDocumentationCapabilityService,
  RestAtcDocumentationCapabilityError,
} from './atc-documentation-capabilities.js';
import {
  RestSourceCapabilityError,
  createRestSourceCapabilityService,
} from './source-capabilities.js';
import { assertSecret } from './sealed-capability.js';
import {
  RestPageCursorError,
  createRestPageCursorService,
} from './page-cursors.js';
import {
  atcDocumentationReadBody,
  atcDocumentationReadResponse,
  atcFindingResponse,
  atcRunBody,
  atcRunResponse,
  MAX_ATC_DOCUMENTATION_BYTES,
  MAX_SOURCE_BYTES,
  objectPageResponse,
  objectMetadataResponse,
  objectNamePathParameter,
  objectSearchResult,
  objectSourceReadBody,
  objectSourceHistoryResponse,
  objectTypePathParameter,
  parseObjectSearchQuery,
  parsePageQuery,
  packagePageResponse,
  packagePathParameter,
  packageSearchResult,
  parsePackageTreeQuery,
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
  type AtcRunBody,
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

type AtcRunOperationInput = AtcRunBody & { destination: string };

type AtcRunOperationResult = {
  checkVariant: string;
  findings: Array<
    Omit<z.infer<typeof atcFindingResponse>, 'documentationCapability'> & {
      /** Trusted broker-local relation; converted before the REST response. */
      documentationUri?: string;
    }
  >;
};

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
 * The ARM broker may return a direct adapter URI or a source capability
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

/** The runtime supplies this from ARM's private broker; it never exposes a connection lease. */
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
   * Private ARM broker resolver for the opaque, signed source capabilities
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

class InvalidJsonBodyError extends Error {}
class InvalidPathParameterError extends Error {}

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
  const url = new URL(request.url ?? '/', 'https://adt-server.invalid');
  return Object.fromEntries(url.searchParams.entries());
}

function decodePathParameter(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    throw new InvalidPathParameterError();
  }
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

function toRestAtcRun(
  result: AtcRunOperationResult,
  capabilities: ReturnType<typeof createRestAtcDocumentationCapabilityService>,
  destination: string,
) {
  return {
    checkVariant: result.checkVariant,
    findings: result.findings.map(({ documentationUri, ...finding }) => {
      // The broker may retain more SAP fields internally. Project the allowlist
      // before adding the sealed relation so no URI-like field can escape.
      const safeFinding = atcFindingResponse.strip().parse(finding);
      return {
        ...safeFinding,
        ...(documentationUri
          ? {
              documentationCapability: capabilities.issue({
                destination,
                documentationUri,
              }),
            }
          : {}),
      };
    }),
  };
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

  const server = http.createServer((request, response) => {
    // ADT HTTP server route dispatch is inherently branch-heavy; extracted handlers would be the long-term fix.
    // prettier-ignore
    void (async () => { //NOSONAR
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
      const packageObjectsMatch =
        /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/packages\/([^/]+)\/objects$/u.exec(
          path,
        );
      const packageTreeMatch =
        /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/packages\/tree$/u.exec(
          path,
        );
      const objectMetadataMatch =
        /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/objects\/([^/]+)\/([^/]+)$/u.exec(
          path,
        );
      const objectSourceHistoryMatch =
        /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/objects\/([^/]+)\/([^/]+)\/source-history$/u.exec(
          path,
        );
      const objectSourceReadMatch =
        /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/objects\/([^/]+)\/([^/]+)\/source:read$/u.exec(
          path,
        );
      const atcRunMatch =
        /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/atc-runs$/u.exec(path);
      const atcDocumentationReadMatch =
        /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/atc-finding-documentation:read$/u.exec(
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
        (request.method === 'GET' && packageTreeMatch) ||
        (request.method === 'GET' && packageObjectsMatch) ||
        (request.method === 'GET' && objectMetadataMatch) ||
        (request.method === 'GET' && objectSourceHistoryMatch) ||
        (request.method === 'POST' && objectSourceReadMatch) ||
        (request.method === 'POST' && atcRunMatch) ||
        (request.method === 'POST' && atcDocumentationReadMatch) ||
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

        let authorized: boolean;
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
              pageCursors!.paginate({
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
        if (resource === 'objects') {
          try {
            const { criteria, page } = parseObjectSearchQuery(
              readQuery(request),
            );
            const result = objectSearchResult.parse(
              await options.operations.searchObjects(destination!, criteria),
            );
            const data = objectPageResponse.parse(
              pageCursors!.paginate({
                ...result,
                ...page,
                fingerprint: `objects:${destination}:${criteria.query ?? '*'}:${criteria.packageName ?? ''}:${criteria.objectType ?? ''}:${criteria.maxResults ?? 5_000}`,
                keyOf: (entry) => entry.canonicalKey,
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
          const data = transportListResponse.parse(
            await options.operations.listTransports(
              destination!,
              parseTransportSearchQuery(readQuery(request)),
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
      if (request.method === 'GET' && packageObjectsMatch) {
        const [, destination, rawPackageName] = packageObjectsMatch;
        try {
          const packageName = packagePathParameter.parse(
            decodePathParameter(rawPackageName!),
          );
          const page = parsePageQuery(readQuery(request));
          const result = objectSearchResult.parse(
            await options.operations.listPackageObjects(
              destination!,
              packageName,
            ),
          );
          const data = objectPageResponse.parse(
            pageCursors!.paginate({
              ...result,
              ...page,
              fingerprint: `package-objects:${destination}:${packageName.toUpperCase()}:5000`,
              keyOf: (entry) => entry.canonicalKey,
            }),
          );
          response.writeHead(200, { 'content-type': 'application/json' });
          response.end(JSON.stringify(data));
        } catch (error) {
          if (
            error instanceof z.ZodError ||
            error instanceof RestPageCursorError ||
            error instanceof InvalidPathParameterError
          ) {
            writeProblem(response, 400, 'Invalid request');
            return;
          }
          throw error;
        }
        return;
      }
      if (request.method === 'GET' && packageTreeMatch) {
        const [, destination] = packageTreeMatch;
        try {
          const { rootPackage, page } = parsePackageTreeQuery(
            readQuery(request),
          );
          const result = packageSearchResult.parse(
            await options.operations.getPackageTree(destination!, rootPackage),
          );
          const data = packagePageResponse.parse(
            pageCursors!.paginate({
              ...result,
              ...page,
              fingerprint: `package-tree:${destination}:${rootPackage}`,
              // Preserve a tree's root as the first stable page item while
              // keeping descendants deterministically name-ordered.
              keyOf: (entry) =>
                `${entry.name === rootPackage ? '0' : '1'}:${entry.name}`,
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
      if (request.method === 'GET' && objectMetadataMatch) {
        const [, destination, rawObjectType, rawObjectName] =
          objectMetadataMatch;
        try {
          const objectType = objectTypePathParameter.parse(
            decodePathParameter(rawObjectType!),
          );
          const objectName = objectNamePathParameter.parse(
            decodePathParameter(rawObjectName!),
          );
          z.object({}).strict().parse(readQuery(request));
          if (!options.operations.getObjectMetadata) {
            writeProblem(response, 404, 'Not found');
            return;
          }
          const data = objectMetadataResponse.parse(
            await options.operations.getObjectMetadata(
              destination!,
              objectType,
              objectName,
            ),
          );
          response.writeHead(200, { 'content-type': 'application/json' });
          response.end(JSON.stringify(data));
        } catch (error) {
          if (
            error instanceof z.ZodError ||
            error instanceof InvalidPathParameterError
          ) {
            writeProblem(response, 400, 'Invalid request');
            return;
          }
          throw error;
        }
        return;
      }
      if (request.method === 'GET' && objectSourceHistoryMatch) {
        const [, destination, rawObjectType, rawObjectName] =
          objectSourceHistoryMatch;
        try {
          const objectType = objectTypePathParameter.parse(
            decodePathParameter(rawObjectType!),
          );
          const objectName = objectNamePathParameter.parse(
            decodePathParameter(rawObjectName!),
          );
          z.object({}).strict().parse(readQuery(request));
          if (!options.operations.getObjectSourceHistory) {
            writeProblem(response, 404, 'Not found');
            return;
          }
          const data = objectSourceHistoryResponse.parse(
            await options.operations.getObjectSourceHistory(
              destination!,
              objectType,
              objectName,
            ),
          );
          response.writeHead(200, { 'content-type': 'application/json' });
          response.end(JSON.stringify(data));
        } catch (error) {
          if (
            error instanceof z.ZodError ||
            error instanceof InvalidPathParameterError
          ) {
            writeProblem(response, 400, 'Invalid request');
            return;
          }
          throw error;
        }
        return;
      }
      if (request.method === 'POST' && objectSourceReadMatch) {
        const [, destination, rawObjectType, rawObjectName] =
          objectSourceReadMatch;
        try {
          const objectType = objectTypePathParameter.parse(
            decodePathParameter(rawObjectType!),
          );
          const objectName = objectNamePathParameter.parse(
            decodePathParameter(rawObjectName!),
          );
          const input = objectSourceReadBody.parse(await readJsonBody(request));
          if (!options.operations.readObjectSource) {
            writeProblem(response, 404, 'Not found');
            return;
          }
          const result = await options.operations.readObjectSource({
            destination: destination!,
            objectType,
            objectName,
            ...(input.version ? { version: input.version } : {}),
          });
          if (
            typeof result.source !== 'string' ||
            result.bytes !== Buffer.byteLength(result.source, 'utf8') ||
            result.bytes > MAX_SOURCE_BYTES
          ) {
            throw new Error(
              'Bounded object source operation returned an invalid body',
            );
          }
          const data = sourceVersionReadResponse.parse(result);
          response.writeHead(200, { 'content-type': 'application/json' });
          response.end(JSON.stringify(data));
        } catch (error) {
          if (
            error instanceof z.ZodError ||
            error instanceof InvalidPathParameterError ||
            error instanceof InvalidJsonBodyError
          ) {
            writeProblem(response, 400, 'Invalid request');
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
      if (request.method === 'POST' && atcRunMatch) {
        if (!options.operations.runAtc) {
          writeProblem(response, 404, 'Not found');
          return;
        }
        try {
          const input = atcRunBody.parse(await readJsonBody(request));
          const result = await options.operations.runAtc({
            destination: atcRunMatch[1]!,
            ...input,
          });
          const data = atcRunResponse.parse(
            toRestAtcRun(result, atcDocumentationCapabilities!, atcRunMatch[1]!),
          );
          response.writeHead(200, { 'content-type': 'application/json' });
          response.end(JSON.stringify(data));
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
        return;
      }
      if (request.method === 'POST' && atcDocumentationReadMatch) {
        if (!options.operations.readAtcFindingDocumentation) {
          writeProblem(response, 404, 'Not found');
          return;
        }
        try {
          const input = atcDocumentationReadBody.parse(
            await readJsonBody(request),
          );
          const maxBytes = input.maxBytes ?? MAX_ATC_DOCUMENTATION_BYTES;
          const { documentationUri } = atcDocumentationCapabilities!.resolve({
            documentationCapability: input.documentationCapability,
            destination: atcDocumentationReadMatch[1]!,
          });
          const result = await options.operations.readAtcFindingDocumentation({
            destination: atcDocumentationReadMatch[1]!,
            documentationUri,
            maxBytes,
          });
          if (
            typeof result.html !== 'string' ||
            result.bytes !== Buffer.byteLength(result.html, 'utf8') ||
            result.bytes > maxBytes
          ) {
            throw new Error(
              'Bounded ATC documentation operation returned an invalid body',
            );
          }
          const data = atcDocumentationReadResponse.parse(result);
          response.writeHead(200, { 'content-type': 'application/json' });
          response.end(JSON.stringify(data));
        } catch (error) {
          if (
            error instanceof z.ZodError ||
            error instanceof InvalidJsonBodyError
          ) {
            writeProblem(response, 400, 'Invalid request');
            return;
          }
          if (error instanceof RestAtcDocumentationCapabilityError) {
            writeProblem(response, 404, 'Documentation unavailable');
            return;
          }
          if (error instanceof AdtResponseTooLargeError) {
            writeProblem(response, 413, 'Documentation too large');
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
            sourceCapabilities!,
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
          const source = sourceCapabilities!.resolve({
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
