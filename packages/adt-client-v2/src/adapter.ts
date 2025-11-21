/**
 * ADT HTTP Adapter with Basic Authentication
 *
 * Implements the Speci HttpAdapter interface for ADT communication.
 * Automatically handles XML parsing/building based on schema in contract metadata.
 */

import { parse, build as tsxmlBuild, type ElementSchema } from './base';
import type { AdtConnectionConfig } from './types';
import type {
  HttpAdapter as SpeciHttpAdapter,
  HttpRequestOptions,
} from 'speci/rest';
import type { ResponsePlugin, ResponseContext } from './plugins/types';
import { SessionManager } from './utils/session';

/**
 * Type-safe wrapper for build that accepts unknown body
 * The schema validates the structure at runtime
 */
function buildXml(schema: ElementSchema, data: unknown): string {
  // @ts-expect-error - ts-xml's build has overly strict types, but validates at runtime
  return tsxmlBuild(schema, data);
}

/**
 * HTTP Adapter - uses speci's standard interface
 */
export type HttpAdapter = SpeciHttpAdapter;

/**
 * Extended ADT connection config with plugins
 */
export interface AdtAdapterConfig extends AdtConnectionConfig {
  /** Response plugins for intercepting and transforming responses */
  plugins?: ResponsePlugin[];
}

/**
 * Create ADT HTTP adapter with Basic Authentication and plugin support
 */
export function createAdtAdapter(config: AdtAdapterConfig): HttpAdapter {
  const {
    baseUrl,
    username,
    password,
    client,
    language,
    plugins = [],
  } = config;

  // Create Basic Auth header
  const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString(
    'base64'
  )}`;

  // Create session manager for stateful sessions
  const sessionManager = new SessionManager();

  return {
    async request<TResponse = unknown>(
      options: HttpRequestOptions
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
        'X-sap-adt-sessiontype': sessionManager.getSessionTypeHeader(),
        ...sessionManager.getRequestHeaders(options.method),
        ...options.headers,
      };

      // Get schemas from speci's standard fields
      // Check if bodySchema is an ElementSchema (has 'tag' and 'fields' properties)
      let bodySchema: ElementSchema | undefined;
      if (
        options.bodySchema &&
        typeof options.bodySchema === 'object' &&
        'tag' in options.bodySchema &&
        'fields' in options.bodySchema
      ) {
        bodySchema = options.bodySchema as ElementSchema;
      }

      // Extract response schema from responses object (passed by speci)
      let responseSchema: ElementSchema | undefined;
      if (options.responses) {
        const schema200 = options.responses[200];
        // Check if it's an ElementSchema (has 'tag' and 'fields' properties)
        if (
          schema200 &&
          typeof schema200 === 'object' &&
          'tag' in schema200 &&
          'fields' in schema200
        ) {
          responseSchema = schema200 as ElementSchema;
        }
      }

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

      // Process response for session management (cookies, CSRF)
      sessionManager.processResponse(response);

      // Check for HTTP errors
      if (!response.ok) {
        // On 403, clear session and let caller retry
        if (response.status === 403) {
          sessionManager.clear();
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Parse response
      const contentType = response.headers.get('content-type') || '';
      const rawText = await response.text();
      let data: any;

      // Check for JSON content (including vendor-specific types like application/vnd.sap.*+json)
      if (contentType.includes('application/json') || contentType.includes('+json')) {
        data = JSON.parse(rawText);
      } else if (contentType.includes('text/') || contentType.includes('xml')) {
        // If response schema available and content is XML, parse it automatically
        if (responseSchema && contentType.includes('xml')) {
          data = parse(responseSchema, rawText);
        } else {
          data = rawText;
        }
      } else {
        data = rawText;
      }

      // Apply plugins if any
      if (plugins.length > 0) {
        const context: ResponseContext = {
          rawText,
          parsedData: data,
          schema: responseSchema,
          url: url.toString(),
          method: options.method,
          contentType,
        };

        // Run plugins in sequence
        for (const plugin of plugins) {
          const result = await plugin.process(context);
          // Plugin can modify the data
          if (result !== undefined) {
            data = result;
            context.parsedData = result;
          }
        }
      }

      // Return just the data (matching Speci's HttpAdapter interface)
      return data as TResponse;
    },
  };
}
