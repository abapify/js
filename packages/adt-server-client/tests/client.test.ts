import assert from 'node:assert/strict';
import test from 'node:test';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { openApiDocument } from '../../adt-server/src/openapi.js';
import { createAdtServerClient } from '../src/index.js';
import { renderOpenApiClient } from '../scripts/generate.js';

test('exports every OpenAPI operation as a client method', () => {
  const expected = Object.values(openApiDocument.paths)
    .flatMap((path) =>
      Object.entries(path).flatMap(([method, operation]) =>
        ['get', 'post', 'put', 'patch', 'delete'].includes(method) &&
        operation &&
        typeof operation === 'object' &&
        typeof operation.operationId === 'string'
          ? [operation.operationId]
          : [],
      ),
    )
    .sort();
  const client = createAdtServerClient({
    baseUrl: 'http://adt-server.test',
    fetch: globalThis.fetch,
  });

  assert.deepStrictEqual(Object.keys(client).sort(), expected);
});

test('generates a concrete type for every successful OpenAPI response', async () => {
  const source = await renderOpenApiClient(openApiDocument);

  assert.doesNotMatch(source, /^export type .*Response = unknown;$/mu);
  assert.strictEqual((source.match(/\|\s*unknown/gu) ?? []).length, 0);
});

test('serializes generated path, query and JSON body inputs', async () => {
  const requests: Array<{
    url: URL;
    init: RequestInit | undefined;
  }> = [];
  const client = createAdtServerClient({
    baseUrl: 'http://adt-server.test',
    fetch: async (input, init) => {
      requests.push({ url: new URL(input.toString()), init });
      return new Response(JSON.stringify({ data: [], truncated: false }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    },
  });

  await client.getPackageTree({
    destination: 'dev',
    root: 'Z ROOT',
    limit: 7,
  });
  await client.readSourceVersion({
    destination: 'dev',
    body: { sourceCapability: 'opaque-capability', maxBytes: 64 },
  });

  assert.strictEqual(
    requests[0]?.url.pathname,
    '/v1/destinations/dev/packages/tree',
  );
  assert.deepStrictEqual(requests[0]?.url.searchParams.get('root'), 'Z ROOT');
  assert.strictEqual(requests[0]?.url.searchParams.get('limit'), '7');
  assert.strictEqual(requests[1]?.init?.method, 'POST');
  assert.strictEqual(
    requests[1]?.init?.body,
    JSON.stringify({ sourceCapability: 'opaque-capability', maxBytes: 64 }),
  );
});
