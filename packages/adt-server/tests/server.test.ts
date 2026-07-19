import assert from 'node:assert/strict';
import test from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {
  createDestinationContextRegistry,
  createMcpInvocationVerifier,
} from '../../adt-mcp/src/index.ts';
import { generateKeyPair, SignJWT } from 'jose';
import { startAdtServer } from '../src/server.js';

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
