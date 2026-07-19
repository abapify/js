import assert from 'node:assert/strict';
import test from 'node:test';
import { openApiDocument } from '../src/openapi.js';

test('documents the capability-bound immutable source REST pair without SAP URI fields', () => {
  const paths = openApiDocument.paths as Record<
    string,
    { post?: { operationId?: string } }
  >;

  assert.strictEqual(
    paths['/v1/destinations/{destination}/transport-source-manifests']?.post
      ?.operationId,
    'buildTransportSourceManifest',
  );
  assert.strictEqual(
    paths['/v1/destinations/{destination}/source-versions:read']?.post
      ?.operationId,
    'readSourceVersion',
  );
  assert.ok(!JSON.stringify(openApiDocument).includes('sourceUri'));
});
