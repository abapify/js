import http from 'node:http';
import {
  AdtResponseTooLargeError,
  SourceVersionTooLargeError,
} from '@abapify/adt-client';
import { z } from 'zod';
import type { HttpMcpHandler } from '@abapify/adt-mcp';
import {
  RestAtcDocumentationCapabilityError,
  createRestAtcDocumentationCapabilityService,
} from './atc-documentation-capabilities.js';
import {
  RestSourceCapabilityError,
  createRestSourceCapabilityService,
} from './source-capabilities.js';
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
  type TransportSourceManifestInput,
} from './rest-schemas.js';
import type { AdtServerOptions } from './server.js';

const MAX_JSON_BODY_BYTES = 64 * 1024;

type RawSourceVersion = {
  sourceUri: string;
};

export type RawTransportSourceManifest = {
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

export type AtcRunOperationResult = {
  checkVariant: string;
  findings: Array<
    Omit<z.infer<typeof atcFindingResponse>, 'documentationCapability'> & {
      /** Trusted broker-local relation; converted before the REST response. */
      documentationUri?: string;
    }
  >;
};

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

function sendJson(response: http.ServerResponse, data: unknown): void {
  response.writeHead(200, { 'content-type': 'application/json' });
  response.end(JSON.stringify(data));
}

function writeNotFound(response: http.ServerResponse): void {
  writeProblem(response, 404, 'Not found');
}

function parseObjectType(raw: string): string {
  return objectTypePathParameter.parse(decodePathParameter(raw));
}

function parseObjectName(raw: string): string {
  return objectNamePathParameter.parse(decodePathParameter(raw));
}

function parsePackageName(raw: string): string {
  return packagePathParameter.parse(decodePathParameter(raw));
}

function handleKnownError(
  response: http.ServerResponse,
  error: unknown,
): boolean {
  if (error instanceof z.ZodError) {
    writeProblem(response, 400, 'Invalid request');
    return true;
  }
  if (error instanceof InvalidJsonBodyError) {
    writeProblem(response, 400, 'Invalid request');
    return true;
  }
  if (error instanceof InvalidPathParameterError) {
    writeProblem(response, 400, 'Invalid request');
    return true;
  }
  if (error instanceof RestPageCursorError) {
    writeProblem(response, 400, 'Invalid request');
    return true;
  }
  if (error instanceof RestAtcDocumentationCapabilityError) {
    writeProblem(response, 404, 'Documentation unavailable');
    return true;
  }
  if (error instanceof AdtResponseTooLargeError) {
    writeProblem(response, 413, 'Documentation too large');
    return true;
  }
  if (error instanceof RestSourceCapabilityError) {
    writeProblem(response, 404, 'Source unavailable');
    return true;
  }
  if (error instanceof SourceVersionTooLargeError) {
    writeProblem(response, 413, 'Source too large');
    return true;
  }
  return false;
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

export interface RequestHandlerContext {
  options: AdtServerOptions;
  mcpHandler?: HttpMcpHandler;
  sourceCapabilities?: ReturnType<typeof createRestSourceCapabilityService>;
  atcDocumentationCapabilities?: ReturnType<
    typeof createRestAtcDocumentationCapabilityService
  >;
  pageCursors?: ReturnType<typeof createRestPageCursorService>;
}

type Route = {
  method?: string;
  pattern: RegExp;
  requiresRest: boolean;
  handler: (
    ctx: RequestHandlerContext,
    request: http.IncomingMessage,
    response: http.ServerResponse,
    match: RegExpExecArray,
  ) => Promise<void>;
};

async function ensureRestAuthorized(
  ctx: RequestHandlerContext,
  request: http.IncomingMessage,
  response: http.ServerResponse,
): Promise<boolean> {
  if (!ctx.options.restAuthorizer) {
    writeNotFound(response);
    return false;
  }
  let authorized: boolean;
  try {
    authorized = await ctx.options.restAuthorizer.authorize(request);
  } catch {
    authorized = false;
  }
  if (!authorized) {
    writeProblem(response, 401, 'Unauthorized');
    return false;
  }
  return true;
}

async function handleMcp(
  ctx: RequestHandlerContext,
  request: http.IncomingMessage,
  response: http.ServerResponse,
): Promise<void> {
  if (!ctx.mcpHandler) {
    writeNotFound(response);
    return;
  }
  await ctx.mcpHandler.handle(request, response);
}

async function handleHealth(
  _ctx: RequestHandlerContext,
  _request: http.IncomingMessage,
  response: http.ServerResponse,
): Promise<void> {
  sendJson(response, { status: 'ok' });
}

async function handleReady(
  _ctx: RequestHandlerContext,
  _request: http.IncomingMessage,
  response: http.ServerResponse,
): Promise<void> {
  sendJson(response, { status: 'ready' });
}

async function handleOpenApiJson(
  _ctx: RequestHandlerContext,
  _request: http.IncomingMessage,
  response: http.ServerResponse,
): Promise<void> {
  const { openApiDocument } = await import('./openapi.js');
  sendJson(response, openApiDocument);
}

async function handleOpenApiYaml(
  _ctx: RequestHandlerContext,
  _request: http.IncomingMessage,
  response: http.ServerResponse,
): Promise<void> {
  const { openApiYaml } = await import('./openapi.js');
  response.writeHead(200, { 'content-type': 'application/yaml' });
  response.end(openApiYaml());
}

async function handleListDestinations(
  ctx: RequestHandlerContext,
  _request: http.IncomingMessage,
  response: http.ServerResponse,
): Promise<void> {
  sendJson(response, { data: await ctx.options.operations.listDestinations() });
}

async function handleTransportList(
  ctx: RequestHandlerContext,
  request: http.IncomingMessage,
  response: http.ServerResponse,
  match: RegExpExecArray,
): Promise<void> {
  try {
    const destination = match[1]!;
    const data = transportListResponse.parse(
      await ctx.options.operations.listTransports(
        destination,
        parseTransportSearchQuery(readQuery(request)),
      ),
    );
    sendJson(response, data);
  } catch (error) {
    if (handleKnownError(response, error)) return;
    throw error;
  }
}

async function handlePackageSearch(
  ctx: RequestHandlerContext,
  request: http.IncomingMessage,
  response: http.ServerResponse,
  match: RegExpExecArray,
): Promise<void> {
  try {
    const destination = match[1]!;
    const { criteria, page } = parsePackageSearchQuery(readQuery(request));
    const result = packageSearchResult.parse(
      await ctx.options.operations.searchPackages(destination, criteria),
    );
    const data = packagePageResponse.parse(
      ctx.pageCursors!.paginate({
        ...result,
        ...page,
        fingerprint: `packages:${destination}:${criteria.q ?? '*'}:${criteria.maxResults ?? 5_000}`,
        keyOf: (entry) => entry.name,
      }),
    );
    sendJson(response, data);
  } catch (error) {
    if (handleKnownError(response, error)) return;
    throw error;
  }
}

async function handleObjectSearch(
  ctx: RequestHandlerContext,
  request: http.IncomingMessage,
  response: http.ServerResponse,
  match: RegExpExecArray,
): Promise<void> {
  try {
    const destination = match[1]!;
    const { criteria, page } = parseObjectSearchQuery(readQuery(request));
    const result = objectSearchResult.parse(
      await ctx.options.operations.searchObjects(destination, criteria),
    );
    const data = objectPageResponse.parse(
      ctx.pageCursors!.paginate({
        ...result,
        ...page,
        fingerprint: `objects:${destination}:${criteria.query ?? '*'}:${criteria.packageName ?? ''}:${criteria.objectType ?? ''}:${criteria.maxResults ?? 5_000}`,
        keyOf: (entry) => entry.canonicalKey,
      }),
    );
    sendJson(response, data);
  } catch (error) {
    if (handleKnownError(response, error)) return;
    throw error;
  }
}

async function handlePackageObjects(
  ctx: RequestHandlerContext,
  request: http.IncomingMessage,
  response: http.ServerResponse,
  match: RegExpExecArray,
): Promise<void> {
  try {
    const destination = match[1]!;
    const packageName = parsePackageName(match[2]!);
    const page = parsePageQuery(readQuery(request));
    const result = objectSearchResult.parse(
      await ctx.options.operations.listPackageObjects(destination, packageName),
    );
    const data = objectPageResponse.parse(
      ctx.pageCursors!.paginate({
        ...result,
        ...page,
        fingerprint: `package-objects:${destination}:${packageName.toUpperCase()}:5000`,
        keyOf: (entry) => entry.canonicalKey,
      }),
    );
    sendJson(response, data);
  } catch (error) {
    if (handleKnownError(response, error)) return;
    throw error;
  }
}

async function handlePackageTree(
  ctx: RequestHandlerContext,
  request: http.IncomingMessage,
  response: http.ServerResponse,
  match: RegExpExecArray,
): Promise<void> {
  try {
    const destination = match[1]!;
    const { rootPackage, page } = parsePackageTreeQuery(readQuery(request));
    const result = packageSearchResult.parse(
      await ctx.options.operations.getPackageTree(destination, rootPackage),
    );
    const data = packagePageResponse.parse(
      ctx.pageCursors!.paginate({
        ...result,
        ...page,
        fingerprint: `package-tree:${destination}:${rootPackage}`,
        keyOf: (entry) =>
          `${entry.name === rootPackage ? '0' : '1'}:${entry.name}`,
      }),
    );
    sendJson(response, data);
  } catch (error) {
    if (handleKnownError(response, error)) return;
    throw error;
  }
}

async function handleObjectMetadata(
  ctx: RequestHandlerContext,
  request: http.IncomingMessage,
  response: http.ServerResponse,
  match: RegExpExecArray,
): Promise<void> {
  try {
    const destination = match[1]!;
    const objectType = parseObjectType(match[2]!);
    const objectName = parseObjectName(match[3]!);
    z.object({}).strict().parse(readQuery(request));
    if (!ctx.options.operations.getObjectMetadata) {
      writeNotFound(response);
      return;
    }
    const data = objectMetadataResponse.parse(
      await ctx.options.operations.getObjectMetadata(
        destination,
        objectType,
        objectName,
      ),
    );
    sendJson(response, data);
  } catch (error) {
    if (handleKnownError(response, error)) return;
    throw error;
  }
}

async function handleObjectSourceHistory(
  ctx: RequestHandlerContext,
  request: http.IncomingMessage,
  response: http.ServerResponse,
  match: RegExpExecArray,
): Promise<void> {
  try {
    const destination = match[1]!;
    const objectType = parseObjectType(match[2]!);
    const objectName = parseObjectName(match[3]!);
    z.object({}).strict().parse(readQuery(request));
    if (!ctx.options.operations.getObjectSourceHistory) {
      writeNotFound(response);
      return;
    }
    const data = objectSourceHistoryResponse.parse(
      await ctx.options.operations.getObjectSourceHistory(
        destination,
        objectType,
        objectName,
      ),
    );
    sendJson(response, data);
  } catch (error) {
    if (handleKnownError(response, error)) return;
    throw error;
  }
}

async function handleObjectSourceRead(
  ctx: RequestHandlerContext,
  request: http.IncomingMessage,
  response: http.ServerResponse,
  match: RegExpExecArray,
): Promise<void> {
  try {
    const destination = match[1]!;
    const objectType = parseObjectType(match[2]!);
    const objectName = parseObjectName(match[3]!);
    const input = objectSourceReadBody.parse(await readJsonBody(request));
    if (!ctx.options.operations.readObjectSource) {
      writeNotFound(response);
      return;
    }
    const result = await ctx.options.operations.readObjectSource({
      destination,
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
    sendJson(response, data);
  } catch (error) {
    if (handleKnownError(response, error)) return;
    throw error;
  }
}

async function handleAtcRun(
  ctx: RequestHandlerContext,
  request: http.IncomingMessage,
  response: http.ServerResponse,
  match: RegExpExecArray,
): Promise<void> {
  try {
    const destination = match[1]!;
    if (!ctx.options.operations.runAtc) {
      writeNotFound(response);
      return;
    }
    const input = atcRunBody.parse(await readJsonBody(request));
    const result = await ctx.options.operations.runAtc({
      destination,
      ...input,
    });
    const data = atcRunResponse.parse(
      toRestAtcRun(result, ctx.atcDocumentationCapabilities!, destination),
    );
    sendJson(response, data);
  } catch (error) {
    if (handleKnownError(response, error)) return;
    throw error;
  }
}

async function handleAtcDocumentationRead(
  ctx: RequestHandlerContext,
  request: http.IncomingMessage,
  response: http.ServerResponse,
  match: RegExpExecArray,
): Promise<void> {
  try {
    const destination = match[1]!;
    if (!ctx.options.operations.readAtcFindingDocumentation) {
      writeNotFound(response);
      return;
    }
    const input = atcDocumentationReadBody.parse(await readJsonBody(request));
    const maxBytes = input.maxBytes ?? MAX_ATC_DOCUMENTATION_BYTES;
    const { documentationUri } = ctx.atcDocumentationCapabilities!.resolve({
      documentationCapability: input.documentationCapability,
      destination,
    });
    const result = await ctx.options.operations.readAtcFindingDocumentation({
      destination,
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
    sendJson(response, data);
  } catch (error) {
    if (handleKnownError(response, error)) return;
    throw error;
  }
}

async function handleTransportDetail(
  ctx: RequestHandlerContext,
  _request: http.IncomingMessage,
  response: http.ServerResponse,
  match: RegExpExecArray,
): Promise<void> {
  try {
    const destination = match[1]!;
    const transport = transportPathParameter.parse(match[2]!);
    if (!ctx.options.operations.getTransportDetail) {
      writeNotFound(response);
      return;
    }
    const data = transportDetailResponse.parse(
      await ctx.options.operations.getTransportDetail(destination, transport),
    );
    sendJson(response, data);
  } catch (error) {
    if (handleKnownError(response, error)) return;
    throw error;
  }
}

async function handleTransportObjects(
  ctx: RequestHandlerContext,
  _request: http.IncomingMessage,
  response: http.ServerResponse,
  match: RegExpExecArray,
): Promise<void> {
  try {
    const destination = match[1]!;
    const transport = transportPathParameter.parse(match[2]!);
    if (!ctx.options.operations.listTransportObjects) {
      writeNotFound(response);
      return;
    }
    const data = transportObjectsResponse.parse(
      await ctx.options.operations.listTransportObjects(destination, transport),
    );
    sendJson(response, data);
  } catch (error) {
    if (handleKnownError(response, error)) return;
    throw error;
  }
}

async function handleTransportSourceManifest(
  ctx: RequestHandlerContext,
  request: http.IncomingMessage,
  response: http.ServerResponse,
  match: RegExpExecArray,
): Promise<void> {
  try {
    const destination = match[1]!;
    if (!ctx.options.operations.buildTransportSourceManifest) {
      writeNotFound(response);
      return;
    }
    const input = transportSourceManifestBody.parse(
      await readJsonBody(request),
    );
    const manifest = await ctx.options.operations.buildTransportSourceManifest(
      destination,
      input as TransportSourceManifestInput,
    );
    const data = transportSourceManifestResponse.parse(
      toRestTransportSourceManifest(
        manifest as RawTransportSourceManifest,
        ctx.sourceCapabilities!,
        destination,
      ),
    );
    sendJson(response, data);
  } catch (error) {
    if (handleKnownError(response, error)) return;
    throw error;
  }
}

async function handleSourceVersionRead(
  ctx: RequestHandlerContext,
  request: http.IncomingMessage,
  response: http.ServerResponse,
  match: RegExpExecArray,
): Promise<void> {
  try {
    const destination = match[1]!;
    if (!ctx.options.operations.readImmutableSource) {
      writeNotFound(response);
      return;
    }
    const input = sourceVersionReadBody.parse(await readJsonBody(request));
    const source = ctx.sourceCapabilities!.resolve({
      sourceCapability: input.sourceCapability,
      destination,
    });
    const result = await ctx.options.operations.readImmutableSource({
      destination,
      sourceUri: source.sourceUri,
      maxBytes: input.maxBytes,
    });
    if (
      typeof result.source !== 'string' ||
      result.bytes !== Buffer.byteLength(result.source, 'utf8') ||
      result.bytes > input.maxBytes
    ) {
      throw new Error('Bounded source operation returned an invalid body');
    }
    const data = sourceVersionReadResponse.parse(result);
    sendJson(response, data);
  } catch (error) {
    if (handleKnownError(response, error)) return;
    throw error;
  }
}

export function createRequestHandler(
  ctx: RequestHandlerContext,
): (request: http.IncomingMessage, response: http.ServerResponse) => void {
  const routes: Route[] = [
    { pattern: /^\/mcp\/?$/u, requiresRest: false, handler: handleMcp },
    {
      method: 'GET',
      pattern: /^\/healthz$/u,
      requiresRest: false,
      handler: handleHealth,
    },
    {
      method: 'GET',
      pattern: /^\/readyz$/u,
      requiresRest: false,
      handler: handleReady,
    },
    {
      method: 'GET',
      pattern: /^\/openapi\.json$/u,
      requiresRest: false,
      handler: handleOpenApiJson,
    },
    {
      method: 'GET',
      pattern: /^\/openapi\.yaml$/u,
      requiresRest: false,
      handler: handleOpenApiYaml,
    },
    {
      method: 'GET',
      pattern: /^\/v1\/destinations$/u,
      requiresRest: true,
      handler: handleListDestinations,
    },
    {
      method: 'GET',
      pattern: /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/transports$/u,
      requiresRest: true,
      handler: handleTransportList,
    },
    {
      method: 'GET',
      pattern: /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/packages$/u,
      requiresRest: true,
      handler: handlePackageSearch,
    },
    {
      method: 'GET',
      pattern: /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/objects$/u,
      requiresRest: true,
      handler: handleObjectSearch,
    },
    {
      method: 'GET',
      pattern:
        /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/packages\/([^/]+)\/objects$/u,
      requiresRest: true,
      handler: handlePackageObjects,
    },
    {
      method: 'GET',
      pattern: /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/packages\/tree$/u,
      requiresRest: true,
      handler: handlePackageTree,
    },
    {
      method: 'GET',
      pattern:
        /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/objects\/([^/]+)\/([^/]+)$/u,
      requiresRest: true,
      handler: handleObjectMetadata,
    },
    {
      method: 'GET',
      pattern:
        /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/objects\/([^/]+)\/([^/]+)\/source-history$/u,
      requiresRest: true,
      handler: handleObjectSourceHistory,
    },
    {
      method: 'POST',
      pattern:
        /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/objects\/([^/]+)\/([^/]+)\/source:read$/u,
      requiresRest: true,
      handler: handleObjectSourceRead,
    },
    {
      method: 'POST',
      pattern: /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/atc-runs$/u,
      requiresRest: true,
      handler: handleAtcRun,
    },
    {
      method: 'POST',
      pattern:
        /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/atc-finding-documentation:read$/u,
      requiresRest: true,
      handler: handleAtcDocumentationRead,
    },
    {
      method: 'GET',
      pattern:
        /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/transports\/([^/]+)$/u,
      requiresRest: true,
      handler: handleTransportDetail,
    },
    {
      method: 'GET',
      pattern:
        /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/transports\/([^/]+)\/objects$/u,
      requiresRest: true,
      handler: handleTransportObjects,
    },
    {
      method: 'POST',
      pattern:
        /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/transport-source-manifests$/u,
      requiresRest: true,
      handler: handleTransportSourceManifest,
    },
    {
      method: 'POST',
      pattern:
        /^\/v1\/destinations\/([a-z][a-z0-9-]{1,62})\/source-versions:read$/u,
      requiresRest: true,
      handler: handleSourceVersionRead,
    },
  ];

  return (request, response) => {
    void (async () => {
      const path = (request.url ?? '/').split('?', 1)[0];
      for (const route of routes) {
        if (route.method && request.method !== route.method) continue;
        const match = route.pattern.exec(path);
        if (!match) continue;
        if (
          route.requiresRest &&
          !(await ensureRestAuthorized(ctx, request, response))
        )
          return;
        await route.handler(ctx, request, response, match);
        return;
      }
      writeNotFound(response);
    })().catch(() => {
      if (response.headersSent) {
        response.end();
        return;
      }
      writeProblem(response, 500, 'Internal server error');
    });
  };
}
