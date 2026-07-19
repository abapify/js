import YAML from 'yaml';
import { z } from 'zod';
import {
  sourceVersionReadBody,
  transportSourceManifestBody,
} from './rest-schemas.js';

const transportSourceManifestSchema = z.toJSONSchema(
  transportSourceManifestBody,
);
const sourceVersionReadSchema = z.toJSONSchema(sourceVersionReadBody);

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
        parameters: [{ $ref: '#/components/parameters/destination' }],
        responses: { '200': { description: 'Transport headers' } },
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
        parameters: [{ $ref: '#/components/parameters/destination' }],
        responses: { '200': { description: 'Packages' } },
      },
    },
    '/v1/destinations/{destination}/objects': {
      get: {
        operationId: 'searchObjects',
        parameters: [{ $ref: '#/components/parameters/destination' }],
        responses: { '200': { description: 'Objects' } },
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
    },
  },
} as const;

export const openApiYaml = (): string => YAML.stringify(openApiDocument);
