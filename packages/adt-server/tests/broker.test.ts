import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  createHttpBrokerOperations,
  createHttpDestinationContexts,
} from '../src/broker.js';

test('redeems a frozen source reference through the private ADT broker', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'adt-server-broker-'));
  const tokenFile = path.join(directory, 'broker-token');
  await writeFile(tokenFile, 'sidecar-token\n', 'utf8');
  const requests: Array<{ url: string; headers: Headers; body: unknown }> = [];
  const contexts = createHttpDestinationContexts({
    baseUrl: 'http://adt-api.internal',
    tokenFile,
    fetch: async (input, init) => {
      requests.push({
        url: String(input),
        headers: new Headers(init?.headers),
        body: init?.body ? JSON.parse(String(init.body)) : undefined,
      });
      return new Response(
        JSON.stringify({
          sourceUri: '/sap/bc/adt/oo/classes/zcl_scope/source/main',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    },
  });

  try {
    const resolved = await contexts.resolveFrozenSource({
      destination: 'trl-adt',
      systemSid: 'TRL',
      sourceRef: 'v1.opaque-reference',
    });

    assert.deepStrictEqual(resolved, {
      sourceUri: '/sap/bc/adt/oo/classes/zcl_scope/source/main',
    });
    assert.deepStrictEqual(
      requests.map((request) => ({
        url: request.url,
        authorization: request.headers.get('x-adt-server-token'),
        body: request.body,
      })),
      [
        {
          url: 'http://adt-api.internal/internal/adt-server/frozen-source-references:resolve',
          authorization: 'sidecar-token',
          body: {
            destination: 'trl-adt',
            systemSid: 'TRL',
            sourceRef: 'v1.opaque-reference',
          },
        },
      ],
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('reads an immutable source through the bounded ADT primitive', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'adt-server-broker-'));
  const tokenFile = path.join(directory, 'broker-token');
  await writeFile(tokenFile, 'sidecar-token\n', 'utf8');
  const reads: Array<{ sourceUri: string; maxBytes: number }> = [];
  const operations = createHttpBrokerOperations({
    baseUrl: 'http://adt-api.internal',
    tokenFile,
    fetch: async () =>
      new Response(
        JSON.stringify({
          leaseId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          destination: 'dev',
          version: 1,
          expiresAt: '2026-07-20T00:00:00.000Z',
          connection: {
            baseUrl: 'https://sap.example.test',
            sapClient: null,
            authMethod: 'basic',
            authConfig: { username: 'service', password: 'secret' },
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    createClient: async () =>
      ({
        services: {
          sourceHistory: {
            async readVersionSourceBounded(
              sourceUri: string,
              maxBytes: number,
            ) {
              reads.push({ sourceUri, maxBytes });
              return 'CLASS zcl_safe DEFINITION.';
            },
          },
        },
      }) as never,
  });

  try {
    const result = await operations.readImmutableSource!({
      destination: 'dev',
      sourceUri: '/sap/bc/adt/oo/classes/zcl_safe/source/main/versions/1',
      maxBytes: 128,
    });

    assert.deepStrictEqual(result, {
      bytes: Buffer.byteLength('CLASS zcl_safe DEFINITION.', 'utf8'),
      source: 'CLASS zcl_safe DEFINITION.',
    });
    assert.deepStrictEqual(reads, [
      {
        sourceUri: '/sap/bc/adt/oo/classes/zcl_safe/source/main/versions/1',
        maxBytes: 128,
      },
    ]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('lists all system transport headers through CTS FIND and filters ADT-side', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'adt-server-broker-'));
  const tokenFile = path.join(directory, 'broker-token');
  await writeFile(tokenFile, 'sidecar-token\n', 'utf8');
  const transportFindCalls: unknown[] = [];
  const operations = createHttpBrokerOperations({
    baseUrl: 'http://adt-api.internal',
    tokenFile,
    fetch: async () =>
      new Response(
        JSON.stringify({
          leaseId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
          destination: 'dev',
          version: 1,
          expiresAt: '2026-07-20T00:00:00.000Z',
          connection: {
            baseUrl: 'https://sap.example.test',
            sapClient: null,
            authMethod: 'basic',
            authConfig: { username: 'service', password: 'secret' },
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    createClient: async () =>
      ({
        adt: {
          cts: {
            transports: {
              async find(input: unknown) {
                transportFindCalls.push(input);
                return {
                  values: {
                    DATA: {
                      CTS_REQ_HEADER: [
                        {
                          TRKORR: 'DEVK900001',
                          AS4USER: 'ALICE',
                          AS4TEXT: 'Safe refactor',
                          TRSTATUS: 'D',
                          TRFUNCTION: 'K',
                          AS4DATE: '2026-07-19',
                          AS4TIME: '12:00:00',
                        },
                        {
                          TRKORR: 'DEVK900002',
                          AS4USER: 'BOB',
                          AS4TEXT: 'Released change',
                          TRSTATUS: 'R',
                          TRFUNCTION: 'W',
                        },
                      ],
                    },
                  },
                };
              },
            },
          },
        },
      }) as never,
  });

  try {
    const result = await operations.listTransports('dev', {
      owner: 'alice',
      status: 'modifiable',
      includeTasks: false,
    });
    assert.deepStrictEqual(transportFindCalls, [
      { _action: 'FIND', user: '*', trfunction: '*' },
    ]);
    assert.deepStrictEqual(result, [
      {
        trkorr: 'DEVK900001',
        owner: 'ALICE',
        description: 'Safe refactor',
        status: 'modifiable',
        statusRaw: 'D',
        trFunction: 'K',
        changedAt: '2026-07-19T12:00:00Z',
      },
    ]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('releases an opaque REST lease with redacted success and failure outcomes', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'adt-server-broker-'));
  const tokenFile = path.join(directory, 'broker-token');
  await writeFile(tokenFile, 'sidecar-token\n', 'utf8');
  const requests: Array<{ url: string; body?: unknown }> = [];
  let calls = 0;
  const operations = createHttpBrokerOperations({
    baseUrl: 'http://adt-api.internal',
    tokenFile,
    fetch: async (input, init) => {
      const url = String(input);
      requests.push({
        url,
        ...(init?.body ? { body: JSON.parse(String(init.body)) } : {}),
      });
      if (url.endsWith(':acquire')) {
        return new Response(
          JSON.stringify({
            leaseId:
              calls++ === 0
                ? '11111111-1111-4111-8111-111111111111'
                : '22222222-2222-4222-8222-222222222222',
            destination: 'dev',
            version: 1,
            expiresAt: '2026-07-20T00:00:00.000Z',
            connection: {
              baseUrl: 'https://sap.example.test',
              sapClient: null,
              authMethod: 'basic',
              authConfig: { username: 'service', password: 'secret' },
            },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
      }
      return new Response(null, { status: 204 });
    },
    createClient: async () => {
      if (calls === 2) throw new Error('client setup failed');
      return {
        services: {
          transports: {
            async list() {
              return [];
            },
          },
        },
        adt: {
          cts: {
            transports: {
              async find() {
                return { values: { DATA: { CTS_REQ_HEADER: [] } } };
              },
            },
          },
        },
      } as never;
    },
  });

  try {
    await operations.listTransports('dev');
    await assert.rejects(() => operations.listTransports('dev'));
    const releases = requests.filter((request) =>
      request.url.endsWith(':release'),
    );
    assert.deepStrictEqual(
      releases.map((request) => {
        const body = request.body as Record<string, unknown>;
        assert.ok(typeof body.durationMs === 'number' && body.durationMs >= 0);
        const { durationMs: _durationMs, ...safeBody } = body;
        return safeBody;
      }),
      [
        {
          leaseId: '11111111-1111-4111-8111-111111111111',
          operation: 'list_transports',
          outcome: 'succeeded',
        },
        {
          leaseId: '22222222-2222-4222-8222-222222222222',
          operation: 'list_transports',
          outcome: 'failed',
          errorCode: 'client_creation_failed',
        },
      ],
    );
    assert.ok(!JSON.stringify(releases).includes('secret'));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('releases an MCP destination context through the private broker', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'adt-server-broker-'));
  const tokenFile = path.join(directory, 'broker-token');
  await writeFile(tokenFile, 'sidecar-token\n', 'utf8');
  const requests: Array<{ url: string; body?: unknown }> = [];
  const contexts = createHttpDestinationContexts({
    baseUrl: 'http://adt-api.internal',
    tokenFile,
    fetch: async (input, init) => {
      const url = String(input);
      requests.push({
        url,
        ...(init?.body ? { body: JSON.parse(String(init.body)) } : {}),
      });
      if (url.endsWith(':acquire')) {
        return new Response(
          JSON.stringify({
            leaseId: '33333333-3333-4333-8333-333333333333',
            destination: 'dev',
            version: 1,
            expiresAt: '2026-07-20T00:00:00.000Z',
            connection: {
              baseUrl: 'https://sap.example.test',
              sapClient: null,
              authMethod: 'basic',
              authConfig: { username: 'service', password: 'secret' },
            },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
      }
      return new Response(null, { status: 204 });
    },
  });

  try {
    const lease = await contexts.leaseProvider.acquire({ destination: 'dev' });
    await lease.release();
    const release = requests.find((request) =>
      request.url.endsWith(':release'),
    );
    assert.ok(release);
    assert.deepStrictEqual(release.body, {
      leaseId: '33333333-3333-4333-8333-333333333333',
      operation: 'mcp_destination_context',
      outcome: 'succeeded',
      durationMs: 0,
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
