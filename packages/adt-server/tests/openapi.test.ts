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
    {
      post?: {
        operationId?: string;
        responses?: Record<
          string,
          { content?: Record<string, { schema?: unknown }> }
        >;
      };
    }
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
  assert.ok(
    paths['/v1/destinations/{destination}/transport-source-manifests']?.post
      ?.responses?.['200']?.content?.['application/json']?.schema,
  );
  assert.ok(
    paths['/v1/destinations/{destination}/source-versions:read']?.post
      ?.responses?.['200']?.content?.['application/json']?.schema,
  );
  assert.ok(!JSON.stringify(openApiDocument).includes('sourceUri'));
});

test('documents the normalized, filterable system-wide transport search contract', () => {
  const transportPath =
    openApiDocument.paths['/v1/destinations/{destination}/transports'].get;

  assert.strictEqual(transportPath.operationId, 'listTransports');
  assert.deepStrictEqual(
    transportPath.parameters?.map((parameter) =>
      '$ref' in parameter ? parameter.$ref : parameter.name,
    ),
    [
      '#/components/parameters/destination',
      'owner',
      'type',
      'status',
      'target',
      'dateFrom',
      'dateTo',
      'text',
      'includeTasks',
    ],
  );
  assert.ok(
    transportPath.responses['200'].content?.['application/json'].schema,
  );
  assert.ok(!JSON.stringify(transportPath).includes('sourceUri'));
});

test('documents canonical transport detail and object reads without SAP URI fields', () => {
  const paths = openApiDocument.paths as Record<
    string,
    { get?: { operationId?: string; responses?: Record<string, unknown> } }
  >;

  assert.strictEqual(
    paths['/v1/destinations/{destination}/transports/{transport}']?.get
      ?.operationId,
    'getTransportDetail',
  );
  assert.strictEqual(
    paths['/v1/destinations/{destination}/transports/{transport}/objects']?.get
      ?.operationId,
    'listTransportObjects',
  );
  assert.ok(
    JSON.stringify(
      paths['/v1/destinations/{destination}/transports/{transport}'],
    ).includes('application/json'),
  );
  assert.ok(
    JSON.stringify(
      paths['/v1/destinations/{destination}/transports/{transport}/objects'],
    ).includes('application/json'),
  );
  assert.ok(!JSON.stringify(openApiDocument).includes('sourceUri'));
});

test('documents the bounded canonical package search page', () => {
  const packages =
    openApiDocument.paths['/v1/destinations/{destination}/packages'].get;

  assert.strictEqual(packages.operationId, 'searchPackages');
  assert.ok(
    packages.parameters?.some(
      (parameter) => !('$ref' in parameter) && parameter.name === 'limit',
    ),
  );
  assert.ok(packages.responses['200'].content?.['application/json'].schema);
  assert.ok(!JSON.stringify(packages).includes('uri'));
});
