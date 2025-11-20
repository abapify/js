/**
 * ADT HTTP Adapter with Basic Authentication
 *
 * Implements the Speci HttpAdapter interface for ADT communication.
 * Automatically handles XML parsing/building based on schema in contract metadata.
 */

import { parse, build as tsxmlBuild, type ElementSchema } from './base';
import type { AdtConnectionConfig } from './types';

/**
 * Type-safe wrapper for build that accepts unknown body
 * The schema validates the structure at runtime
 */
function buildXml(schema: ElementSchema, data: unknown): string {
  // @ts-expect-error - ts-xml's build has overly strict types, but validates at runtime
  return tsxmlBuild(schema, data);
}

/**
 * HTTP Adapter interface (matching speci's HttpAdapter)
 */
export interface HttpAdapter {
  request<TResponse = unknown>(options: RequestOptions): Promise<TResponse>;
}

export interface RequestOptions {
  method: string;
  url: string;
  body?: unknown;
  query?: Record<string, any>;
  headers?: Record<string, string>;
  bodySchema?: ElementSchema; // Schema for serializing request body (Inferrable)
  responseSchema?: ElementSchema; // Schema for parsing response body (Inferrable)
}

/**
 * Create ADT HTTP adapter with Basic Authentication
 */
export function createAdtAdapter(config: AdtConnectionConfig): HttpAdapter {
  const { baseUrl, username, password, client, language } = config;

  // Create Basic Auth header
  const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString(
    'base64'
  )}`;

  return {
    async request<TResponse = unknown>(
      options: RequestOptions
    ): Promise<TResponse> {
      // Build full URL
      const url = new URL(options.url, baseUrl);

      // Add query parameters
      if (options.query) {
        Object.entries(options.query).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }

      // Add SAP client and language if provided
      if (client) {
        url.searchParams.append('sap-client', client);
      }
      if (language) {
        url.searchParams.append('sap-language', language);
      }

      // Prepare headers
      const headers: Record<string, string> = {
        Authorization: authHeader,
        'X-CSRF-Token': 'Fetch', // ADT requires CSRF token
        ...options.headers,
      };

      // Get schemas from options (passed via bodySchema/responseSchema from Speci)
      const bodySchema = options.bodySchema;
      const responseSchema = options.responseSchema;

      // Build request body using schema if available
      let requestBody: string | undefined;
      const body = options.body;

      if (body !== undefined && body !== null) {
        if (typeof body === 'string') {
          requestBody = body;
        } else if (bodySchema) {
          // Use schema to build XML from object
          // The schema validates the structure at runtime
          requestBody = buildXml(bodySchema, body);
        } else {
          requestBody = JSON.stringify(body);
        }
      }

      // Make request
      const response = await fetch(url.toString(), {
        method: options.method,
        headers,
        body: requestBody,
      });

      // Check for HTTP errors
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Parse response
      const contentType = response.headers.get('content-type') || '';
      let data: any;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else if (contentType.includes('text/') || contentType.includes('xml')) {
        const xmlText = await response.text();
        // If response schema available and content is XML, parse it automatically
        if (responseSchema && contentType.includes('xml')) {
          data = parse(responseSchema, xmlText);
        } else {
          data = xmlText;
        }
      } else {
        data = await response.text();
      }

      // Return just the data (matching Speci's HttpAdapter interface)
      return data as TResponse;
    },
  };
}
