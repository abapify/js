import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { SignJWT } from 'jose';
import {
  createAdtServerMcpOptions,
  executeWithDeadlineAndAbort,
} from '../src/mcp-runtime.js';
import { createAdtAdapter } from '@abapify/adt-client';

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
      agentId: 'adt-execution',
      classes: ['server', 'read'],
      destinationKeys: ['dev'],
      correlationId: 'runtime-test-correlation',
      constraint: {
        kind: 'adt-execution-v1',
        scopeId: '11111111-1111-4111-8111-111111111111',
        executionId: '22222222-2222-4222-8222-222222222222',
        systemSid: 'DEV',
        resourceKeys: ['CLAS:ZCL_RUNTIME_TEST'],
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

test('safe_execute uses the hard-cancellable SAP runtime by default', async () => {
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
    const options = await createAdtServerMcpOptions({
      env: {
        ADT_SERVER_MCP_PUBLIC_KEY_FILE: publicKeyPath,
        ADT_SERVER_MCP_KEY_ID: 'adt-mcp-test',
        ADT_SERVER_MCP_ISSUER: 'adt-api',
        ADT_SERVER_MCP_SAFE_EXECUTE_ENABLED: 'true',
      },
      brokerOptions,
      consumeExecutionAuthorization: async () => true,
      reportExecutionOutcome: async () => true,
    });

    assert.strictEqual(
      options?.executeWithDeadline,
      executeWithDeadlineAndAbort,
    );
    assert.strictEqual(typeof options?.reportExecutionOutcome, 'function');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('safe_execute aborts SAP I/O and awaits settlement before reporting timeout', async () => {
  const originalFetch = globalThis.fetch;
  let observedSignal: AbortSignal | undefined;
  let operationSettled = false;
  let fetchCalls = 0;
  globalThis.fetch = async (_input, init) => {
    fetchCalls++;
    observedSignal = init?.signal ?? undefined;
    return await new Promise<Response>((_resolve, reject) => {
      observedSignal?.addEventListener(
        'abort',
        () => {
          queueMicrotask(() => {
            operationSettled = true;
            reject(observedSignal?.reason);
          });
        },
        { once: true },
      );
    });
  };
  const adapter = createAdtAdapter({
    baseUrl: 'https://sap.example.test',
    username: 'test',
    password: 'test',
  });

  try {
    await assert.rejects(
      executeWithDeadlineAndAbort({
        maxDurationMs: 10,
        operation: async () => {
          try {
            return await adapter.request({
              method: 'GET',
              url: '/sap/bc/adt/atc/runs',
            });
          } catch {
            // Tool handlers normalize transport failures into MCP results.
            return { isError: true };
          }
        },
      }),
      /deadline exceeded/i,
    );
    assert.strictEqual(observedSignal?.aborted, true);
    assert.strictEqual(operationSettled, true);
    await new Promise((resolve) => setTimeout(resolve, 20));
    assert.strictEqual(fetchCalls, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('safe_execute rejects a late settlement even when the event loop delays the timer', async () => {
  await assert.rejects(
    executeWithDeadlineAndAbort({
      maxDurationMs: 1,
      operation: async () => {
        const settleAfter = performance.now() + 10;
        while (performance.now() < settleAfter) {
          // Simulate synchronous result processing that delays timer delivery.
        }
        return { completed: true };
      },
    }),
    /deadline exceeded/i,
  );
});

test('safe_execute rejects missing deployment-owned authorization hooks', async () => {
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
      /deployment-owned authorization and outcome hooks/i,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('safe_execute preserves injected authorization hooks unchanged', async () => {
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
  const consumeExecutionAuthorization = async () => true;
  const reportExecutionOutcome = async () => true;

  try {
    const options = await createAdtServerMcpOptions({
      env: {
        ADT_SERVER_MCP_PUBLIC_KEY_FILE: publicKeyPath,
        ADT_SERVER_MCP_KEY_ID: 'adt-mcp-test',
        ADT_SERVER_MCP_ISSUER: 'adt-api',
        ADT_SERVER_MCP_SAFE_EXECUTE_ENABLED: 'true',
      },
      brokerOptions,
      consumeExecutionAuthorization,
      reportExecutionOutcome,
    });

    assert.strictEqual(
      options?.consumeExecutionAuthorization,
      consumeExecutionAuthorization,
    );
    assert.strictEqual(options?.reportExecutionOutcome, reportExecutionOutcome);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('safe_execute creates HTTP hooks from environment URLs', async () => {
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

  const fetchCalls: { url: string; init: RequestInit }[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    fetchCalls.push({ url: input.toString(), init: init as RequestInit });
    return new Response(null, { status: 204 });
  };

  try {
    const options = await createAdtServerMcpOptions({
      env: {
        ADT_SERVER_MCP_PUBLIC_KEY_FILE: publicKeyPath,
        ADT_SERVER_MCP_KEY_ID: 'adt-mcp-test',
        ADT_SERVER_MCP_ISSUER: 'adt-api',
        ADT_SERVER_MCP_SAFE_EXECUTE_ENABLED: 'true',
        ADT_SERVER_MCP_AUTHORIZATION_CONSUMER_URL: 'http://auth.test/consume',
        ADT_SERVER_MCP_OUTCOME_REPORTER_URL: 'http://auth.test/report',
      },
      brokerOptions,
    });

    assert.ok(options);
    assert.strictEqual(
      typeof options?.consumeExecutionAuthorization,
      'function',
    );
    assert.strictEqual(typeof options?.reportExecutionOutcome, 'function');

    const consumeInput = {
      authorizationId: 'auth-1',
      authorizationToken: 'token-abc',
      principal: 'user-1',
      scopeId: '11111111-1111-4111-8111-111111111111',
      executionId: '22222222-2222-4222-8222-222222222222',
      systemSid: 'DEV',
      resourceKeys: ['CLAS:ZCL_FOO'],
      destination: 'dev',
      operationId: 'atc_run' as const,
      policy: {
        operationId: 'atc_run' as const,
        check: 'atc' as const,
        maxDurationMs: 10_000,
        maxResultBytes: 1_000_000,
        maxFindings: 100,
        maxObjects: 100,
        maxPackages: 10,
        maxVariants: 5,
      },
    };
    const consumeResult = await options?.consumeExecutionAuthorization?.(
      consumeInput as any,
    );
    assert.strictEqual(consumeResult, true);
    assert.strictEqual(fetchCalls.length, 1);
    assert.strictEqual(fetchCalls[0].url, 'http://auth.test/consume');
    assert.strictEqual(fetchCalls[0].init.method, 'POST');
    assert.strictEqual(
      (fetchCalls[0].init.headers as Record<string, string>).Authorization,
      'Bearer token-abc',
    );
    const consumeBody = JSON.parse(fetchCalls[0].init.body as string);
    assert.strictEqual(consumeBody.authorizationId, 'auth-1');
    assert.strictEqual(consumeBody.operationId, 'atc_run');

    const reportInput = {
      authorizationId: 'auth-1',
      authorizationToken: 'token-abc',
      outcome: 'succeeded' as const,
    };
    const reportResult = await options?.reportExecutionOutcome?.(
      reportInput as any,
    );
    assert.strictEqual(reportResult, true);
    assert.strictEqual(fetchCalls.length, 2);
    assert.strictEqual(fetchCalls[1].url, 'http://auth.test/report');
    const reportBody = JSON.parse(fetchCalls[1].init.body as string);
    assert.strictEqual(reportBody.outcome, 'succeeded');
  } finally {
    globalThis.fetch = originalFetch;
    await rm(directory, { recursive: true, force: true });
  }
});

test('safe_execute HTTP hooks return false on non-2xx responses', async () => {
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

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(null, { status: 403 });

  try {
    const options = await createAdtServerMcpOptions({
      env: {
        ADT_SERVER_MCP_PUBLIC_KEY_FILE: publicKeyPath,
        ADT_SERVER_MCP_KEY_ID: 'adt-mcp-test',
        ADT_SERVER_MCP_ISSUER: 'adt-api',
        ADT_SERVER_MCP_SAFE_EXECUTE_ENABLED: 'true',
        ADT_SERVER_MCP_AUTHORIZATION_CONSUMER_URL: 'http://auth.test/consume',
        ADT_SERVER_MCP_OUTCOME_REPORTER_URL: 'http://auth.test/report',
      },
      brokerOptions,
    });

    const result = await options?.consumeExecutionAuthorization?.({
      authorizationId: 'auth-1',
      authorizationToken: 'token-abc',
      principal: 'user-1',
      scopeId: '11111111-1111-4111-8111-111111111111',
      executionId: '22222222-2222-4222-8222-222222222222',
      systemSid: 'DEV',
      resourceKeys: ['CLAS:ZCL_FOO'],
      destination: 'dev',
      operationId: 'atc_run',
      policy: {
        operationId: 'atc_run',
        check: 'atc',
        maxDurationMs: 10_000,
        maxResultBytes: 1_000_000,
        maxFindings: 100,
        maxObjects: 100,
        maxPackages: 10,
        maxVariants: 5,
      },
    } as any);
    assert.strictEqual(result, false);
  } finally {
    globalThis.fetch = originalFetch;
    await rm(directory, { recursive: true, force: true });
  }
});

test('safe_execute still requires hooks when only one environment URL is set', async () => {
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
          ADT_SERVER_MCP_AUTHORIZATION_CONSUMER_URL: 'http://auth.test/consume',
        },
        brokerOptions,
      }),
      /deployment-owned authorization and outcome hooks/i,
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
