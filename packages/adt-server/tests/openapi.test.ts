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

test('documents the bounded canonical object search page without ADT URI fields', () => {
  const objects =
    openApiDocument.paths['/v1/destinations/{destination}/objects'].get;

  assert.strictEqual(objects.operationId, 'searchObjects');
  assert.deepStrictEqual(
    objects.parameters?.map((parameter) =>
      '$ref' in parameter ? parameter.$ref : parameter.name,
    ),
    [
      '#/components/parameters/destination',
      'query',
      'packageName',
      'objectType',
      'maxResults',
      'limit',
      'cursor',
    ],
  );
  assert.ok(objects.responses['200'].content?.['application/json'].schema);
  assert.ok(!JSON.stringify(objects).includes('uri'));
});

test('documents bounded direct package objects without ADT URI fields', () => {
  const packageObjects =
    openApiDocument.paths[
      '/v1/destinations/{destination}/packages/{package}/objects'
    ].get;

  assert.strictEqual(packageObjects.operationId, 'listPackageObjects');
  assert.deepStrictEqual(
    packageObjects.parameters?.map((parameter) =>
      '$ref' in parameter ? parameter.$ref : parameter.name,
    ),
    [
      '#/components/parameters/destination',
      '#/components/parameters/package',
      'limit',
      'cursor',
    ],
  );
  assert.ok(
    packageObjects.responses['200'].content?.['application/json'].schema,
  );
  assert.ok(!JSON.stringify(packageObjects).includes('uri'));
});

test('documents canonical object metadata without raw ADT links', () => {
  const metadata =
    openApiDocument.paths[
      '/v1/destinations/{destination}/objects/{type}/{name}'
    ].get;

  assert.strictEqual(metadata.operationId, 'getObjectMetadata');
  assert.deepStrictEqual(
    metadata.parameters?.map((parameter) =>
      '$ref' in parameter ? parameter.$ref : parameter.name,
    ),
    [
      '#/components/parameters/destination',
      '#/components/parameters/objectType',
      '#/components/parameters/objectName',
    ],
  );
  assert.ok(metadata.responses['200'].content?.['application/json'].schema);
  assert.ok(!JSON.stringify(metadata).includes('uri'));
  assert.ok(!JSON.stringify(metadata).includes('href'));
});

test('documents canonical object source history without source locators', () => {
  const history =
    openApiDocument.paths[
      '/v1/destinations/{destination}/objects/{type}/{name}/source-history'
    ].get;

  assert.strictEqual(history.operationId, 'getObjectSourceHistory');
  assert.deepStrictEqual(
    history.parameters?.map((parameter) =>
      '$ref' in parameter ? parameter.$ref : parameter.name,
    ),
    [
      '#/components/parameters/destination',
      '#/components/parameters/objectType',
      '#/components/parameters/objectName',
    ],
  );
  assert.ok(history.responses['200'].content?.['application/json'].schema);
  assert.ok(!JSON.stringify(history).includes('uri'));
  assert.ok(!JSON.stringify(history).includes('href'));
});

test('documents bounded canonical object source reads without SAP URI input', () => {
  const source =
    openApiDocument.paths[
      '/v1/destinations/{destination}/objects/{type}/{name}/source:read'
    ].post;

  assert.strictEqual(source.operationId, 'readObjectSource');
  assert.deepStrictEqual(
    source.parameters?.map((parameter) =>
      '$ref' in parameter ? parameter.$ref : parameter.name,
    ),
    [
      '#/components/parameters/destination',
      '#/components/parameters/objectType',
      '#/components/parameters/objectName',
    ],
  );
  assert.ok(source.requestBody?.content?.['application/json'].schema);
  assert.ok(source.responses['200'].content?.['application/json'].schema);
  assert.ok(!JSON.stringify(source).includes('uri'));
  assert.ok(!JSON.stringify(source).includes('href'));
});

test('documents canonical ATC runs and opaque bounded documentation reads', () => {
  const run =
    openApiDocument.paths['/v1/destinations/{destination}/atc-runs'].post;
  const documentation =
    openApiDocument.paths[
      '/v1/destinations/{destination}/atc-finding-documentation:read'
    ].post;

  assert.strictEqual(run.operationId, 'runAtc');
  assert.strictEqual(documentation.operationId, 'readAtcFindingDocumentation');
  assert.ok(run.requestBody?.content?.['application/json'].schema);
  assert.ok(run.responses['200'].content?.['application/json'].schema);
  assert.ok(documentation.requestBody?.content?.['application/json'].schema);
  assert.ok(
    documentation.responses['200'].content?.['application/json'].schema,
  );
  assert.ok(!JSON.stringify(run).includes('/sap/bc/adt/'));
  assert.ok(!JSON.stringify(documentation).includes('/sap/bc/adt/'));
});
