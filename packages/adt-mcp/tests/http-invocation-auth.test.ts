/**
 * Integration tests for ADT invocation authentication on the MCP HTTP
 * transport. These prove that only verified claims become session identity
 * and scope, and that a session cannot be continued with another JTI.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { generateKeyPair, SignJWT, type CryptoKey } from 'jose';
import { createMcpInvocationVerifier } from '../src/lib/http/invocation.js';
import {
  createHttpMcpHandler,
  startHttpServer,
} from '../src/lib/http/server.js';
import { createDestinationContextRegistry } from '../src/lib/session/destination-registry.js';

const issuer = 'adt-api';
const audience = 'adt-server-mcp';
const keyId = 'adt-mcp-integration-test';

async function signInvocation(
  privateKey: CryptoKey,
  overrides: {
    tokenId?: string;
    classes?: string[];
    destinationKeys?: string[];
    agentId?: 'ai-review' | 'system-assistant';
  } = {},
): Promise<string> {
  const now = Math.floor(Date.now() / 1_000);
  return await new SignJWT({
    v: 1,
    kid: keyId,
    principal: 'petr.plenkov',
    agentId: overrides.agentId ?? 'system-assistant',
    classes: overrides.classes ?? ['server', 'read'],
    destinationKeys: overrides.destinationKeys ?? ['dev'],
    correlationId: 'correlation-http-invocation',
    constraint:
      overrides.agentId === 'ai-review'
        ? {
            reviewId: 'review-1',
            runId: 'run-1',
            frozenCanonicalKeys: ['CLAS:ZCL_SCOPE_TEST'],
          }
        : { systemSid: 'DEV' },
    limits: {},
  })
    .setProtectedHeader({ alg: 'ES256', kid: keyId, typ: 'JWT' })
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt(now)
    .setNotBefore(now)
    .setExpirationTime(now + 60)
    .setJti(overrides.tokenId ?? 'invocation-jti-1')
    .sign(privateKey);
}

test('ADT invocation auth snapshots verified read scope and binds continuation to its JTI', async () => {
  const { privateKey, publicKey } = await generateKeyPair('ES256');
  let leases = 0;
  let contexts = 0;
  const destinationRegistry = createDestinationContextRegistry({
    leaseProvider: {
      async acquire({ destination }) {
        leases++;
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
        contexts++;
        return { client: {} as never, close: async () => undefined };
      },
    },
    ttlMs: 0,
  });
  const verifier = createMcpInvocationVerifier({
    publicKey,
    keyId,
    issuer,
    audience,
  });
  const server = await startHttpServer({
    port: 0,
    host: '127.0.0.1',
    authMode: 'invocation',
    invocationVerifier: verifier,
    multiSystem: { systems: {}, resolve: () => undefined },
    destinationServer: {
      destinationRegistry,
      requestIdentity: () => ({
        principal: 'untrusted-callback-principal',
        agentId: 'untrusted-callback-agent',
      }),
      requestAccess: () => ({
        classes: ['write'],
        destinationKeys: ['prod'],
      }),
    },
    log: () => undefined,
  });
  const credential = await signInvocation(privateKey);
  const transport = new StreamableHTTPClientTransport(new URL(server.url), {
    requestInit: { headers: { Authorization: `Bearer ${credential}` } },
  });
  const client = new Client({ name: 'invocation-auth-test', version: '0.0.1' });

  try {
    await client.connect(transport);
    assert.ok(transport.sessionId);

    const tools = await client.listTools();
    assert.ok(tools.tools.some((tool) => tool.name === 'system_info'));
    assert.ok(!tools.tools.some((tool) => tool.name === 'lock_object'));

    const denied = await client.callTool({
      name: 'lock_object',
      arguments: { destination: 'dev', objectName: 'ZCL_SCOPE_TEST' },
    });
    assert.strictEqual(denied.isError, true);
    assert.strictEqual(
      (denied.content as Array<{ type: 'text'; text: string }>)[0]?.text,
      'mcp_scope_denied',
    );
    assert.strictEqual(leases, 0);
    assert.strictEqual(contexts, 0);

    const replacementCredential = await signInvocation(privateKey, {
      tokenId: 'invocation-jti-2',
    });
    const replacementResponse = await fetch(server.url, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/event-stream',
        Authorization: `Bearer ${replacementCredential}`,
        'Content-Type': 'application/json',
        'Mcp-Session-Id': transport.sessionId,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'system_info',
          arguments: { destination: 'dev' },
        },
      }),
    });
    assert.strictEqual(replacementResponse.status, 403);
    assert.deepStrictEqual(await replacementResponse.json(), {
      jsonrpc: '2.0',
      error: { code: -32000, message: 'mcp_session_identity_mismatch' },
      id: null,
    });
    assert.strictEqual(leases, 0);
    assert.strictEqual(contexts, 0);
  } finally {
    await transport.close();
    await server.close();
    await destinationRegistry.shutdown();
  }
});

test('ADT invocation auth fails closed for an AI Review policy the sidecar cannot yet enforce', async () => {
  const { privateKey, publicKey } = await generateKeyPair('ES256');
  let leases = 0;
  let contexts = 0;
  const destinationRegistry = createDestinationContextRegistry({
    leaseProvider: {
      async acquire({ destination }) {
        leases++;
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
        contexts++;
        return { client: {} as never, close: async () => undefined };
      },
    },
    ttlMs: 0,
  });
  const server = await startHttpServer({
    port: 0,
    host: '127.0.0.1',
    authMode: 'invocation',
    invocationVerifier: createMcpInvocationVerifier({
      publicKey,
      keyId,
      issuer,
      audience,
    }),
    multiSystem: { systems: {}, resolve: () => undefined },
    destinationServer: {
      destinationRegistry,
      requestIdentity: () => ({ principal: 'untrusted-callback-principal' }),
      requestAccess: () => ({ classes: ['read'], destinationKeys: ['dev'] }),
    },
    log: () => undefined,
  });
  const credential = await signInvocation(privateKey, { agentId: 'ai-review' });
  const transport = new StreamableHTTPClientTransport(new URL(server.url), {
    requestInit: { headers: { Authorization: `Bearer ${credential}` } },
  });
  const client = new Client({
    name: 'ai-review-policy-test',
    version: '0.0.1',
  });

  try {
    await client.connect(transport);
    assert.deepStrictEqual((await client.listTools()).tools, []);

    const denied = await client.callTool({
      name: 'system_info',
      arguments: { destination: 'dev' },
    });
    assert.strictEqual(denied.isError, true);
    assert.strictEqual(
      (denied.content as Array<{ type: 'text'; text: string }>)[0]?.text,
      'mcp_scope_denied',
    );
    assert.strictEqual(leases, 0);
    assert.strictEqual(contexts, 0);
  } finally {
    await transport.close();
    await server.close();
    await destinationRegistry.shutdown();
  }
});

test('ADT invocation auth rejects credentials that request write authority', async () => {
  const { privateKey, publicKey } = await generateKeyPair('ES256');
  const destinationRegistry = createDestinationContextRegistry({
    leaseProvider: {
      async acquire() {
        throw new Error('must not acquire for rejected credential');
      },
    },
    contextFactory: {
      async create() {
        throw new Error('must not create for rejected credential');
      },
    },
  });
  const server = await startHttpServer({
    port: 0,
    host: '127.0.0.1',
    authMode: 'invocation',
    invocationVerifier: createMcpInvocationVerifier({
      publicKey,
      keyId,
      issuer,
      audience,
    }),
    destinationServer: {
      destinationRegistry,
      requestIdentity: () => ({ principal: 'must-not-run' }),
      requestAccess: () => ({ classes: ['read'], destinationKeys: ['dev'] }),
    },
    multiSystem: { systems: {}, resolve: () => undefined },
    log: () => undefined,
  });

  try {
    const credential = await signInvocation(privateKey, {
      classes: ['read', 'write'],
    });
    const response = await fetch(server.url, {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/event-stream',
        Authorization: `Bearer ${credential}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
    });
    assert.strictEqual(response.status, 401);
  } finally {
    await server.close();
    await destinationRegistry.shutdown();
  }
});

test('ADT invocation mode requires a verifier and destination scope source', () => {
  assert.throws(
    () =>
      createHttpMcpHandler({
        authMode: 'invocation',
      }),
    /invocation.*verifier/u,
  );
  assert.throws(
    () =>
      createHttpMcpHandler({
        authMode: 'invocation',
        invocationVerifier: {
          async verify() {
            return undefined;
          },
        },
      }),
    /invocation.*destinationServer/u,
  );
});
