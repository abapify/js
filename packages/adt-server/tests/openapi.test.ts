import assert from 'node:assert/strict';
import test from 'node:test';
import SwaggerParser from '@apidevtools/swagger-parser';
import { openApiDocument } from '../src/openapi.js';

test('is valid OpenAPI 3.1', async () => {
  await SwaggerParser.validate(structuredClone(openApiDocument));
});

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
