/**
 * ADT HTTP Adapter with Basic Authentication
 *
 * Implements the Speci HttpAdapter interface for ADT communication.
 * Automatically handles XML parsing/building based on schema in contract metadata.
 */

import { parse, build as tsxmlBuild, type ElementSchema } from './base';
import { parse as tsxsdParse, type XsdSchema } from 'ts-xsd';
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
  /** 
   * Callback when session expires (SAML redirect detected)
   * Return new cookie header to retry the request, or throw to abort
   */
  onSessionExpired?: () => Promise<string>;
}

/**
 * Create ADT HTTP adapter with Basic or SAML Authentication and plugin support
 */
export function createAdtAdapter(config: AdtAdapterConfig): HttpAdapter {
  const {
    baseUrl,
    username,
    password,
    cookieHeader,
    client,
    language,
    logger,
    plugins = [],
    onSessionExpired,
  } = config;

  // Determine auth method
  const isSamlAuth = !!cookieHeader;

  // Create Basic Auth header (if not using SAML)
  const authHeader = isSamlAuth
    ? undefined
    : `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

  // Create session manager for stateful sessions
  const sessionManager = new SessionManager(logger);

  // Inject SAML cookie if provided
  if (cookieHeader) {
    sessionManager.injectCookie(cookieHeader);
  }

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
        'X-sap-adt-sessiontype': sessionManager.getSessionTypeHeader(),
        ...sessionManager.getRequestHeaders(options.method),
        ...options.headers,
      };

      // Add Authorization header only for Basic Auth
      if (authHeader) {
        headers.Authorization = authHeader;
      }

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
      let xsdSchema: XsdSchema | undefined;
      let serializableSchema: { parse: (xml: string) => unknown } | undefined;
      if (options.responses) {
        const schema200 = options.responses[200];
        logger?.debug('Schema detection:', {
          hasSchema: !!schema200,
          type: typeof schema200,
          keys: schema200 && typeof schema200 === 'object' ? Object.keys(schema200) : [],
        });
        // Check if it's a Serializable schema (has 'parse' method)
        if (
          schema200 &&
          typeof schema200 === 'object' &&
          'parse' in schema200 &&
          typeof schema200.parse === 'function'
        ) {
          serializableSchema = schema200 as { parse: (xml: string) => unknown };
        }
        // Check if it's an ElementSchema (ts-xml: has 'tag' and 'fields' properties)
        else if (
          schema200 &&
          typeof schema200 === 'object' &&
          'tag' in schema200 &&
          'fields' in schema200
        ) {
          responseSchema = schema200 as ElementSchema;
        }
        // Check if it's an XsdSchema (ts-xsd: has 'root' and 'elements' properties)
        else if (
          schema200 &&
          typeof schema200 === 'object' &&
          'root' in schema200 &&
          'elements' in schema200
        ) {
          xsdSchema = schema200 as XsdSchema;
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
      logger?.debug(`HTTP ${options.method} ${url.toString()}`);
      const response = await fetch(url.toString(), {
        method: options.method,
        headers,
        body: requestBody,
      });

      // Process response for session management (cookies, CSRF)
      sessionManager.processResponse(response);

      // Check for HTTP errors
      if (!response.ok) {
        const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        logger?.error(`Request failed - ${errorMsg} (${options.method} ${url.toString()})`);

        // On 403, clear session and let caller retry
        if (response.status === 403) {
          sessionManager.clear();
          logger?.warn('Session cleared due to 403 Forbidden response');
        }
        throw new Error(errorMsg);
      }

      // Parse response
      const contentType = response.headers.get('content-type') || '';
      const rawText = await response.text();

      // Detect SAML redirect (server returns 200 OK with HTML containing SAMLRequest form)
      // This happens when the session cookie has expired
      if (contentType.includes('text/html') && rawText.includes('SAMLRequest')) {
        sessionManager.clear();
        logger?.warn('SAML redirect detected - session expired');
        
        // If callback provided, try to re-authenticate and retry the request
        if (onSessionExpired) {
          logger?.info('Attempting automatic re-authentication...');
          try {
            const newCookie = await onSessionExpired();
            sessionManager.injectCookie(newCookie);
            logger?.info('Re-authentication successful, retrying request...');
            // Retry the request with new cookie
            return this.request(options);
          } catch (refreshError) {
            logger?.error('Re-authentication failed');
            throw new Error('Session expired - re-authentication failed');
          }
        }
        
        throw new Error('Session expired - SAML re-authentication required');
      }
      let data: any;

      // Check for JSON content (including vendor-specific types like application/vnd.sap.*+json)
      if (contentType.includes('application/json') || contentType.includes('+json')) {
        data = JSON.parse(rawText);
      } else if (contentType.includes('text/') || contentType.includes('xml')) {
        // If serializable schema available (has parse method), use it
        if (serializableSchema && contentType.includes('xml')) {
          data = serializableSchema.parse(rawText);
        }
        // If ts-xml ElementSchema available and content is XML, parse it automatically
        else if (responseSchema && contentType.includes('xml')) {
          data = parse(responseSchema, rawText);
        }
        // If ts-xsd XsdSchema available and content is XML, parse it automatically
        else if (xsdSchema && contentType.includes('xml')) {
          data = tsxsdParse(xsdSchema, rawText);
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
