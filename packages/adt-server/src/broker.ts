import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createAdtClient, type AdtClient } from '@abapify/adt-client';
import { ExactSourceHistoryService } from '@abapify/adt-cli';
import type {
  DestinationContextFactory,
  DestinationLeaseProvider,
} from '@abapify/adt-mcp';
import type { DestinationSummary, AdtServerOperations } from './server.js';
import type {
  PackageSearchCriteria,
  TransportSearchCriteria,
} from './rest-schemas.js';

export interface HttpBrokerOptions {
  baseUrl: string;
  tokenFile: string;
  fetch?: typeof globalThis.fetch;
  /** Test seam; production derives the client from broker credentials. */
  createClient?: (connection: BrokerConnection) => Promise<AdtClient>;
}
interface BrokerConnection {
  baseUrl: string;
  sapClient: string | null;
  authMethod: 'basic' | 'btp_service_key';
  authConfig: Record<string, unknown>;
}
interface BrokerLease {
  leaseId: string;
  destination: string;
  version: number;
  expiresAt: string;
  connection: BrokerConnection;
}

function isBrokerLease(value: unknown): value is BrokerLease {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { leaseId?: unknown }).leaseId === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(
      (value as { leaseId: string }).leaseId,
    )
  );
}

interface CtsRequestHeader {
  TRKORR: string;
  TRFUNCTION?: string;
  TRSTATUS?: string;
  TARSYSTEM?: string;
  AS4USER?: string;
  AS4DATE?: string;
  AS4TIME?: string;
  AS4TEXT?: string;
  CLIENT?: string;
}

interface TransportSummary {
  trkorr: string;
  owner: string;
  description: string;
  status: string;
  statusRaw?: string;
  trFunction?: string;
  target?: string;
  client?: string;
  changedAt?: string;
}

interface CanonicalObjectReference {
  canonicalKey: string;
  objectType: string;
  objectName: string;
  pgmid?: string;
  objInfo?: string;
  objDesc?: string;
  lockStatus?: string;
}

interface TransportTaskDetail extends TransportSummary {
  parentTrkorr: string;
  objects: CanonicalObjectReference[];
}

interface TransportDetail extends TransportSummary {
  tasks: TransportTaskDetail[];
  objects: CanonicalObjectReference[];
}

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord | undefined {
  return value !== null && typeof value === 'object'
    ? (value as UnknownRecord)
    : undefined;
}

function records(value: unknown): UnknownRecord[] {
  return (Array.isArray(value) ? value : [value]).flatMap((entry) => {
    const parsed = record(entry);
    return parsed ? [parsed] : [];
  });
}

function stringField(value: UnknownRecord, key: string): string | undefined {
  const field = value[key];
  return typeof field === 'string' && field.trim() ? field.trim() : undefined;
}

function normalizedObjectType(value: string): string | undefined {
  const type = value.trim().toUpperCase().split('/', 1)[0]?.trim();
  return type || undefined;
}

function toCanonicalObjects(value: unknown): CanonicalObjectReference[] {
  return records(value).flatMap((entry) => {
    const objectType = normalizedObjectType(stringField(entry, 'type') ?? '');
    const objectName = stringField(entry, 'name')?.toUpperCase();
    if (!objectType || !objectName) return [];
    const optional = (
      key: string,
      outputKey: keyof CanonicalObjectReference,
    ) => {
      const field = stringField(entry, key);
      return field ? { [outputKey]: field } : {};
    };
    return [
      {
        canonicalKey: `${objectType}:${objectName}`,
        objectType,
        objectName,
        ...optional('pgmid', 'pgmid'),
        ...optional('obj_info', 'objInfo'),
        ...optional('obj_desc', 'objDesc'),
        ...optional('lock_status', 'lockStatus'),
      },
    ];
  });
}

function dedupeCanonicalObjects(
  values: CanonicalObjectReference[],
): CanonicalObjectReference[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = `${value.pgmid ?? ''}\u0000${value.canonicalKey}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeChangedAt(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function transportSummaryFromRequest(
  request: UnknownRecord,
  fallbackTrkorr: string,
): TransportSummary {
  const statusRaw = stringField(request, 'status');
  return {
    trkorr: stringField(request, 'number') ?? fallbackTrkorr,
    owner: stringField(request, 'owner') ?? '',
    description: stringField(request, 'desc') ?? '',
    status: mapTransportStatus(statusRaw),
    ...(statusRaw ? { statusRaw } : {}),
    ...(stringField(request, 'type')
      ? { trFunction: stringField(request, 'type')!.toUpperCase() }
      : {}),
    ...(stringField(request, 'target')
      ? { target: stringField(request, 'target')! }
      : {}),
    ...(stringField(request, 'client')
      ? { client: stringField(request, 'client')! }
      : {}),
    ...(normalizeChangedAt(request.lastchanged_timestamp)
      ? { changedAt: normalizeChangedAt(request.lastchanged_timestamp) }
      : {}),
  };
}

function toTransportDetail(
  response: unknown,
  transport: string,
): TransportDetail {
  const root = record(response)?.root;
  const request =
    record(record(root)?.request) ?? record(root) ?? record(response) ?? {};
  const summary = transportSummaryFromRequest(request, transport);
  const tasks = records(request.task).flatMap((task) => {
    const taskTrkorr = stringField(task, 'number');
    if (!taskTrkorr) return [];
    return [
      {
        ...transportSummaryFromRequest(task, taskTrkorr),
        parentTrkorr: transport,
        objects: toCanonicalObjects(task.abap_object),
      },
    ];
  });
  const allObjects = record(request.all_objects);
  return {
    ...summary,
    tasks,
    objects: dedupeCanonicalObjects(
      toCanonicalObjects(request.abap_object).concat(
        toCanonicalObjects(allObjects?.abap_object),
      ),
    ),
  };
}

function quickSearchReferences(response: unknown): UnknownRecord[] {
  const root = record(response) ?? {};
  const references =
    record(root.objectReferences)?.objectReference ??
    root.objectReference ??
    record(root.mainObject)?.objectReference;
  return records(references);
}

function packageSearchQuery(query?: string): string {
  const trimmed = query?.trim();
  return !trimmed ? '*' : /[*?]/u.test(trimmed) ? trimmed : `${trimmed}*`;
}

function toPackageNodes(value: unknown): Array<{
  name: string;
  parent?: string;
  description?: string;
}> {
  const seen = new Set<string>();
  return quickSearchReferences(value).flatMap((entry) => {
    const type = stringField(entry, 'type')?.toUpperCase();
    const name = stringField(entry, 'name')?.toUpperCase();
    if (!type?.startsWith('DEVC') || !name || seen.has(name)) return [];
    seen.add(name);
    const parent = stringField(entry, 'packageName')?.toUpperCase();
    const description = stringField(entry, 'description');
    return [
      {
        name,
        ...(parent && parent !== name ? { parent } : {}),
        ...(description ? { description } : {}),
      },
    ];
  });
}

function mapTransportStatus(status?: string): string {
  switch (status) {
    case 'R':
      return 'released';
    case 'D':
    case 'L':
      return 'modifiable';
    case 'O':
    case 'P':
      return 'release_started';
    default:
      return status ? status.toLowerCase() : '';
  }
}

function toTransportSummary(header: CtsRequestHeader): TransportSummary {
  return {
    trkorr: header.TRKORR,
    owner: header.AS4USER ?? '',
    description: header.AS4TEXT ?? '',
    status: mapTransportStatus(header.TRSTATUS),
    ...(header.TRSTATUS ? { statusRaw: header.TRSTATUS } : {}),
    ...(header.TRFUNCTION ? { trFunction: header.TRFUNCTION } : {}),
    ...(header.TARSYSTEM ? { target: header.TARSYSTEM } : {}),
    ...(header.CLIENT ? { client: header.CLIENT } : {}),
    ...(header.AS4DATE
      ? { changedAt: `${header.AS4DATE}T${header.AS4TIME ?? '00:00:00'}Z` }
      : {}),
  };
}

function same(value: string | undefined, expected: string): boolean {
  return (value ?? '').toLowerCase() === expected.toLowerCase();
}

function matchesText(transport: TransportSummary, value: string): boolean {
  if (value === '*') return true;
  if (value.endsWith('*')) {
    const prefix = value.slice(0, -1).trim();
    return (
      prefix.length > 0 &&
      transport.trkorr.toLowerCase().startsWith(prefix.toLowerCase())
    );
  }
  return (
    same(transport.trkorr, value) ||
    `${transport.description} ${transport.owner}`
      .toLowerCase()
      .includes(value.toLowerCase())
  );
}

function filterTransports(
  transports: TransportSummary[],
  criteria?: TransportSearchCriteria,
): TransportSummary[] {
  if (!criteria) return transports;
  return transports.filter((transport) => {
    if (
      criteria.includeTasks === false &&
      transport.trFunction &&
      ['S', 'R', 'X', 'Q'].includes(transport.trFunction.toUpperCase())
    )
      return false;
    if (criteria.owner && !same(transport.owner, criteria.owner)) return false;
    if (criteria.type && !same(transport.trFunction, criteria.type))
      return false;
    if (criteria.status && !same(transport.status, criteria.status))
      return false;
    if (criteria.target && !same(transport.target, criteria.target))
      return false;
    const date = transport.changedAt?.slice(0, 10);
    if (criteria.dateFrom && (!date || date < criteria.dateFrom)) return false;
    if (criteria.dateTo && (!date || date > criteria.dateTo)) return false;
    if (criteria.text && !matchesText(transport, criteria.text)) return false;
    return true;
  });
}

function extractTransportHeaders(response: unknown): CtsRequestHeader[] {
  const root = response as {
    abap?: { values?: { DATA?: { CTS_REQ_HEADER?: unknown } } };
    values?: { DATA?: { CTS_REQ_HEADER?: unknown } };
  };
  const headers =
    root.abap?.values?.DATA?.CTS_REQ_HEADER ??
    root.values?.DATA?.CTS_REQ_HEADER;
  if (!headers) return [];
  return (Array.isArray(headers) ? headers : [headers]).flatMap((header) =>
    header &&
    typeof header === 'object' &&
    typeof (header as { TRKORR?: unknown }).TRKORR === 'string'
      ? [header as CtsRequestHeader]
      : [],
  );
}

/** ARM-private broker client. It exposes only safe summaries to the public server layer. */
export function createHttpBrokerOperations(
  options: HttpBrokerOptions,
): AdtServerOperations {
  const fetcher = options.fetch ?? globalThis.fetch;
  const createClient = options.createClient ?? clientFromConnection;
  const readBrokerToken = async (): Promise<string> => {
    const token = (await readFile(options.tokenFile, 'utf8')).trim();
    if (!token) throw new Error('ADT Server broker token file is empty');
    return token;
  };
  const request = async (path: string): Promise<Response> => {
    const token = await readBrokerToken();
    const response = await fetcher(new URL(path, options.baseUrl), {
      headers: { 'x-arm-adt-server-token': token },
    });
    if (!response.ok)
      throw new Error(`ADT Server broker request failed (${response.status})`);
    return response;
  };
  const withClient = async <T>(
    destination: string,
    operationName: string,
    operation: (client: AdtClient) => Promise<T>,
  ): Promise<T> => {
    const token = await readBrokerToken();
    const response = await fetcher(
      new URL(
        '/internal/adt-server/destination-leases:acquire',
        options.baseUrl,
      ),
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-arm-adt-server-token': token,
        },
        body: JSON.stringify({ destination, correlationId: randomUUID() }),
      },
    );
    if (!response.ok)
      throw new Error(`Destination lease unavailable (${response.status})`);
    const lease = await response.json();
    if (!isBrokerLease(lease)) throw new Error('Destination lease unavailable');
    const startedAt = Date.now();
    let clientCreated = false;
    let outcome: 'succeeded' | 'failed' = 'failed';
    try {
      const client = await createClient(lease.connection);
      clientCreated = true;
      const result = await operation(client);
      outcome = 'succeeded';
      return result;
    } finally {
      const release = await fetcher(
        new URL(
          '/internal/adt-server/destination-leases:release',
          options.baseUrl,
        ),
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-arm-adt-server-token': token,
          },
          body: JSON.stringify({
            leaseId: lease.leaseId,
            operation: operationName,
            outcome,
            durationMs: Math.min(Date.now() - startedAt, 5 * 60_000),
            ...(outcome === 'failed'
              ? {
                  errorCode: clientCreated
                    ? 'operation_failed'
                    : 'client_creation_failed',
                }
              : {}),
          }),
        },
      );
      if (!release.ok)
        throw new Error(`Destination lease release failed (${release.status})`);
    }
  };
  return {
    async listDestinations(): Promise<DestinationSummary[]> {
      const body = (await (
        await request('/internal/adt-server/destinations')
      ).json()) as { data?: DestinationSummary[] };
      return Array.isArray(body.data) ? body.data : [];
    },
    async listTransports(destination, criteria) {
      return await withClient(
        destination,
        'list_transports',
        async (client) => {
          const response = await client.adt.cts.transports.find({
            _action: 'FIND',
            user: '*',
            trfunction: '*',
          });
          return filterTransports(
            extractTransportHeaders(response).map(toTransportSummary),
            criteria,
          );
        },
      );
    },
    async getTransportDetail(destination, transport) {
      return await withClient(
        destination,
        'get_transport_detail',
        async (client) =>
          toTransportDetail(
            await client.adt.cts.transportrequests.get(transport),
            transport,
          ),
      );
    },
    async listTransportObjects(destination, transport) {
      return await withClient(
        destination,
        'list_transport_objects',
        async (client) => {
          const detail = toTransportDetail(
            await client.adt.cts.transportrequests.get(transport),
            transport,
          );
          return dedupeCanonicalObjects([
            ...detail.objects,
            ...detail.tasks.flatMap((task) => task.objects),
          ]);
        },
      );
    },
    async searchPackages(destination, criteria: PackageSearchCriteria = {}) {
      return await withClient(
        destination,
        'search_packages',
        async (client) => {
          const cap = criteria.maxResults ?? 5_000;
          const response =
            await client.adt.repository.informationsystem.search.quickSearch({
              query: packageSearchQuery(criteria.q),
              objectType: 'DEVC',
              maxResults: cap + 1,
            });
          const packages = toPackageNodes(response);
          return {
            data: packages.slice(0, cap),
            truncated: quickSearchReferences(response).length >= cap,
          };
        },
      );
    },
    async searchObjects(destination) {
      return await withClient(
        destination,
        'search_objects',
        async (client) =>
          await client.adt.repository.informationsystem.search.quickSearch({
            query: '*',
            maxResults: 500,
          }),
      );
    },
    async buildTransportSourceManifest(destination, input) {
      return await withClient(
        destination,
        'build_transport_source_manifest',
        async (client) =>
          await new ExactSourceHistoryService(client).buildTransportManifest(
            input,
          ),
      );
    },
    async readImmutableSource(input) {
      return await withClient(
        input.destination,
        'read_immutable_source',
        async (client) => {
          const source =
            await client.services.sourceHistory.readVersionSourceBounded(
              input.sourceUri,
              input.maxBytes,
            );
          return { bytes: Buffer.byteLength(source, 'utf8'), source };
        },
      );
    },
  };
}

async function clientFromConnection(
  connection: BrokerConnection,
): Promise<AdtClient> {
  if (connection.authMethod === 'basic') {
    const username = connection.authConfig.username;
    const password = connection.authConfig.password;
    if (typeof username !== 'string' || typeof password !== 'string')
      throw new Error('Broker returned incomplete basic credentials');
    return createAdtClient({
      baseUrl: connection.baseUrl,
      client: connection.sapClient ?? undefined,
      username,
      password,
    });
  }
  const serviceKey = connection.authConfig.serviceKey as
    | { uaa?: { url?: string; clientid?: string; clientsecret?: string } }
    | undefined;
  if (
    !serviceKey?.uaa?.url ||
    !serviceKey.uaa.clientid ||
    !serviceKey.uaa.clientsecret
  )
    throw new Error('Broker returned incomplete BTP service key');
  const credentials = Buffer.from(
    `${serviceKey.uaa.clientid}:${serviceKey.uaa.clientsecret}`,
  ).toString('base64');
  const tokenResponse = await fetch(
    `${serviceKey.uaa.url.replace(/\/$/, '')}/oauth/token`,
    {
      method: 'POST',
      headers: {
        authorization: `Basic ${credentials}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    },
  );
  if (!tokenResponse.ok) throw new Error('BTP token acquisition failed');
  const token = (await tokenResponse.json()) as {
    access_token?: string;
    token_type?: string;
  };
  if (!token.access_token)
    throw new Error('BTP token response did not contain access_token');
  return createAdtClient({
    baseUrl: connection.baseUrl,
    client: connection.sapClient ?? undefined,
    authorizationHeader: `${token.token_type ?? 'Bearer'} ${token.access_token}`,
  });
}

/** Creates the opaque lease/provider pair consumed by shared MCP mode. */
export function createHttpDestinationContexts(options: HttpBrokerOptions): {
  leaseProvider: DestinationLeaseProvider;
  contextFactory: DestinationContextFactory;
  resolveFrozenSource(input: {
    destination: string;
    systemSid: string;
    sourceRef: string;
  }): Promise<{ sourceUri: string }>;
} {
  const fetcher = options.fetch ?? globalThis.fetch;
  const readBrokerToken = async (): Promise<string> => {
    const token = (await readFile(options.tokenFile, 'utf8')).trim();
    if (!token) throw new Error('ADT Server broker token file is empty');
    return token;
  };
  const acquire = async (destination: string): Promise<BrokerLease> => {
    const token = await readBrokerToken();
    const response = await fetcher(
      new URL(
        '/internal/adt-server/destination-leases:acquire',
        options.baseUrl,
      ),
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-arm-adt-server-token': token,
        },
        body: JSON.stringify({ destination, correlationId: randomUUID() }),
      },
    );
    if (!response.ok)
      throw new Error(`Destination lease unavailable (${response.status})`);
    const lease = await response.json();
    if (!isBrokerLease(lease)) throw new Error('Destination lease unavailable');
    return lease;
  };
  const release = async (lease: BrokerLease): Promise<void> => {
    const token = await readBrokerToken();
    const response = await fetcher(
      new URL(
        '/internal/adt-server/destination-leases:release',
        options.baseUrl,
      ),
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-arm-adt-server-token': token,
        },
        body: JSON.stringify({
          leaseId: lease.leaseId,
          operation: 'mcp_destination_context',
          outcome: 'succeeded',
          durationMs: 0,
        }),
      },
    );
    if (!response.ok)
      throw new Error(`Destination lease release failed (${response.status})`);
  };
  return {
    leaseProvider: {
      async acquire({ destination }) {
        const lease = await acquire(destination);
        let releasePromise: Promise<void> | undefined;
        return {
          destination: lease.destination,
          version: lease.version,
          expiresAt: Date.parse(lease.expiresAt),
          material: lease.connection,
          release: async () => {
            releasePromise ??= release(lease);
            await releasePromise;
          },
        };
      },
    },
    contextFactory: {
      async create({ lease }) {
        return {
          client: await clientFromConnection(
            lease.material as BrokerConnection,
          ),
          close: async () => undefined,
        };
      },
    },
    async resolveFrozenSource(input) {
      const token = await readBrokerToken();
      const response = await fetcher(
        new URL(
          '/internal/adt-server/frozen-source-references:resolve',
          options.baseUrl,
        ),
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-arm-adt-server-token': token,
          },
          body: JSON.stringify(input),
        },
      );
      if (!response.ok)
        throw new Error('Frozen source reference is unavailable');
      const body = (await response.json()) as { sourceUri?: unknown };
      if (
        typeof body.sourceUri !== 'string' ||
        !body.sourceUri.startsWith('/sap/bc/adt/') ||
        /[\s\\\u0000-\u001f\u007f]/u.test(body.sourceUri)
      ) {
        throw new Error('Frozen source reference is unavailable');
      }
      return { sourceUri: body.sourceUri };
    },
  };
}
