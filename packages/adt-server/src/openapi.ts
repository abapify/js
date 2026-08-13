import YAML from 'yaml';
import { z } from 'zod';
import {
  atcDocumentationReadBody,
  atcDocumentationReadResponse,
  atcRunBody,
  atcRunResponse,
  destinationSummaryResponse,
  objectMetadataResponse,
  badiResponse,
  objectNamePathParameter,
  objectPageResponse,
  objectSearchQuery,
  objectSourceReadBody,
  objectSourceHistoryResponse,
  objectTypePathParameter,
  packagePathParameter,
  packagePageResponse,
  packageSearchQuery,
  packageTreeQuery,
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

const atcDocumentationReadBodySchema = z.toJSONSchema(atcDocumentationReadBody);
const atcDocumentationReadResponseSchema = z.toJSONSchema(
  atcDocumentationReadResponse,
);
const atcRunBodySchema = z.toJSONSchema(atcRunBody);
const atcRunResponseSchema = z.toJSONSchema(atcRunResponse);
const destinationSummaryResponseSchema = z.toJSONSchema(
  destinationSummaryResponse,
);

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
const packageTreeQuerySchema = z.toJSONSchema(packageTreeQuery);
const objectPageResponseSchema = z.toJSONSchema(objectPageResponse);
const objectMetadataResponseSchema = z.toJSONSchema(objectMetadataResponse);
const badiResponseSchema = z.toJSONSchema(badiResponse);
const objectSourceHistoryResponseSchema = z.toJSONSchema(
  objectSourceHistoryResponse,
);
const objectSourceReadBodySchema = z.toJSONSchema(objectSourceReadBody);
const objectSearchQuerySchema = z.toJSONSchema(objectSearchQuery);
const objectTypePathParameterSchema = z.toJSONSchema(objectTypePathParameter);
const objectNamePathParameterSchema = z.toJSONSchema(objectNamePathParameter);
const packagePathParameterSchema = z.toJSONSchema(packagePathParameter);
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
const packageTreeQueryProperties = packageTreeQuerySchema.properties as Record<
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
          '200': {
            description: 'Accessible safe destination summaries',
            content: {
              'application/json': { schema: destinationSummaryResponseSchema },
            },
          },
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
    '/v1/destinations/{destination}/packages/tree': {
      get: {
        operationId: 'getPackageTree',
        parameters: [
          { $ref: '#/components/parameters/destination' },
          {
            name: 'root',
            in: 'query',
            required: true,
            description:
              'Named package root. The service never enumerates a global package forest.',
            schema: packageTreeQueryProperties.root,
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Page size, maximum 200',
            schema: packageTreeQueryProperties.limit,
          },
          {
            name: 'cursor',
            in: 'query',
            required: false,
            description: 'Opaque root-bound page cursor',
            schema: packageTreeQueryProperties.cursor,
          },
        ],
        responses: {
          '200': {
            description:
              'Bounded canonical package subtree rooted at the requested package',
            content: {
              'application/json': { schema: packagePageResponseSchema },
            },
          },
          '400': { description: 'Invalid request' },
        },
      },
    },
    '/v1/destinations/{destination}/packages/{package}/objects': {
      get: {
        operationId: 'listPackageObjects',
        parameters: [
          { $ref: '#/components/parameters/destination' },
          { $ref: '#/components/parameters/package' },
          objectQueryParameter('limit', 'Page size, maximum 200'),
          objectQueryParameter('cursor', 'Opaque package-bound page cursor'),
        ],
        responses: {
          '200': {
            description:
              'Bounded direct package objects with canonical identity',
            content: {
              'application/json': { schema: objectPageResponseSchema },
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
    '/v1/destinations/{destination}/objects/{type}/{name}': {
      get: {
        operationId: 'getObjectMetadata',
        parameters: [
          { $ref: '#/components/parameters/destination' },
          { $ref: '#/components/parameters/objectType' },
          { $ref: '#/components/parameters/objectName' },
        ],
        responses: {
          '200': {
            description:
              'Canonical object metadata, facets and allowlisted relation capabilities',
            content: {
              'application/json': { schema: objectMetadataResponseSchema },
            },
          },
          '400': { description: 'Invalid request' },
        },
      },
    },
    '/v1/destinations/{destination}/badi/{name}': {
      get: {
        operationId: 'getBadi',
        parameters: [
          { $ref: '#/components/parameters/destination' },
          {
            name: 'name',
            in: 'path',
            required: true,
            schema: objectNamePathParameterSchema,
            description:
              'BAdI name — definition, implementation, or ENHO container',
          },
          {
            name: 'implementations',
            in: 'query',
            required: false,
            schema: { type: 'boolean' },
            description:
              'When name is a classic definition (SXSD/XD), include its SXCI/XI implementations',
          },
        ],
        responses: {
          '200': {
            description:
              'Canonical BAdI metadata; kind is resolved from repository type',
            content: {
              'application/json': { schema: badiResponseSchema },
            },
          },
          '400': { description: 'Invalid request' },
        },
      },
    },
    '/v1/destinations/{destination}/objects/{type}/{name}/source-history': {
      get: {
        operationId: 'getObjectSourceHistory',
        parameters: [
          { $ref: '#/components/parameters/destination' },
          { $ref: '#/components/parameters/objectType' },
          { $ref: '#/components/parameters/objectName' },
        ],
        responses: {
          '200': {
            description: 'Metadata-only canonical object source history',
            content: {
              'application/json': {
                schema: objectSourceHistoryResponseSchema,
              },
            },
          },
          '400': { description: 'Invalid request' },
        },
      },
    },
    '/v1/destinations/{destination}/objects/{type}/{name}/source:read': {
      post: {
        operationId: 'readObjectSource',
        parameters: [
          { $ref: '#/components/parameters/destination' },
          { $ref: '#/components/parameters/objectType' },
          { $ref: '#/components/parameters/objectName' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: objectSourceReadBodySchema },
          },
        },
        responses: {
          '200': {
            description: 'Complete bounded canonical object source body',
            content: {
              'application/json': { schema: sourceVersionReadResponseSchema },
            },
          },
          '400': { description: 'Invalid request' },
          '413': { description: 'Source exceeds the fixed byte cap' },
        },
      },
    },
    '/v1/destinations/{destination}/atc-runs': {
      post: {
        operationId: 'runAtc',
        parameters: [{ $ref: '#/components/parameters/destination' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: atcRunBodySchema },
          },
        },
        responses: {
          '200': {
            description:
              'Normalized ATC findings with opaque documentation capabilities',
            content: {
              'application/json': { schema: atcRunResponseSchema },
            },
          },
          '400': { description: 'Invalid request' },
        },
      },
    },
    '/v1/destinations/{destination}/atc-finding-documentation:read': {
      post: {
        operationId: 'readAtcFindingDocumentation',
        parameters: [{ $ref: '#/components/parameters/destination' }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: atcDocumentationReadBodySchema },
          },
        },
        responses: {
          '200': {
            description: 'Complete bounded ATC documentation HTML',
            content: {
              'application/json': {
                schema: atcDocumentationReadResponseSchema,
              },
            },
          },
          '400': { description: 'Invalid request' },
          '404': { description: 'Documentation capability is unavailable' },
          '413': { description: 'Documentation exceeds the byte cap' },
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
      package: {
        name: 'package',
        in: 'path',
        required: true,
        schema: packagePathParameterSchema,
      },
      objectType: {
        name: 'type',
        in: 'path',
        required: true,
        schema: objectTypePathParameterSchema,
      },
      objectName: {
        name: 'name',
        in: 'path',
        required: true,
        schema: objectNamePathParameterSchema,
      },
    },
  },
} as const;

export const openApiYaml = (): string => YAML.stringify(openApiDocument);
