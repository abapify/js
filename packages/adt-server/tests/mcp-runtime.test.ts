import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { SignJWT } from 'jose';
import { createAdtServerMcpOptions } from '../src/mcp-runtime.js';

const brokerOptions = {
  baseUrl: 'http://arm-api.internal',
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
        ADT_SERVER_MCP_KEY_ID: 'arm-mcp-test',
        ADT_SERVER_MCP_ISSUER: 'arm-api',
        ADT_SERVER_MCP_ALLOWED_HOSTS: 'adt-server,mastra',
      },
      brokerOptions,
    });

    assert.ok(options);
    assert.deepStrictEqual(options.allowedHosts, ['adt-server', 'mastra']);
    const now = Math.floor(Date.now() / 1_000);
    const credential = await new SignJWT({
      v: 1,
      kid: 'arm-mcp-test',
      principal: 'runtime-test-user',
      agentId: 'system-assistant',
      classes: ['server', 'read'],
      destinationKeys: ['dev'],
      correlationId: 'runtime-test-correlation',
      constraint: { systemSid: 'DEV' },
      limits: {},
    })
      .setProtectedHeader({ alg: 'ES256', kid: 'arm-mcp-test', typ: 'JWT' })
      .setIssuer('arm-api')
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
          ADT_SERVER_MCP_KEY_ID: 'arm-mcp-test',
          ADT_SERVER_MCP_ISSUER: 'arm-api',
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
          ADT_SERVER_MCP_KEY_ID: 'arm-mcp-test',
          ADT_SERVER_MCP_ISSUER: 'arm-api',
        },
        brokerOptions,
      }),
      /must contain only public key material/i,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
