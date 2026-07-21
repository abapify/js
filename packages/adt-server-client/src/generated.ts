/**
 * GENERATED FROM @abapify/adt-server's OpenAPI document.
 * Run `bun run --filter @abapify/adt-server-client generate`; do not edit manually.
 */

export interface AdtServerClientOptions {
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
  headers?: Record<string, string>;
}

export class AdtServerHttpError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
  ) {
    super(`ADT Server request failed (${status})`);
  }
}

type OperationDefinition = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  pathParameters: readonly string[];
  queryParameters: readonly string[];
  hasBody: boolean;
};

const operationDefinitions = {
  buildTransportSourceManifest: {
    method: 'POST',
    path: '/v1/destinations/{destination}/transport-source-manifests',
    pathParameters: ['destination'],
    queryParameters: [],
    hasBody: true,
  },
  getObjectMetadata: {
    method: 'GET',
    path: '/v1/destinations/{destination}/objects/{type}/{name}',
    pathParameters: ['destination', 'type', 'name'],
    queryParameters: [],
    hasBody: false,
  },
  getObjectSourceHistory: {
    method: 'GET',
    path: '/v1/destinations/{destination}/objects/{type}/{name}/source-history',
    pathParameters: ['destination', 'type', 'name'],
    queryParameters: [],
    hasBody: false,
  },
  getPackageTree: {
    method: 'GET',
    path: '/v1/destinations/{destination}/packages/tree',
    pathParameters: ['destination'],
    queryParameters: ['root', 'limit', 'cursor'],
    hasBody: false,
  },
  getTransportDetail: {
    method: 'GET',
    path: '/v1/destinations/{destination}/transports/{transport}',
    pathParameters: ['destination', 'transport'],
    queryParameters: [],
    hasBody: false,
  },
  listDestinations: {
    method: 'GET',
    path: '/v1/destinations',
    pathParameters: [],
    queryParameters: [],
    hasBody: false,
  },
  listPackageObjects: {
    method: 'GET',
    path: '/v1/destinations/{destination}/packages/{package}/objects',
    pathParameters: ['destination', 'package'],
    queryParameters: ['limit', 'cursor'],
    hasBody: false,
  },
  listTransportObjects: {
    method: 'GET',
    path: '/v1/destinations/{destination}/transports/{transport}/objects',
    pathParameters: ['destination', 'transport'],
    queryParameters: [],
    hasBody: false,
  },
  listTransports: {
    method: 'GET',
    path: '/v1/destinations/{destination}/transports',
    pathParameters: ['destination'],
    queryParameters: [
      'owner',
      'type',
      'status',
      'target',
      'dateFrom',
      'dateTo',
      'text',
      'includeTasks',
    ],
    hasBody: false,
  },
  readAtcFindingDocumentation: {
    method: 'POST',
    path: '/v1/destinations/{destination}/atc-finding-documentation:read',
    pathParameters: ['destination'],
    queryParameters: [],
    hasBody: true,
  },
  readObjectSource: {
    method: 'POST',
    path: '/v1/destinations/{destination}/objects/{type}/{name}/source:read',
    pathParameters: ['destination', 'type', 'name'],
    queryParameters: [],
    hasBody: true,
  },
  readSourceVersion: {
    method: 'POST',
    path: '/v1/destinations/{destination}/source-versions:read',
    pathParameters: ['destination'],
    queryParameters: [],
    hasBody: true,
  },
  runAtc: {
    method: 'POST',
    path: '/v1/destinations/{destination}/atc-runs',
    pathParameters: ['destination'],
    queryParameters: [],
    hasBody: true,
  },
  searchObjects: {
    method: 'GET',
    path: '/v1/destinations/{destination}/objects',
    pathParameters: ['destination'],
    queryParameters: [
      'query',
      'packageName',
      'objectType',
      'maxResults',
      'limit',
      'cursor',
    ],
    hasBody: false,
  },
  searchPackages: {
    method: 'GET',
    path: '/v1/destinations/{destination}/packages',
    pathParameters: ['destination'],
    queryParameters: ['q', 'maxResults', 'limit', 'cursor'],
    hasBody: false,
  },
} as const satisfies Record<string, OperationDefinition>;

export type BuildTransportSourceManifestParams = {
  destination: string;
  body: { transports: Array<string> };
};
export type BuildTransportSourceManifestResponse = {
  requestedTransports: Array<string>;
  scopeTransports: Array<string>;
  entries: Array<{
    object: { pgmid: string; type: string; name: string; packageName?: string };
    component: { id: string };
    sourceTransport: string;
    changeKind:
      | 'added'
      | 'modified'
      | 'deleted'
      | 'unchanged'
      | 'ambiguous'
      | 'unsupported'
      | 'failed';
    exact: boolean;
    base?: {
      id: string;
      ordinal: number;
      title?: string;
      contentType?: string;
      etag?: string;
      updatedAt?: string;
      author?: string;
      transports: Array<string>;
      sourceCapability: string;
    };
    head?: {
      id: string;
      ordinal: number;
      title?: string;
      contentType?: string;
      etag?: string;
      updatedAt?: string;
      author?: string;
      transports: Array<string>;
      sourceCapability: string;
    };
    diagnostic?: { code: string; message: string };
  }>;
};
export type GetObjectMetadataParams = {
  destination: string;
  type: string;
  name: string;
};
export type GetObjectMetadataResponse = {
  object: {
    canonicalKey: string;
    objectType: string;
    objectName: string;
    pgmid?: string;
    objInfo?: string;
    objDesc?: string;
    lockStatus?: string;
    packageName?: string;
    description?: string;
  };
  metadata: {
    adtObjectType?: string;
    description?: string;
    packageName?: string;
  };
  facets: Array<{
    facet?: string;
    name?: string;
    displayName?: string;
    text?: string;
    version?: string;
    hasChildrenOfSameFacet?: boolean;
  }>;
  capabilities: Array<{
    relation: string;
    capability:
      | 'source'
      | 'versions'
      | 'structure'
      | 'text_elements'
      | 'enhancement_implementations'
      | 'enhancement_options'
      | 'syntax';
    title?: string;
    mediaType?: string;
    etag?: string;
  }>;
};
export type GetObjectSourceHistoryParams = {
  destination: string;
  type: string;
  name: string;
};
export type GetObjectSourceHistoryResponse = {
  available: boolean;
  versions: Array<{
    id: string;
    ordinal: number;
    title?: string;
    contentType?: string;
    etag?: string;
    updatedAt?: string;
    author?: string;
    transports: Array<string>;
  }>;
};
export type GetPackageTreeParams = {
  destination: string;
  root: string;
  limit?: number;
  cursor?: string;
};
export type GetPackageTreeResponse = {
  data: Array<{ name: string; parent?: string; description?: string }>;
  nextCursor: string | null;
  truncated: boolean;
  observedAt: string;
};
export type GetTransportDetailParams = {
  destination: string;
  transport: string;
};
export type GetTransportDetailResponse = {
  trkorr: string;
  owner: string;
  description: string;
  status: string;
  statusRaw?: string;
  trFunction?: string;
  target?: string;
  client?: string;
  changedAt?: string;
  tasks: Array<{
    trkorr: string;
    owner: string;
    description: string;
    status: string;
    statusRaw?: string;
    trFunction?: string;
    target?: string;
    client?: string;
    changedAt?: string;
    parentTrkorr: string;
    objects: Array<{
      canonicalKey: string;
      objectType: string;
      objectName: string;
      pgmid?: string;
      objInfo?: string;
      objDesc?: string;
      lockStatus?: string;
    }>;
  }>;
  objects: Array<{
    canonicalKey: string;
    objectType: string;
    objectName: string;
    pgmid?: string;
    objInfo?: string;
    objDesc?: string;
    lockStatus?: string;
  }>;
};
export type ListDestinationsParams = Record<string, never>;
export type ListDestinationsResponse = {
  data: Array<{
    key: string;
    displayName: string;
    systemSids: Array<string>;
    authConfigured: boolean;
    version: number;
  }>;
};
export type ListPackageObjectsParams = {
  destination: string;
  package: string;
  limit?: number;
  cursor?: string;
};
export type ListPackageObjectsResponse = {
  data: Array<{
    canonicalKey: string;
    objectType: string;
    objectName: string;
    pgmid?: string;
    objInfo?: string;
    objDesc?: string;
    lockStatus?: string;
    packageName?: string;
    description?: string;
  }>;
  nextCursor: string | null;
  truncated: boolean;
  observedAt: string;
};
export type ListTransportObjectsParams = {
  destination: string;
  transport: string;
};
export type ListTransportObjectsResponse = Array<{
  canonicalKey: string;
  objectType: string;
  objectName: string;
  pgmid?: string;
  objInfo?: string;
  objDesc?: string;
  lockStatus?: string;
}>;
export type ListTransportsParams = {
  destination: string;
  owner?: string;
  type?: string;
  status?: string;
  target?: string;
  dateFrom?: string;
  dateTo?: string;
  text?: string;
  includeTasks?: 'true' | 'false';
};
export type ListTransportsResponse = Array<{
  trkorr: string;
  owner: string;
  description: string;
  status: string;
  statusRaw?: string;
  trFunction?: string;
  target?: string;
  client?: string;
  changedAt?: string;
}>;
export type ReadAtcFindingDocumentationParams = {
  destination: string;
  body: { documentationCapability: string; maxBytes?: number };
};
export type ReadAtcFindingDocumentationResponse = {
  bytes: number;
  html: string;
};
export type ReadObjectSourceParams = {
  destination: string;
  type: string;
  name: string;
  body: { version?: string };
};
export type ReadObjectSourceResponse = { bytes: number; source: string };
export type ReadSourceVersionParams = {
  destination: string;
  body: { sourceCapability: string; maxBytes: number };
};
export type ReadSourceVersionResponse = { bytes: number; source: string };
export type RunAtcParams = {
  destination: string;
  body: {
    scope:
      | { kind: 'package'; packageName: string }
      | { kind: 'transport_request'; trkorr: string }
      | {
          kind: 'objects';
          objects: Array<{ objectType: string; objectName: string }>;
        };
    variant?: string;
  };
};
export type RunAtcResponse = {
  checkVariant: string;
  findings: Array<{
    checkId: string;
    checkTitle: string;
    messageText: string;
    priority: number;
    objectType: string;
    objectName: string;
    lineStart?: number;
    lineEnd?: number;
    messageId?: string;
    packageName?: string;
    objectDescription?: string;
    contactPerson?: string;
    processor?: string;
    lastChangedBy?: string;
    exemptionKind?: string;
    exemptionApproval?: string;
    noExemption?: boolean;
    quickfixInfo?: string;
    quickfixes?: { manual?: boolean; automatic?: boolean; pseudo?: boolean };
    checksum?: string;
    documentationCapability?: string;
  }>;
};
export type SearchObjectsParams = {
  destination: string;
  query?: string;
  packageName?: string;
  objectType?: string;
  maxResults?: number;
  limit?: number;
  cursor?: string;
};
export type SearchObjectsResponse = {
  data: Array<{
    canonicalKey: string;
    objectType: string;
    objectName: string;
    pgmid?: string;
    objInfo?: string;
    objDesc?: string;
    lockStatus?: string;
    packageName?: string;
    description?: string;
  }>;
  nextCursor: string | null;
  truncated: boolean;
  observedAt: string;
};
export type SearchPackagesParams = {
  destination: string;
  q?: string;
  maxResults?: number;
  limit?: number;
  cursor?: string;
};
export type SearchPackagesResponse = {
  data: Array<{ name: string; parent?: string; description?: string }>;
  nextCursor: string | null;
  truncated: boolean;
  observedAt: string;
};

function inputValue(input: object | undefined, name: string): unknown {
  return (input as Record<string, unknown> | undefined)?.[name];
}

export function createAdtServerClient(options: AdtServerClientOptions) {
  const fetcher = options.fetch ?? globalThis.fetch;
  const request = async <T>(
    definition: OperationDefinition,
    input?: object,
  ): Promise<T> => {
    const path = definition.path.replace(
      /\{([A-Za-z_$][A-Za-z0-9_$]*)\}/gu,
      (_match, name: string) => {
        const value = inputValue(input, name);
        if (value === undefined || value === null) {
          throw new Error(`Missing required path parameter: ${name}`);
        }
        return encodeURIComponent(String(value));
      },
    );
    const url = new URL(path, options.baseUrl);
    for (const name of definition.queryParameters) {
      const value = inputValue(input, name);
      if (value !== undefined && value !== null)
        url.searchParams.set(name, String(value));
    }
    const body = inputValue(input, 'body');
    const response = await fetcher(url, {
      method: definition.method,
      headers: {
        accept: 'application/json',
        ...(definition.hasBody ? { 'content-type': 'application/json' } : {}),
        ...options.headers,
      },
      ...(definition.hasBody ? { body: JSON.stringify(body) } : {}),
    });
    const responseBody = await response.json().catch(() => undefined);
    if (!response.ok) {
      throw new AdtServerHttpError(response.status, responseBody);
    }
    return responseBody as T;
  };

  return {
    buildTransportSourceManifest: (
      params: BuildTransportSourceManifestParams,
    ) =>
      request<BuildTransportSourceManifestResponse>(
        operationDefinitions.buildTransportSourceManifest,
        params,
      ),
    getObjectMetadata: (params: GetObjectMetadataParams) =>
      request<GetObjectMetadataResponse>(
        operationDefinitions.getObjectMetadata,
        params,
      ),
    getObjectSourceHistory: (params: GetObjectSourceHistoryParams) =>
      request<GetObjectSourceHistoryResponse>(
        operationDefinitions.getObjectSourceHistory,
        params,
      ),
    getPackageTree: (params: GetPackageTreeParams) =>
      request<GetPackageTreeResponse>(
        operationDefinitions.getPackageTree,
        params,
      ),
    getTransportDetail: (params: GetTransportDetailParams) =>
      request<GetTransportDetailResponse>(
        operationDefinitions.getTransportDetail,
        params,
      ),
    listDestinations: () =>
      request<ListDestinationsResponse>(operationDefinitions.listDestinations),
    listPackageObjects: (params: ListPackageObjectsParams) =>
      request<ListPackageObjectsResponse>(
        operationDefinitions.listPackageObjects,
        params,
      ),
    listTransportObjects: (params: ListTransportObjectsParams) =>
      request<ListTransportObjectsResponse>(
        operationDefinitions.listTransportObjects,
        params,
      ),
    listTransports: (params: ListTransportsParams) =>
      request<ListTransportsResponse>(
        operationDefinitions.listTransports,
        params,
      ),
    readAtcFindingDocumentation: (params: ReadAtcFindingDocumentationParams) =>
      request<ReadAtcFindingDocumentationResponse>(
        operationDefinitions.readAtcFindingDocumentation,
        params,
      ),
    readObjectSource: (params: ReadObjectSourceParams) =>
      request<ReadObjectSourceResponse>(
        operationDefinitions.readObjectSource,
        params,
      ),
    readSourceVersion: (params: ReadSourceVersionParams) =>
      request<ReadSourceVersionResponse>(
        operationDefinitions.readSourceVersion,
        params,
      ),
    runAtc: (params: RunAtcParams) =>
      request<RunAtcResponse>(operationDefinitions.runAtc, params),
    searchObjects: (params: SearchObjectsParams) =>
      request<SearchObjectsResponse>(
        operationDefinitions.searchObjects,
        params,
      ),
    searchPackages: (params: SearchPackagesParams) =>
      request<SearchPackagesResponse>(
        operationDefinitions.searchPackages,
        params,
      ),
  };
}

export type AdtServerClient = ReturnType<typeof createAdtServerClient>;
