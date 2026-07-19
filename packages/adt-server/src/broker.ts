import { readFile } from 'node:fs/promises';
import { createAdtClient, type AdtClient } from '@abapify/adt-client';
import { ExactSourceHistoryService } from '@abapify/adt-cli';
import type {
  DestinationContextFactory,
  DestinationLeaseProvider,
} from '@abapify/adt-mcp';
import type { DestinationSummary, AdtServerOperations } from './server.js';

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
  destination: string;
  version: number;
  expiresAt: string;
  connection: BrokerConnection;
}

/** ADT-private broker client. It exposes only safe summaries to the public server layer. */
export function createHttpBrokerOperations(
  options: HttpBrokerOptions,
): AdtServerOperations {
  const fetcher = options.fetch ?? globalThis.fetch;
  const createClient = options.createClient ?? clientFromConnection;
  const request = async (path: string): Promise<Response> => {
    const token = (await readFile(options.tokenFile, 'utf8')).trim();
    if (!token) throw new Error('ADT Server broker token file is empty');
    const response = await fetcher(new URL(path, options.baseUrl), {
      headers: { 'x-adt-server-token': token },
    });
    if (!response.ok)
      throw new Error(`ADT Server broker request failed (${response.status})`);
    return response;
  };
  const withClient = async <T>(
    destination: string,
    operation: (client: AdtClient) => Promise<T>,
  ): Promise<T> => {
    const token = (await readFile(options.tokenFile, 'utf8')).trim();
    const response = await fetcher(
      new URL(
        '/internal/adt-server/destination-leases:acquire',
        options.baseUrl,
      ),
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-adt-server-token': token,
        },
        body: JSON.stringify({ destination }),
      },
    );
    if (!response.ok)
      throw new Error(`Destination lease unavailable (${response.status})`);
    return await operation(
      await createClient(((await response.json()) as BrokerLease).connection),
    );
  };
  return {
    async listDestinations(): Promise<DestinationSummary[]> {
      const body = (await (
        await request('/internal/adt-server/destinations')
      ).json()) as { data?: DestinationSummary[] };
      return Array.isArray(body.data) ? body.data : [];
    },
    async listTransports(destination) {
      return await withClient(
        destination,
        async (client) => await client.services.transports.list(),
      );
    },
    async searchPackages(destination) {
      return await withClient(
        destination,
        async (client) =>
          await client.adt.repository.informationsystem.search.quickSearch({
            query: '*',
            objectType: 'DEVC',
            maxResults: 500,
          }),
      );
    },
    async searchObjects(destination) {
      return await withClient(
        destination,
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
        async (client) =>
          await new ExactSourceHistoryService(client).buildTransportManifest(
            input,
          ),
      );
    },
    async readImmutableSource(input) {
      return await withClient(input.destination, async (client) => {
        const source =
          await client.services.sourceHistory.readVersionSourceBounded(
            input.sourceUri,
            input.maxBytes,
          );
        return { bytes: Buffer.byteLength(source, 'utf8'), source };
      });
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
  const acquire = async (destination: string): Promise<BrokerLease> => {
    const token = (await readFile(options.tokenFile, 'utf8')).trim();
    const response = await fetcher(
      new URL(
        '/internal/adt-server/destination-leases:acquire',
        options.baseUrl,
      ),
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-adt-server-token': token,
        },
        body: JSON.stringify({ destination }),
      },
    );
    if (!response.ok)
      throw new Error(`Destination lease unavailable (${response.status})`);
    return (await response.json()) as BrokerLease;
  };
  return {
    leaseProvider: {
      async acquire({ destination }) {
        const lease = await acquire(destination);
        return {
          destination: lease.destination,
          version: lease.version,
          expiresAt: Date.parse(lease.expiresAt),
          material: lease.connection,
          release: async () => undefined,
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
      const token = (await readFile(options.tokenFile, 'utf8')).trim();
      if (!token) throw new Error('ADT Server broker token file is empty');
      const response = await fetcher(
        new URL(
          '/internal/adt-server/frozen-source-references:resolve',
          options.baseUrl,
        ),
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-adt-server-token': token,
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
