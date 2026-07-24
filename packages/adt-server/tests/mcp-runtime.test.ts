import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { SignJWT } from 'jose';
import {
  createAdtServerMcpOptions,
  createSafeExecuteGrantConsumer,
} from '../src/mcp-runtime.js';

const brokerOptions = {
  baseUrl: 'http://adt-api.internal',
  tokenFile: '/run/secrets/adt-server-broker-token',
};

test('leaves MCP disabled when every invocation setting is absent', async () => {
  const options = await createAdtServerMcpOptions({
    env: {},
    brokerOptions,
  });

  assert.strictEqual(options, undefined);
});

test('rejects partial MCP invocation configuration before serving traffic', async () => {
  await assert.rejects(
    createAdtServerMcpOptions({
      env: {
        ADT_SERVER_MCP_PUBLIC_KEY_FILE: '/run/secrets/adt-server-mcp-public',
      },
      brokerOptions,
    }),
    /must be configured together/i,
  );
});

test('accepts a dedicated P-256 public key without accepting a private key path', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'adt-server-mcp-'));
  const publicKeyPath = path.join(directory, 'public.pem');
  const { privateKey, publicKey } = generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
  });
  await writeFile(
    publicKeyPath,
    publicKey.export({ type: 'spki', format: 'pem' }),
    'utf8',
  );

  try {
    const options = await createAdtServerMcpOptions({
      env: {
        ADT_SERVER_MCP_PUBLIC_KEY_FILE: publicKeyPath,
        ADT_SERVER_MCP_KEY_ID: 'adt-mcp-test',
        ADT_SERVER_MCP_ISSUER: 'adt-api',
        ADT_SERVER_MCP_ALLOWED_HOSTS: 'adt-server,mastra',
      },
      brokerOptions,
    });

    assert.ok(options);
    assert.deepStrictEqual(options.allowedHosts, ['adt-server', 'mastra']);
    const now = Math.floor(Date.now() / 1_000);
    const credential = await new SignJWT({
      v: 1,
      kid: 'adt-mcp-test',
      principal: 'runtime-test-user',
      agentId: 'jess',
      classes: ['server', 'read'],
      destinationKeys: ['dev'],
      correlationId: 'runtime-test-correlation',
      constraint: {
        kind: 'jess-adt-v1',
        threadId: '11111111-1111-4111-8111-111111111111',
        executionId: '22222222-2222-4222-8222-222222222222',
        systemSid: 'DEV',
        objectKeys: ['CLAS:ZCL_RUNTIME_TEST'],
        toolNames: ['get_object'],
      },
      limits: { maxToolCalls: 1 },
    })
      .setProtectedHeader({ alg: 'ES256', kid: 'adt-mcp-test', typ: 'JWT' })
      .setIssuer('adt-api')
      .setAudience('adt-server-mcp')
      .setIssuedAt(now)
      .setNotBefore(now)
      .setExpirationTime(now + 60)
      .setJti('runtime-test-jti')
      .sign(privateKey);
    assert.equal(
      (await options.invocationVerifier.verify(`Bearer ${credential}`))
        ?.principal,
      'runtime-test-user',
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('safe_execute stays disabled without a hard-cancellable SAP runtime', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'adt-server-mcp-'));
  const publicKeyPath = path.join(directory, 'public.pem');
  const { publicKey } = generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
  });
  await writeFile(
    publicKeyPath,
    publicKey.export({ type: 'spki', format: 'pem' }),
    'utf8',
  );

  try {
    await assert.rejects(
      createAdtServerMcpOptions({
        env: {
          ADT_SERVER_MCP_PUBLIC_KEY_FILE: publicKeyPath,
          ADT_SERVER_MCP_KEY_ID: 'adt-mcp-test',
          ADT_SERVER_MCP_ISSUER: 'adt-api',
          ADT_SERVER_MCP_SAFE_EXECUTE_ENABLED: 'true',
        },
        brokerOptions,
      }),
      /hard-cancellable SAP runtime/i,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('consumes a grant through the authenticated ARM sidecar route without widening the body', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'adt-server-mcp-'));
  const tokenFile = path.join(directory, 'sidecar-token');
  await writeFile(tokenFile, 'service-token\n', 'utf8');
  let observed:
    | {
        url: string;
        method?: string;
        headers?: HeadersInit;
        body?: BodyInit | null;
      }
    | undefined;
  const consume = createSafeExecuteGrantConsumer({
    baseUrl: 'http://arm-api.internal',
    tokenFile,
    fetch: async (input, init) => {
      observed = {
        url: String(input),
        method: init?.method,
        headers: init?.headers,
        body: init?.body,
      };
      return new Response(null, { status: 204 });
    },
  });

  try {
    const allowed = await consume({
      grantJti: '33333333-3333-4333-8333-333333333333',
      opaqueGrant: 'header.payload.signature',
      principal: 'engineer@arm',
      threadId: '11111111-1111-4111-8111-111111111111',
      executionId: '22222222-2222-4222-8222-222222222222',
      systemSid: 'TST',
      objectKeys: ['CLAS:ZCL_RELEASE_GATE'],
      destination: 'tst-adt',
      operationId: 'atc_run',
      policy: {
        operationId: 'atc_run',
        check: 'atc',
        maxDurationMs: 30_000,
        maxResultBytes: 262_144,
        maxFindings: 500,
        maxObjects: 20,
        maxPackages: 5,
        maxVariants: 1,
      },
    });

    assert.strictEqual(allowed, true);
    assert.strictEqual(
      observed?.url,
      'http://arm-api.internal/internal/adt-server/jess-safe-execute-grants/33333333-3333-4333-8333-333333333333/consume',
    );
    assert.strictEqual(observed?.method, 'POST');
    assert.deepStrictEqual(observed?.headers, {
      'content-type': 'application/json',
      'x-adt-server-token': 'service-token',
    });
    assert.strictEqual(
      observed?.body,
      JSON.stringify({ opaqueGrant: 'header.payload.signature' }),
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('rejects a non-P-256 public key before it can enable MCP', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'adt-server-mcp-'));
  const publicKeyPath = path.join(directory, 'public.pem');
  const { publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  await writeFile(
    publicKeyPath,
    publicKey.export({ type: 'spki', format: 'pem' }),
    'utf8',
  );

  try {
    await assert.rejects(
      createAdtServerMcpOptions({
        env: {
          ADT_SERVER_MCP_PUBLIC_KEY_FILE: publicKeyPath,
          ADT_SERVER_MCP_KEY_ID: 'adt-mcp-test',
          ADT_SERVER_MCP_ISSUER: 'adt-api',
        },
        brokerOptions,
      }),
      /P-256 public key/i,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('rejects private key material even when supplied through the public key setting', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'adt-server-mcp-'));
  const keyPath = path.join(directory, 'not-public.pem');
  const { privateKey } = generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
  });
  await writeFile(
    keyPath,
    privateKey.export({ type: 'pkcs8', format: 'pem' }),
    'utf8',
  );

  try {
    await assert.rejects(
      createAdtServerMcpOptions({
        env: {
          ADT_SERVER_MCP_PUBLIC_KEY_FILE: keyPath,
          ADT_SERVER_MCP_KEY_ID: 'adt-mcp-test',
          ADT_SERVER_MCP_ISSUER: 'adt-api',
        },
        brokerOptions,
      }),
      /must contain only public key material/i,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
