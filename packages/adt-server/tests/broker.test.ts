import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  createHttpBrokerOperations,
  createHttpDestinationContexts,
} from '../src/broker.js';

test('redeems a frozen source reference through the private ARM broker', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'adt-server-broker-'));
  const tokenFile = path.join(directory, 'broker-token');
  await writeFile(tokenFile, 'sidecar-token\n', 'utf8');
  const requests: Array<{ url: string; headers: Headers; body: unknown }> = [];
  const contexts = createHttpDestinationContexts({
    baseUrl: 'http://arm-api.internal',
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
      destination: 'bhf-adt',
      systemSid: 'BHF',
      sourceRef: 'v1.opaque-reference',
    });

    assert.deepStrictEqual(resolved, {
      sourceUri: '/sap/bc/adt/oo/classes/zcl_scope/source/main',
    });
    assert.deepStrictEqual(
      requests.map((request) => ({
        url: request.url,
        authorization: request.headers.get('x-arm-adt-server-token'),
        body: request.body,
      })),
      [
        {
          url: 'http://arm-api.internal/internal/adt-server/frozen-source-references:resolve',
          authorization: 'sidecar-token',
          body: {
            destination: 'bhf-adt',
            systemSid: 'BHF',
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
    baseUrl: 'http://arm-api.internal',
    tokenFile,
    fetch: async () =>
      new Response(
        JSON.stringify({
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
