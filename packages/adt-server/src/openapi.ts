import YAML from 'yaml';
import { z } from 'zod';
import {
  objectPageResponse,
  objectSearchQuery,
  packagePageResponse,
  packageSearchQuery,
  sourceVersionReadBody,
  sourceVersionReadResponse,
  transportDetailResponse,
  transportListResponse,
  transportObjectsResponse,
  transportPathParameter,
  transportSearchQuery,
  transportSourceManifestBody,
  transportSourceManifestResponse,
} from './rest-schemas.js';

const transportSourceManifestSchema = z.toJSONSchema(
  transportSourceManifestBody,
);
const sourceVersionReadSchema = z.toJSONSchema(sourceVersionReadBody);
const sourceVersionReadResponseSchema = z.toJSONSchema(
  sourceVersionReadResponse,
);
const transportSourceManifestResponseSchema = z.toJSONSchema(
  transportSourceManifestResponse,
);
const packagePageResponseSchema = z.toJSONSchema(packagePageResponse);
const packageSearchQuerySchema = z.toJSONSchema(packageSearchQuery);
const objectPageResponseSchema = z.toJSONSchema(objectPageResponse);
const objectSearchQuerySchema = z.toJSONSchema(objectSearchQuery);
const transportSearchQuerySchema = z.toJSONSchema(transportSearchQuery);
const transportListResponseSchema = z.toJSONSchema(transportListResponse);
const transportDetailResponseSchema = z.toJSONSchema(transportDetailResponse);
const transportObjectsResponseSchema = z.toJSONSchema(transportObjectsResponse);
const transportPathParameterSchema = z.toJSONSchema(transportPathParameter);
const transportQueryProperties =
  transportSearchQuerySchema.properties as Record<string, unknown>;
const packageQueryProperties = packageSearchQuerySchema.properties as Record<
  string,
  unknown
>;
const objectQueryProperties = objectSearchQuerySchema.properties as Record<
  string,
  unknown
>;

function transportQueryParameter(name: string, description: string) {
  return {
    name,
    in: 'query',
    required: false,
    description,
    schema: transportQueryProperties[name],
  };
}

function packageQueryParameter(name: string, description: string) {
  return {
    name,
    in: 'query',
    required: false,
    description,
    schema: packageQueryProperties[name],
  };
}

function objectQueryParameter(name: string, description: string) {
  return {
    name,
    in: 'query',
    required: false,
    description,
    schema: objectQueryProperties[name],
  };
}

/** Deterministic, owned OpenAPI document. Route schemas are deliberately
 * destination-only; SAP URLs and credentials never occur in this contract. */
export const openApiDocument = {
  openapi: '3.1.0',
  info: { title: 'ADT Server', version: '1.0.0' },
  paths: {
    '/v1/destinations': {
      get: {
        operationId: 'listDestinations',
        responses: {
          '200': { description: 'Accessible safe destination summaries' },
        },
      },
    },
    '/v1/destinations/{destination}/transports': {
      get: {
        operationId: 'listTransports',
        parameters: [
          { $ref: '#/components/parameters/destination' },
          transportQueryParameter('owner', 'Case-insensitive owner match'),
          transportQueryParameter('type', 'Case-insensitive CTS type match'),
          transportQueryParameter(
            'status',
            'Case-insensitive normalized status match',
          ),
          transportQueryParameter('target', 'Case-insensitive target match'),
          transportQueryParameter(
            'dateFrom',
            'Inclusive changed date, YYYY-MM-DD',
          ),
          transportQueryParameter(
            'dateTo',
            'Inclusive changed date, YYYY-MM-DD',
          ),
          transportQueryParameter(
            'text',
            'Description/owner text, exact transport or explicit prefix',
          ),
          transportQueryParameter(
            'includeTasks',
            'Whether task transport headers are included',
          ),
        ],
        responses: {
          '200': {
            description: 'Normalized system-wide transport headers',
            content: {
              'application/json': { schema: transportListResponseSchema },
            },
          },
          '400': { description: 'Invalid request' },
        },
      },
    },
    '/v1/destinations/{destination}/transports/{transport}': {
      get: {
        operationId: 'getTransportDetail',
        parameters: [
          { $ref: '#/components/parameters/destination' },
          { $ref: '#/components/parameters/transport' },
        ],
        responses: {
          '200': {
            description:
              'Request/task hierarchy with canonical object references',
            content: {
              'application/json': { schema: transportDetailResponseSchema },
            },
          },
          '400': { description: 'Invalid request' },
        },
      },
    },
    '/v1/destinations/{destination}/transports/{transport}/objects': {
      get: {
        operationId: 'listTransportObjects',
        parameters: [
          { $ref: '#/components/parameters/destination' },
          { $ref: '#/components/parameters/transport' },
        ],
        responses: {
          '200': {
            description:
              'Canonical object references aggregated over request and tasks',
            content: {
              'application/json': { schema: transportObjectsResponseSchema },
            },
          },
          '400': { description: 'Invalid request' },
        },
      },
    },
    '/v1/destinations/{destination}/transport-source-manifests': {
      post: {
        operationId: 'buildTransportSourceManifest',
        parameters: [{ $ref: '#/components/parameters/destination' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: transportSourceManifestSchema,
            },
          },
        },
        responses: {
          '200': {
            description:
              'Metadata-only transport source manifest with opaque source capabilities',
            content: {
              'application/json': {
                schema: transportSourceManifestResponseSchema,
              },
            },
          },
          '400': { description: 'Invalid request' },
        },
      },
    },
    '/v1/destinations/{destination}/source-versions:read': {
      post: {
        operationId: 'readSourceVersion',
        parameters: [{ $ref: '#/components/parameters/destination' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: sourceVersionReadSchema,
            },
          },
        },
        responses: {
          '200': {
            description: 'Complete immutable source body under byte cap',
            content: {
              'application/json': { schema: sourceVersionReadResponseSchema },
            },
          },
          '400': { description: 'Invalid request' },
          '404': { description: 'Source capability unavailable' },
          '413': { description: 'Source exceeds requested byte cap' },
        },
      },
    },
    '/v1/destinations/{destination}/packages': {
      get: {
        operationId: 'searchPackages',
        parameters: [
          { $ref: '#/components/parameters/destination' },
          packageQueryParameter('q', 'Package prefix or wildcard query'),
          packageQueryParameter(
            'maxResults',
            'Bounded upstream package search cap',
          ),
          packageQueryParameter('limit', 'Page size, maximum 200'),
          packageQueryParameter('cursor', 'Opaque query-bound page cursor'),
        ],
        responses: {
          '200': {
            description: 'Bounded canonical package search page',
            content: {
              'application/json': { schema: packagePageResponseSchema },
            },
          },
          '400': { description: 'Invalid request' },
        },
      },
    },
    '/v1/destinations/{destination}/objects': {
      get: {
        operationId: 'searchObjects',
        parameters: [
          { $ref: '#/components/parameters/destination' },
          objectQueryParameter('query', 'Object prefix or wildcard query'),
          objectQueryParameter('packageName', 'Exact package filter'),
          objectQueryParameter('objectType', 'Repository object type filter'),
          objectQueryParameter(
            'maxResults',
            'Bounded upstream object search cap',
          ),
          objectQueryParameter('limit', 'Page size, maximum 200'),
          objectQueryParameter('cursor', 'Opaque query-bound page cursor'),
        ],
        responses: {
          '200': {
            description: 'Bounded canonical repository object search page',
            content: {
              'application/json': { schema: objectPageResponseSchema },
            },
          },
          '400': { description: 'Invalid request' },
        },
      },
    },
  },
  components: {
    parameters: {
      destination: {
        name: 'destination',
        in: 'path',
        required: true,
        schema: { type: 'string', pattern: '^[a-z][a-z0-9-]{1,62}$' },
      },
      transport: {
        name: 'transport',
        in: 'path',
        required: true,
        schema: transportPathParameterSchema,
      },
    },
  },
} as const;

export const openApiYaml = (): string => YAML.stringify(openApiDocument);
