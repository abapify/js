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
import { createRestAtcDocumentationCapabilityService } from '../src/atc-documentation-capabilities.js';

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

test('serves canonical object metadata without exposing a raw ADT URI or href', async () => {
  const calls: unknown[] = [];
  const server = await startAdtServer({
    operations: {
      ...operations,
      async getObjectMetadata(destination, objectType, objectName) {
        calls.push({ destination, objectType, objectName });
        return {
          object: {
            canonicalKey: 'CLAS:ZCL_SAFE',
            objectType: 'CLAS',
            objectName: 'ZCL_SAFE',
            packageName: 'ZPKG',
            description: 'Safe class',
          },
          metadata: {
            adtObjectType: 'CLAS',
            packageName: 'ZPKG',
            description: 'Safe class',
          },
          facets: [
            {
              facet: 'package',
              name: 'ZPKG',
              displayName: 'Package',
            },
          ],
          capabilities: [
            {
              relation: 'http://www.sap.com/adt/relations/versions',
              capability: 'versions',
              title: 'Version history',
            },
          ],
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
    const response = await fetch(
      `${server.url}/v1/destinations/dev/objects/CLAS/ZCL_SAFE`,
    );
    assert.strictEqual(response.status, 200);
    const body = await response.json();
    assert.deepStrictEqual(body, {
      object: {
        canonicalKey: 'CLAS:ZCL_SAFE',
        objectType: 'CLAS',
        objectName: 'ZCL_SAFE',
        packageName: 'ZPKG',
        description: 'Safe class',
      },
      metadata: {
        adtObjectType: 'CLAS',
        packageName: 'ZPKG',
        description: 'Safe class',
      },
      facets: [
        {
          facet: 'package',
          name: 'ZPKG',
          displayName: 'Package',
        },
      ],
      capabilities: [
        {
          relation: 'http://www.sap.com/adt/relations/versions',
          capability: 'versions',
          title: 'Version history',
        },
      ],
    });
    assert.deepStrictEqual(calls, [
      { destination: 'dev', objectType: 'CLAS', objectName: 'ZCL_SAFE' },
    ]);
    assert.ok(!JSON.stringify(body).includes('uri'));
    assert.ok(!JSON.stringify(body).includes('href'));

    const invalid = await fetch(
      `${server.url}/v1/destinations/dev/objects/CLAS/ZCL_SAFE?unexpected=true`,
    );
    assert.strictEqual(invalid.status, 400);
  } finally {
    await server.close();
  }
});

test('serves metadata-only canonical object source history without ADT URIs', async () => {
  const calls: unknown[] = [];
  const server = await startAdtServer({
    operations: {
      ...operations,
      async getObjectSourceHistory(destination, objectType, objectName) {
        calls.push({ destination, objectType, objectName });
        return {
          available: true,
          versions: [
            {
              id: 'version-2',
              ordinal: 0,
              title: 'Latest change',
              author: 'ALICE',
              transports: ['DEVK900001'],
            },
          ],
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
    const response = await fetch(
      `${server.url}/v1/destinations/dev/objects/CLAS/ZCL_SAFE/source-history`,
    );
    assert.strictEqual(response.status, 200);
    const body = await response.json();
    assert.deepStrictEqual(body, {
      available: true,
      versions: [
        {
          id: 'version-2',
          ordinal: 0,
          title: 'Latest change',
          author: 'ALICE',
          transports: ['DEVK900001'],
        },
      ],
    });
    assert.deepStrictEqual(calls, [
      { destination: 'dev', objectType: 'CLAS', objectName: 'ZCL_SAFE' },
    ]);
    assert.ok(!JSON.stringify(body).includes('uri'));
    assert.ok(!JSON.stringify(body).includes('href'));

    const invalid = await fetch(
      `${server.url}/v1/destinations/dev/objects/CLAS/ZCL_SAFE/source-history?unexpected=true`,
    );
    assert.strictEqual(invalid.status, 400);
  } finally {
    await server.close();
  }
});

test('reads bounded canonical object source without accepting a SAP URI', async () => {
  const calls: unknown[] = [];
  const server = await startAdtServer({
    operations: {
      ...operations,
      async readObjectSource(input) {
        calls.push(input);
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
  });

  try {
    const response = await fetch(
      `${server.url}/v1/destinations/dev/objects/CLAS/ZCL_SAFE/source:read`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ version: 'inactive' }),
      },
    );
    assert.strictEqual(response.status, 200);
    const body = await response.json();
    assert.deepStrictEqual(body, {
      bytes: Buffer.byteLength('CLASS zcl_safe DEFINITION.', 'utf8'),
      source: 'CLASS zcl_safe DEFINITION.',
    });
    assert.deepStrictEqual(calls, [
      {
        destination: 'dev',
        objectType: 'CLAS',
        objectName: 'ZCL_SAFE',
        version: 'inactive',
      },
    ]);
    assert.ok(!JSON.stringify(body).includes('uri'));
    assert.ok(!JSON.stringify(body).includes('href'));

    const invalid = await fetch(
      `${server.url}/v1/destinations/dev/objects/CLAS/ZCL_SAFE/source:read`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sourceUri: '/sap/bc/adt/unsafe' }),
      },
    );
    assert.strictEqual(invalid.status, 400);
  } finally {
    await server.close();
  }
});

test('rejects an oversized canonical object source without a partial body', async () => {
  const server = await startAdtServer({
    operations: {
      ...operations,
      async readObjectSource() {
        throw new SourceVersionTooLargeError(2 * 1024 * 1024);
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
      `${server.url}/v1/destinations/dev/objects/CLAS/ZCL_SAFE/source:read`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}',
      },
    );
    assert.strictEqual(response.status, 413);
    const body = await response.json();
    assert.deepStrictEqual(body, { title: 'Source too large', status: 413 });
    assert.ok(!JSON.stringify(body).includes('source'));
  } finally {
    await server.close();
  }
});

test('runs ATC only from a canonical scope and returns an opaque documentation capability', async () => {
  const calls: unknown[] = [];
  const server = await startAdtServer({
    operations: {
      ...operations,
      async runAtc(input: unknown) {
        calls.push(input);
        return {
          checkVariant: 'DEFAULT',
          findings: [
            {
              checkId: 'SCI',
              checkTitle: 'Safe check',
              messageText: 'Avoid unsafe access',
              priority: 2,
              objectType: 'CLAS',
              objectName: 'ZCL_SAFE',
              lineStart: 12,
              lineEnd: 12,
              documentationUri:
                '/sap/bc/adt/documentation/atc/documents/itemid/ABC/index/1',
              objectUri: '/sap/bc/adt/oo/classes/zcl_safe',
              location: '/sap/bc/adt/oo/classes/zcl_safe/source/main?start=12',
              findingId: '/sap/bc/adt/atc/findings/itemid/ABC/index/1',
            },
          ],
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
    const response = await fetch(`${server.url}/v1/destinations/dev/atc-runs`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        scope: {
          kind: 'objects',
          objects: [{ objectType: 'CLAS', objectName: 'ZCL_SAFE' }],
        },
      }),
    });

    assert.strictEqual(response.status, 200);
    const body = await response.json();
    assert.deepStrictEqual(calls, [
      {
        destination: 'dev',
        scope: {
          kind: 'objects',
          objects: [{ objectType: 'CLAS', objectName: 'ZCL_SAFE' }],
        },
      },
    ]);
    assert.strictEqual(body.checkVariant, 'DEFAULT');
    assert.deepStrictEqual(body.findings[0], {
      checkId: 'SCI',
      checkTitle: 'Safe check',
      messageText: 'Avoid unsafe access',
      priority: 2,
      objectType: 'CLAS',
      objectName: 'ZCL_SAFE',
      lineStart: 12,
      lineEnd: 12,
      documentationCapability: body.findings[0].documentationCapability,
    });
    assert.match(body.findings[0].documentationCapability, /^atcdoc\.v1\./u);
    assert.ok(!JSON.stringify(body).includes('/sap/bc/adt/'));
  } finally {
    await server.close();
  }
});

test('reads ATC documentation only through a destination-scoped opaque capability', async () => {
  const capabilities = createRestAtcDocumentationCapabilityService({
    secret: 'test-documentation-capability-secret',
  });
  const calls: unknown[] = [];
  const server = await startAdtServer({
    operations: {
      ...operations,
      async readAtcFindingDocumentation(input: unknown) {
        calls.push(input);
        return {
          bytes: Buffer.byteLength('<p>Use a safe API.</p>', 'utf8'),
          html: '<p>Use a safe API.</p>',
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
    atcDocumentationCapabilities: capabilities,
  });
  const documentationCapability = capabilities.issue({
    destination: 'dev',
    documentationUri:
      '/sap/bc/adt/documentation/atc/documents/itemid/ABC/index/1',
  });

  try {
    const response = await fetch(
      `${server.url}/v1/destinations/dev/atc-finding-documentation:read`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ documentationCapability }),
      },
    );

    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(await response.json(), {
      bytes: Buffer.byteLength('<p>Use a safe API.</p>', 'utf8'),
      html: '<p>Use a safe API.</p>',
    });
    assert.deepStrictEqual(calls, [
      {
        destination: 'dev',
        documentationUri:
          '/sap/bc/adt/documentation/atc/documents/itemid/ABC/index/1',
        maxBytes: 1024 * 1024,
      },
    ]);
    assert.ok(!JSON.stringify(calls).includes(documentationCapability));
  } finally {
    await server.close();
  }
});

test('serves direct package objects as a bounded canonical page without ADT URIs', async () => {
  const calls: unknown[] = [];
  const server = await startAdtServer({
    operations: {
      ...operations,
      async listPackageObjects(destination, packageName) {
        calls.push({ destination, packageName });
        return {
          data: [
            {
              canonicalKey: 'CLAS:ZCL_ALPHA',
              objectType: 'CLAS',
              objectName: 'ZCL_ALPHA',
              packageName,
              description: 'Alpha object',
            },
            {
              canonicalKey: 'INTF:ZIF_BETA',
              objectType: 'INTF',
              objectName: 'ZIF_BETA',
              packageName,
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
      `${server.url}/v1/destinations/dev/packages/Z%20FI%2FCO/objects?limit=1`,
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
        packageName: 'Z FI/CO',
        description: 'Alpha object',
      },
    ]);
    assert.ok(firstBody.nextCursor);
    assert.strictEqual(firstBody.truncated, true);
    assert.ok(!JSON.stringify(firstBody).includes('uri'));

    const second = await fetch(
      `${server.url}/v1/destinations/dev/packages/Z%20FI%2FCO/objects?limit=1&cursor=${encodeURIComponent(firstBody.nextCursor!)}`,
    );
    assert.strictEqual(second.status, 200);
    assert.deepStrictEqual((await second.json()).data, [
      {
        canonicalKey: 'INTF:ZIF_BETA',
        objectType: 'INTF',
        objectName: 'ZIF_BETA',
        packageName: 'Z FI/CO',
      },
    ]);
    assert.deepStrictEqual(calls, [
      { destination: 'dev', packageName: 'Z FI/CO' },
      { destination: 'dev', packageName: 'Z FI/CO' },
    ]);

    const mismatched = await fetch(
      `${server.url}/v1/destinations/dev/packages/ZOTHER/objects?limit=1&cursor=${encodeURIComponent(firstBody.nextCursor!)}`,
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
