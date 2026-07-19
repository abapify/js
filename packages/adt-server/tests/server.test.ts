import assert from 'node:assert/strict';
import test from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {
  createDestinationContextRegistry,
  createMcpInvocationVerifier,
} from '../../adt-mcp/src/index.ts';
import { generateKeyPair, SignJWT } from 'jose';
import { SourceVersionTooLargeError } from '@abapify/adt-client';
import { createRestBearerAuthorizer } from '../src/rest-auth.js';
import { startAdtServer } from '../src/server.js';
import { createRestSourceCapabilityService } from '../src/source-capabilities.js';

const operations = {
  async listDestinations() {
    return [];
  },
  async listTransports() {
    return [];
  },
  async searchPackages() {
    return [];
  },
  async searchObjects() {
    return [];
  },
};

test('mounts signed MCP only at /mcp while preserving REST endpoints', async () => {
  const { privateKey, publicKey } = await generateKeyPair('ES256');
  const destinationRegistry = createDestinationContextRegistry({
    leaseProvider: {
      async acquire({ destination }) {
        return {
          destination,
          expiresAt: Date.now() + 60_000,
          version: 1,
          material: {},
          release: async () => undefined,
        };
      },
    },
    contextFactory: {
      async create() {
        return { client: {} as never, close: async () => undefined };
      },
    },
    ttlMs: 0,
  });
  const shutdown = destinationRegistry.shutdown.bind(destinationRegistry);
  let registryShutdowns = 0;
  destinationRegistry.shutdown = async () => {
    registryShutdowns++;
    await shutdown();
  };
  const now = Math.floor(Date.now() / 1_000);
  const credential = await new SignJWT({
    v: 1,
    kid: 'mount-test-key',
    principal: 'mount-test-user',
    agentId: 'system-assistant',
    classes: ['server', 'read'],
    destinationKeys: ['dev'],
    correlationId: 'mount-test-correlation',
    constraint: { systemSid: 'DEV' },
    limits: {},
  })
    .setProtectedHeader({ alg: 'ES256', kid: 'mount-test-key', typ: 'JWT' })
    .setIssuer('adt-api')
    .setAudience('adt-server-mcp')
    .setIssuedAt(now)
    .setNotBefore(now)
    .setExpirationTime(now + 60)
    .setJti('mount-test-jti')
    .sign(privateKey);
  const server = await startAdtServer({
    operations,
    host: '127.0.0.1',
    port: 0,
    mcp: {
      invocationVerifier: createMcpInvocationVerifier({
        publicKey,
        keyId: 'mount-test-key',
        issuer: 'adt-api',
        audience: 'adt-server-mcp',
      }),
      destinationRegistry,
      allowedHosts: ['adt-server'],
    },
  });
  const transport = new StreamableHTTPClientTransport(
    new URL(`${server.url}/mcp`),
    {
      requestInit: { headers: { Authorization: `Bearer ${credential}` } },
    },
  );
  const client = new Client({
    name: 'adt-server-mount-test',
    version: '0.0.1',
  });

  try {
    await client.connect(transport);
    assert.ok(
      (await client.listTools()).tools.some(
        (tool) => tool.name === 'system_info',
      ),
    );

    const ready = await fetch(`${server.url}/readyz`);
    assert.strictEqual(ready.status, 200);
    assert.deepStrictEqual(await ready.json(), { status: 'ready' });
  } finally {
    await transport.close();
    await server.close();
  }
  assert.strictEqual(registryShutdowns, 1);
});

test('keeps MCP unavailable when no guarded handler is configured', async () => {
  const server = await startAdtServer({
    operations,
    host: '127.0.0.1',
    port: 0,
  });

  try {
    const response = await fetch(`${server.url}/mcp`);
    assert.strictEqual(response.status, 404);
  } finally {
    await server.close();
  }
});

test('keeps broker-backed REST routes disabled until S2S authentication is configured', async () => {
  let destinationReads = 0;
  const server = await startAdtServer({
    operations: {
      ...operations,
      async listDestinations() {
        destinationReads++;
        return [];
      },
    },
    host: '127.0.0.1',
    port: 0,
  });

  try {
    const response = await fetch(`${server.url}/v1/destinations`);
    assert.strictEqual(response.status, 404);
    assert.strictEqual(destinationReads, 0);
  } finally {
    await server.close();
  }
});

test('rejects unauthenticated REST calls before a broker-backed operation', async () => {
  let destinationReads = 0;
  const server = await startAdtServer({
    operations: {
      ...operations,
      async listDestinations() {
        destinationReads++;
        return [];
      },
    },
    host: '127.0.0.1',
    port: 0,
    restAuthorizer: {
      async authorize() {
        return false;
      },
    },
  });

  try {
    const response = await fetch(`${server.url}/v1/destinations`);
    assert.strictEqual(response.status, 401);
    assert.strictEqual(destinationReads, 0);
  } finally {
    await server.close();
  }
});

test('allows a trusted S2S REST request to reach the broker-backed operation', async () => {
  let destinationReads = 0;
  let authorizationHeaders: string | undefined;
  const server = await startAdtServer({
    operations: {
      ...operations,
      async listDestinations() {
        destinationReads++;
        return [];
      },
    },
    host: '127.0.0.1',
    port: 0,
    restAuthorizer: {
      async authorize(request) {
        authorizationHeaders = request.headers.authorization;
        return authorizationHeaders === 'Mesh trusted-service';
      },
    },
  });

  try {
    const response = await fetch(`${server.url}/v1/destinations`, {
      headers: { authorization: 'Mesh trusted-service' },
    });
    assert.strictEqual(response.status, 200);
    assert.strictEqual(destinationReads, 1);
  } finally {
    await server.close();
  }
});

test('accepts only the separately mounted REST bearer token', async () => {
  let destinationReads = 0;
  const server = await startAdtServer({
    operations: {
      ...operations,
      async listDestinations() {
        destinationReads++;
        return [];
      },
    },
    host: '127.0.0.1',
    port: 0,
    restAuthorizer: createRestBearerAuthorizer('local-rest-token'),
  });

  try {
    for (const authorization of [undefined, 'Bearer wrong-token']) {
      const response = await fetch(`${server.url}/v1/destinations`, {
        headers: authorization ? { authorization } : undefined,
      });
      assert.strictEqual(response.status, 401);
    }

    const response = await fetch(`${server.url}/v1/destinations`, {
      headers: { authorization: 'Bearer local-rest-token' },
    });
    assert.strictEqual(response.status, 200);
    assert.strictEqual(destinationReads, 1);
  } finally {
    await server.close();
  }
});

test('forwards validated transport search criteria only after REST authentication', async () => {
  let captured: unknown;
  const server = await startAdtServer({
    operations: {
      ...operations,
      async listTransports(destination, criteria) {
        captured = { destination, criteria };
        return [];
      },
    },
    host: '127.0.0.1',
    port: 0,
    restAuthorizer: {
      async authorize() {
        return true;
      },
    },
  });

  try {
    const response = await fetch(
      `${server.url}/v1/destinations/dev/transports?owner=alice&status=modifiable&includeTasks=false`,
    );
    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(captured, {
      destination: 'dev',
      criteria: {
        owner: 'alice',
        status: 'modifiable',
        includeTasks: false,
      },
    });

    const invalid = await fetch(
      `${server.url}/v1/destinations/dev/transports?includeTasks=invalid`,
    );
    assert.strictEqual(invalid.status, 400);
  } finally {
    await server.close();
  }
});

test('serves canonical transport detail and aggregated objects without SAP URI fields', async () => {
  const calls: Array<{
    operation: string;
    destination: string;
    transport: string;
  }> = [];
  const detail = {
    trkorr: 'DEVK900001',
    owner: 'ALICE',
    description: 'Safe refactor',
    status: 'modifiable',
    tasks: [
      {
        trkorr: 'DEVK900002',
        parentTrkorr: 'DEVK900001',
        owner: 'ALICE',
        description: 'Implementation task',
        status: 'modifiable',
        objects: [
          {
            canonicalKey: 'CLAS:ZCL_SAFE',
            objectType: 'CLAS',
            objectName: 'ZCL_SAFE',
            pgmid: 'R3TR',
          },
        ],
      },
    ],
    objects: [
      {
        canonicalKey: 'INTF:ZIF_SAFE',
        objectType: 'INTF',
        objectName: 'ZIF_SAFE',
      },
    ],
  };
  const server = await startAdtServer({
    operations: {
      ...operations,
      async getTransportDetail(destination, transport) {
        calls.push({ operation: 'detail', destination, transport });
        return detail;
      },
      async listTransportObjects(destination, transport) {
        calls.push({ operation: 'objects', destination, transport });
        return [
          ...detail.objects,
          ...detail.tasks.flatMap((task) => task.objects),
        ];
      },
    },
    host: '127.0.0.1',
    port: 0,
    restAuthorizer: {
      async authorize() {
        return true;
      },
    },
  });

  try {
    const detailResponse = await fetch(
      `${server.url}/v1/destinations/dev/transports/DEVK900001`,
    );
    assert.strictEqual(detailResponse.status, 200);
    const detailBody = await detailResponse.json();
    assert.deepStrictEqual(detailBody, detail);
    assert.ok(!JSON.stringify(detailBody).includes('uri'));

    const objectsResponse = await fetch(
      `${server.url}/v1/destinations/dev/transports/DEVK900001/objects`,
    );
    assert.strictEqual(objectsResponse.status, 200);
    const objectsBody = await objectsResponse.json();
    assert.deepStrictEqual(objectsBody, [
      ...detail.objects,
      ...detail.tasks.flatMap((task) => task.objects),
    ]);
    assert.ok(!JSON.stringify(objectsBody).includes('uri'));
    assert.deepStrictEqual(calls, [
      { operation: 'detail', destination: 'dev', transport: 'DEVK900001' },
      { operation: 'objects', destination: 'dev', transport: 'DEVK900001' },
    ]);
  } finally {
    await server.close();
  }
});

test('serves a bounded canonical package page with an opaque query-bound cursor', async () => {
  const calls: unknown[] = [];
  const server = await startAdtServer({
    operations: {
      ...operations,
      async searchPackages(destination, criteria) {
        calls.push({ destination, criteria });
        return {
          data: [
            { name: 'ZALPHA', description: 'Alpha' },
            { name: 'ZBETA', parent: 'ZROOT', description: 'Beta' },
          ],
          truncated: true,
        };
      },
    },
    host: '127.0.0.1',
    port: 0,
    restAuthorizer: {
      async authorize() {
        return true;
      },
    },
  });

  try {
    const first = await fetch(
      `${server.url}/v1/destinations/dev/packages?q=z&maxResults=10&limit=1`,
    );
    assert.strictEqual(first.status, 200);
    const firstBody = (await first.json()) as {
      data: unknown[];
      nextCursor: string | null;
      truncated: boolean;
      observedAt: string;
    };
    assert.deepStrictEqual(firstBody.data, [
      { name: 'ZALPHA', description: 'Alpha' },
    ]);
    assert.ok(firstBody.nextCursor);
    assert.strictEqual(firstBody.truncated, true);
    assert.ok(firstBody.observedAt.endsWith('Z'));
    assert.ok(!JSON.stringify(firstBody).includes('uri'));

    const second = await fetch(
      `${server.url}/v1/destinations/dev/packages?q=z&maxResults=10&limit=1&cursor=${encodeURIComponent(firstBody.nextCursor!)}`,
    );
    assert.strictEqual(second.status, 200);
    assert.deepStrictEqual((await second.json()).data, [
      { name: 'ZBETA', parent: 'ZROOT', description: 'Beta' },
    ]);
    assert.deepStrictEqual(calls, [
      { destination: 'dev', criteria: { q: 'z', maxResults: 10 } },
      { destination: 'dev', criteria: { q: 'z', maxResults: 10 } },
    ]);

    const invalid = await fetch(
      `${server.url}/v1/destinations/dev/packages?cursor=invalid`,
    );
    assert.strictEqual(invalid.status, 400);
  } finally {
    await server.close();
  }
});

test('serves a bounded canonical object page with a query-bound cursor and no ADT URI', async () => {
  const calls: unknown[] = [];
  const server = await startAdtServer({
    operations: {
      ...operations,
      async searchObjects(destination, criteria) {
        calls.push({ destination, criteria });
        return {
          data: [
            {
              canonicalKey: 'CLAS:ZCL_ALPHA',
              objectType: 'CLAS',
              objectName: 'ZCL_ALPHA',
              packageName: 'ZPKG',
              description: 'Alpha object',
            },
            {
              canonicalKey: 'INTF:ZIF_BETA',
              objectType: 'INTF',
              objectName: 'ZIF_BETA',
              packageName: 'ZPKG',
            },
          ],
          truncated: true,
        };
      },
    },
    host: '127.0.0.1',
    port: 0,
    restAuthorizer: {
      async authorize() {
        return true;
      },
    },
  });

  try {
    const first = await fetch(
      `${server.url}/v1/destinations/dev/objects?query=zcl&packageName=ZPKG&objectType=CLAS&maxResults=10&limit=1`,
    );
    assert.strictEqual(first.status, 200);
    const firstBody = (await first.json()) as {
      data: unknown[];
      nextCursor: string | null;
      truncated: boolean;
    };
    assert.deepStrictEqual(firstBody.data, [
      {
        canonicalKey: 'CLAS:ZCL_ALPHA',
        objectType: 'CLAS',
        objectName: 'ZCL_ALPHA',
        packageName: 'ZPKG',
        description: 'Alpha object',
      },
    ]);
    assert.ok(firstBody.nextCursor);
    assert.strictEqual(firstBody.truncated, true);
    assert.ok(!JSON.stringify(firstBody).includes('uri'));

    const second = await fetch(
      `${server.url}/v1/destinations/dev/objects?query=zcl&packageName=ZPKG&objectType=CLAS&maxResults=10&limit=1&cursor=${encodeURIComponent(firstBody.nextCursor!)}`,
    );
    assert.strictEqual(second.status, 200);
    assert.deepStrictEqual((await second.json()).data, [
      {
        canonicalKey: 'INTF:ZIF_BETA',
        objectType: 'INTF',
        objectName: 'ZIF_BETA',
        packageName: 'ZPKG',
      },
    ]);
    assert.deepStrictEqual(calls, [
      {
        destination: 'dev',
        criteria: {
          query: 'zcl',
          packageName: 'ZPKG',
          objectType: 'CLAS',
          maxResults: 10,
        },
      },
      {
        destination: 'dev',
        criteria: {
          query: 'zcl',
          packageName: 'ZPKG',
          objectType: 'CLAS',
          maxResults: 10,
        },
      },
    ]);

    const mismatched = await fetch(
      `${server.url}/v1/destinations/dev/objects?query=other&packageName=ZPKG&objectType=CLAS&maxResults=10&limit=1&cursor=${encodeURIComponent(firstBody.nextCursor!)}`,
    );
    assert.strictEqual(mismatched.status, 400);
  } finally {
    await server.close();
  }
});

test('REST source reads redeem an opaque destination-bound manifest capability', async () => {
  const sourceUri =
    '/sap/bc/adt/programs/programs/zsafe/source/main/versions/1';
  let immutableReads = 0;
  const server = await startAdtServer({
    operations: {
      ...operations,
      async buildTransportSourceManifest(destination, input) {
        assert.strictEqual(destination, 'dev');
        assert.deepStrictEqual(input, { transports: ['DEVK900001'] });
        return {
          requestedTransports: ['DEVK900001'],
          scopeTransports: ['DEVK900001'],
          entries: [
            {
              object: {
                pgmid: 'R3TR',
                type: 'CLAS',
                name: 'ZCL_SAFE',
              },
              component: {
                id: 'main',
                sourceUri: '/sap/bc/adt/oo/classes/zcl_safe/source/main',
                versionsUri:
                  '/sap/bc/adt/oo/classes/zcl_safe/source/main/versions',
              },
              sourceTransport: 'DEVK900001',
              changeKind: 'modified',
              exact: true,
              head: {
                id: 'version-1',
                ordinal: 0,
                sourceUri,
                transports: ['DEVK900001'],
              },
            },
          ],
        };
      },
      async readImmutableSource(input) {
        immutableReads++;
        if (input.maxBytes === 1) {
          throw new SourceVersionTooLargeError(1, 2);
        }
        assert.deepStrictEqual(input, {
          destination: 'dev',
          sourceUri,
          maxBytes: 128,
        });
        return {
          bytes: Buffer.byteLength('CLASS zcl_safe DEFINITION.', 'utf8'),
          source: 'CLASS zcl_safe DEFINITION.',
        };
      },
    },
    host: '127.0.0.1',
    port: 0,
    restAuthorizer: {
      async authorize() {
        return true;
      },
    },
    sourceCapabilities: createRestSourceCapabilityService({
      secret: 'test-secret',
    }),
  });

  try {
    const manifestResponse = await fetch(
      `${server.url}/v1/destinations/dev/transport-source-manifests`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ transports: ['DEVK900001'] }),
      },
    );
    assert.strictEqual(manifestResponse.status, 200);
    const manifest = (await manifestResponse.json()) as {
      entries: Array<{ head?: { sourceCapability?: string } }>;
    };
    const encodedManifest = JSON.stringify(manifest);
    assert.ok(!encodedManifest.includes('/sap/bc/adt/'));
    const sourceCapability = manifest.entries[0]?.head?.sourceCapability;
    assert.ok(sourceCapability);

    const readResponse = await fetch(
      `${server.url}/v1/destinations/dev/source-versions:read`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sourceCapability, maxBytes: 128 }),
      },
    );
    assert.strictEqual(readResponse.status, 200);
    assert.deepStrictEqual(await readResponse.json(), {
      bytes: Buffer.byteLength('CLASS zcl_safe DEFINITION.', 'utf8'),
      source: 'CLASS zcl_safe DEFINITION.',
    });

    const crossDestinationResponse = await fetch(
      `${server.url}/v1/destinations/prod/source-versions:read`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sourceCapability, maxBytes: 128 }),
      },
    );
    assert.strictEqual(crossDestinationResponse.status, 404);
    assert.strictEqual(immutableReads, 1);

    const tooLargeResponse = await fetch(
      `${server.url}/v1/destinations/dev/source-versions:read`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sourceCapability, maxBytes: 1 }),
      },
    );
    assert.strictEqual(tooLargeResponse.status, 413);
    assert.ok(
      !JSON.stringify(await tooLargeResponse.json()).includes(sourceUri),
    );
    assert.strictEqual(immutableReads, 2);
  } finally {
    await server.close();
  }
});
