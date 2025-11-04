import {
  AdtConnectionConfig,
  RequestOptions,
  AdtClientError,
} from '../types/client.js';
import { AuthManager } from './auth-manager.js';
// import { ErrorHandler } from '../utils/error-handler.js'; // Removed unused import
import { createLogger } from '../utils/logger.js';

export class ConnectionManager {
  private authManager: AuthManager;
  private config?: AdtConnectionConfig;
  private cookies = new Map<string, string>();
  private debugMode = false;
  private logger: any;
  private connectionId?: string;
  private cachedCsrfToken?: string;

  constructor(logger?: any) {
    this.logger = logger || createLogger('connection');
    this.authManager = new AuthManager(
      this.logger.child({ component: 'auth' })
    );
    // Enable debug mode by default for troubleshooting
    this.debugMode = true;
  }

  async connect(config: AdtConnectionConfig): Promise<void> {
    this.config = config;
    // Connection is established lazily when first request is made
    // This allows the auth manager to handle authentication flow
  }

  /**
   * Generate a SAP ADT connection ID similar to what Eclipse ADT uses
   * Format: 32-character hex string (like UUID without dashes)
   */
  private generateConnectionId(): string {
    // Generate UUID and remove dashes to match SAP ADT format
    const uuid = crypto.randomUUID().replace(/-/g, '');
    return uuid;
  }

  /**
   * Ensure we have a connection ID for this session
   * Connection ID persists for the entire ADT client session
   */
  private ensureConnectionId(): string {
    if (!this.connectionId) {
      this.connectionId = this.generateConnectionId();
      this.debug(`🔗 Generated SAP ADT connection ID: ${this.connectionId}`);
    }
    return this.connectionId;
  }

  async disconnect(): Promise<void> {
    this.cookies.clear();
    this.cachedCsrfToken = undefined;
    this.config = undefined;
  }

  isConnected(): boolean {
    return !!this.config;
  }

  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  private debug(message: string): void {
    if (this.debugMode) {
      this.logger.debug(this.sanitizeForLogging(message));
    }
  }

  private sanitizeForLogging(message: string): string {
    return (
      message
        // Mask CSRF tokens (keep first 6 chars)
        .replace(/([A-Za-z0-9+/]{6})[A-Za-z0-9+/=]{10,}/g, '$1***')
        // Mask cookie values (keep cookie names but hide values)
        .replace(/(sap-[^=]+)=([^;,\s]+)/g, '$1=***')
        // Mask URLs to show only the path
        .replace(/https:\/\/[^/]+/g, 'https://***')
    );
  }

  async request(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<Response> {
    // Allow lazy initialization: if not explicitly connected, proceed using
    // authenticated session and sensible defaults. This enables CLI commands
    // (which set up AuthManager) to work without requiring connect().
    if (!this.config) {
      this.config = { retryAttempts: 2 } as AdtConnectionConfig;
    }

    const maxRetries = this.config.retryAttempts || 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const session = this.authManager.getAuthenticatedSession();
        const token = await this.authManager.getValidToken();

        // Get endpoint based on auth type
        let abapEndpoint: string;
        if (session.authType === 'basic' && session.basicAuth) {
          abapEndpoint = session.basicAuth.host;
        } else if (session.serviceKey) {
          abapEndpoint = session.serviceKey.endpoints?.['abap'] || session.serviceKey.url;
        } else {
          throw new Error('Invalid session: no endpoint information available');
        }

        const url = `${abapEndpoint}${endpoint}`;
        this.debug(`🌐 ${options.method || 'GET'} ${url}`);

        const headers: Record<string, string> = {
          Authorization: session.authType === 'basic' ? `Basic ${token}` : `Bearer ${token}`,
          Accept: 'application/xml',
          'X-sap-adt-sessiontype': 'stateful',
          ...options.headers,
        };

        // Add SAP client if available
        if (session.authType === 'basic' && session.basicAuth?.client) {
          headers['sap-client'] = session.basicAuth.client;
        }

        // Add SAP session headers from service key if available (OAuth only)
        if (session.authType === 'oauth' && session.serviceKey) {
          if (session.serviceKey['URL.headers.x-sap-security-session']) {
            headers['x-sap-security-session'] =
              session.serviceKey['URL.headers.x-sap-security-session'];
          } else {
            // Fallback to 'use' if not specified in service key
            headers['x-sap-security-session'] = 'use';
          }
        }

        // For POST/PUT/DELETE operations, we need CSRF token
        const method = options.method || 'GET';
        if (['POST', 'PUT', 'DELETE'].includes(method.toUpperCase())) {
          // Initialize CSRF token from session if not already cached
          if (!this.cachedCsrfToken) {
            await this.initializeCsrfToken(session, token);
          }
          if (this.cachedCsrfToken) {
            headers['x-csrf-token'] = this.cachedCsrfToken;
            this.debug(`🔒 Using cached CSRF token: ${this.cachedCsrfToken}`);
          }
        }

        // Add cookies if we have them
        if (this.cookies.size > 0) {
          const cookieHeader = Array.from(this.cookies.entries())
            .map(([name, value]) => `${name}=${value}`)
            .join('; ');
          headers.Cookie = cookieHeader;
        }

        // Debug logging after headers are complete
        this.debug(`📋 Headers: ${JSON.stringify(headers, null, 2)}`);
        if (options.body) {
          this.debug(`📦 Body: ${options.body}`);
        }

        const requestOptions: RequestInit = {
          method: options.method || 'GET',
          headers,
          body: options.body,
        };

        if (options.timeout) {
          const controller = new AbortController();
          setTimeout(() => controller.abort(), options.timeout);
          requestOptions.signal = controller.signal;
        }

        const response = await fetch(url, requestOptions);

        // Store cookies from response
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
          this.parseCookies(setCookieHeader);
        }

        this.debug(`📡 Response: ${response.status} ${response.statusText}`);

        // Log response body for debugging (both success and error)
        const responseText = await response.text();

        // Create a new Response object since we consumed the original body
        const responseClone = new Response(responseText, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });

        if (response.ok) {
          // Format XML response for better readability by adding line breaks before '<' symbols
          const formattedResponse = responseText.replace(/</g, '\n<').trim();
          this.debug(`📄 Success Response Body: ${formattedResponse}`);
        }

        if (!response.ok) {
          // Format XML response for better readability by adding line breaks before '<' symbols
          const formattedError = responseText.replace(/</g, '\n<').trim();
          this.debug(`📄 Error Response Body: ${formattedError}`);

          // Extract SAP error message from XML if available
          let errorMessage = `Request failed: ${response.status} ${response.statusText}`;
          try {
            // Try to extract the actual error message from SAP XML response
            const messageMatch = responseText.match(/<message[^>]*>([^<]+)</i);
            if (messageMatch && messageMatch[1]) {
              errorMessage = messageMatch[1].trim();
            }
          } catch {
            // If XML parsing fails, use the generic message
          }

          // Create enhanced error with full response details
          const enhancedError = this.createError(
            'system',
            errorMessage,
            response.status,
            undefined,
            {
              endpoint,
              response: responseText,
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries()),
            }
          );

          // On 403, clear session and CSRF cache, then retry if we haven't exhausted attempts
          if (response.status === 403 && attempt < maxRetries) {
            this.debug(
              `🔄 Got 403 on attempt ${attempt}, clearing session and CSRF cache, then retrying...`
            );
            this.cookies.clear();
            this.cachedCsrfToken = undefined; // Clear CSRF cache on 403
            lastError = enhancedError;
            continue; // Try again
          }

          throw enhancedError;
        }

        // Success - capture cookies for session management
        this.updateCookies(responseClone);
        return responseClone;
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          break;
        }

        // Wait before retry with exponential backoff
        const delay = Math.pow(2, attempt - 1) * 1000;
        this.debug(
          `⏳ Retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw (
      lastError || this.createError('network', 'Request failed after retries')
    );
  }

  private updateCookies(response: Response): void {
    const setCookieHeaders = response.headers.get('set-cookie');
    if (setCookieHeaders) {
      this.debug(`🍪 Raw set-cookie: ${setCookieHeaders}`);

      // Parse set-cookie header properly - split by comma but be careful of expires dates
      const cookieStrings = this.parseCookieHeader(setCookieHeaders);

      cookieStrings.forEach((cookieString) => {
        // Extract name=value pair (first part before semicolon)
        const nameValuePart = cookieString.split(';')[0].trim();
        const [name, value] = nameValuePart.split('=', 2);

        if (
          name &&
          value &&
          !name.includes('expires') &&
          !name.includes('path')
        ) {
          this.cookies.set(name.trim(), value.trim());
          this.debug(`🍪 Stored: ${name.trim()}=${value.trim()}`);
        }
      });

      this.debug(`🍪 Total cookies: ${this.cookies.size}`);
    }
  }

  private parseCookieHeader(setCookieHeader: string): string[] {
    // Split by comma, but be careful not to split on commas within expires dates
    const cookies: string[] = [];
    let current = '';
    let inExpires = false;

    for (let i = 0; i < setCookieHeader.length; i++) {
      const char = setCookieHeader[i];

      if (char === ',' && !inExpires) {
        if (current.trim()) {
          cookies.push(current.trim());
        }
        current = '';
      } else {
        current += char;

        // Track if we're inside an expires attribute
        if (current.toLowerCase().includes('expires=')) {
          inExpires = true;
        }

        // End of expires when we hit semicolon or end
        if (inExpires && (char === ';' || i === setCookieHeader.length - 1)) {
          inExpires = false;
        }
      }
    }

    if (current.trim()) {
      cookies.push(current.trim());
    }

    return cookies;
  }

  private parseCookies(setCookieHeader: string): void {
    // Keep the old method for backward compatibility
    this.updateCookies({ headers: { get: () => setCookieHeader } } as any);
  }

  /**
   * Initialize CSRF token from ADT sessions endpoint during session setup
   */
  private async initializeCsrfToken(
    session: any,
    token: string
  ): Promise<void> {
    // Get endpoint based on auth type
    let abapEndpoint: string;
    if (session.authType === 'basic' && session.basicAuth) {
      abapEndpoint = session.basicAuth.host;
    } else if (session.serviceKey) {
      abapEndpoint = session.serviceKey.endpoints?.['abap'] || session.serviceKey.url;
    } else {
      throw new Error('Invalid session: no endpoint information available');
    }
    const sessionsUrl = `${abapEndpoint}/sap/bc/adt/core/http/sessions`;

    this.debug(`🔒 Initializing CSRF token from sessions endpoint`);

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        // 'User-Agent': 'ADT-CLI/1.0.0', // Test: might not be needed
        'x-csrf-token': 'fetch',
        Accept: 'application/vnd.sap.adt.core.http.session.v3+xml',
        // 'sap-client': '100', // Test: might default from service key
        // 'sap-language': 'EN', // Test: might default from user profile
      };

      // Add session headers
      if (session.serviceKey['URL.headers.x-sap-security-session']) {
        headers['x-sap-security-session'] =
          session.serviceKey['URL.headers.x-sap-security-session'];
      } else {
        headers['x-sap-security-session'] = 'use';
      }

      // Include existing cookies if any
      if (this.cookies.size > 0) {
        const cookieString = Array.from(this.cookies.entries())
          .map(([name, value]) => `${name}=${value}`)
          .join('; ');
        headers['Cookie'] = cookieString;
        this.debug(
          `🍪 Sending cookies for CSRF initialization: ${cookieString}`
        );
      }

      const response = await fetch(sessionsUrl, {
        method: 'GET',
        headers,
      });

      this.debug(
        `🔒 Sessions CSRF response: ${response.status} ${response.statusText}`
      );

      if (!response.ok) {
        this.debug(`⚠️ Failed to initialize CSRF from sessions endpoint`);
        return;
      }

      // Update cookies from sessions response
      this.updateCookies(response);

      // Extract CSRF token from cookies (SAP stores it there)
      const xsrfCookie = Array.from(this.cookies.entries()).find(
        ([key]) => key.includes('XSRF') || key.includes('csrf')
      );

      if (xsrfCookie) {
        const cookieValue = xsrfCookie[1].split('=')[1];
        const decodedToken = decodeURIComponent(cookieValue || '');

        // Extract just the token part (before timestamp)
        const tokenMatch = decodedToken.match(/^([A-Za-z0-9+/_-]+=*)/);
        const actualToken = tokenMatch ? tokenMatch[1] : decodedToken;

        if (
          actualToken &&
          actualToken !== 'Required' &&
          actualToken !== 'fetch'
        ) {
          this.cachedCsrfToken = actualToken;
          this.debug(
            `✅ CSRF token initialized from sessions endpoint: ${actualToken}`
          );
          return;
        }
      }

      // Fallback to header token
      const headerToken = response.headers.get('x-csrf-token');
      if (
        headerToken &&
        headerToken !== 'Required' &&
        headerToken !== 'fetch'
      ) {
        this.cachedCsrfToken = headerToken;
        this.debug(
          `✅ CSRF token initialized from sessions header: ${headerToken}`
        );
        return;
      }

      this.debug(`⚠️ No valid CSRF token found in sessions response`);
    } catch (error) {
      this.debug(
        `❌ CSRF initialization failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Get CSRF token for POST/PUT/DELETE operations - enhanced version from working implementation
   * @deprecated Use initializeCsrfToken instead for better architecture
   */
  private async getCsrfToken(
    endpoint: string,
    session: any,
    token: string
  ): Promise<string | null> {
    // Get endpoint based on auth type
    let abapEndpoint: string;
    if (session.authType === 'basic' && session.basicAuth) {
      abapEndpoint = session.basicAuth.host;
    } else if (session.serviceKey) {
      abapEndpoint = session.serviceKey.endpoints?.['abap'] || session.serviceKey.url;
    } else {
      throw new Error('Invalid session: no endpoint information available');
    }

    // Try different endpoints to get CSRF token
    const csrfEndpoints = [endpoint, '/sap/bc/adt/compatibility/graph'];

    for (const csrfEndpoint of csrfEndpoints) {
      try {
        const fullUrl = `${abapEndpoint}${csrfEndpoint}`;
        this.debug(`🔒 Trying CSRF fetch from: ${csrfEndpoint}`);

        // GET request to fetch CSRF token
        const headers: Record<string, string> = {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'ADT-CLI/1.0.0',
          'x-csrf-token': 'fetch',
          Accept: 'application/xml',
          'sap-client': '100',
          'sap-language': 'EN',
          'x-sap-security-session': 'use',
          'X-sap-adt-sessiontype': 'stateful',
        };

        // Add cookies for session management
        if (this.cookies.size > 0) {
          const cookieString = Array.from(this.cookies.values()).join('; ');
          headers['Cookie'] = cookieString;
          this.debug(`🍪 Sending cookies for CSRF fetch: ${cookieString}`);
        }

        const response = await fetch(fullUrl, {
          method: 'GET',
          headers,
        });

        this.debug(
          `🔒 CSRF response: ${response.status} ${response.statusText}`
        );

        // If we get 403 during CSRF fetch, continue to next endpoint
        if (response.status === 403) {
          this.debug('🔄 Got 403 during CSRF fetch, trying next endpoint...');
          continue;
        }

        // Update cookies from CSRF response
        this.updateCookies(response);

        // Extract CSRF token from cookies (SAP stores it there)
        const xsrfCookie = Array.from(this.cookies.entries()).find(
          ([key]) => key.includes('XSRF') || key.includes('csrf')
        );

        if (xsrfCookie) {
          const cookieValue = xsrfCookie[1].split('=')[1];
          const decodedToken = decodeURIComponent(cookieValue || '');
          this.debug(`🔒 CSRF cookie value: ${decodedToken}`);

          // Extract just the token part (before timestamp)
          const tokenMatch = decodedToken.match(/^([A-Za-z0-9+/_-]+=*)/);
          const actualToken = tokenMatch ? tokenMatch[1] : decodedToken;
          this.debug(`🔒 CSRF token extracted: ${actualToken}`);

          if (
            actualToken &&
            actualToken !== 'Required' &&
            actualToken !== 'fetch'
          ) {
            this.debug(`✅ CSRF token obtained from cookie`);
            return actualToken;
          }
        }

        // Fallback to header token
        const headerToken = response.headers.get('x-csrf-token');
        if (
          headerToken &&
          headerToken !== 'Required' &&
          headerToken !== 'fetch'
        ) {
          this.debug(`✅ CSRF token obtained from header`);
          return headerToken;
        }
      } catch (error) {
        this.debug(
          `❌ CSRF fetch failed from ${csrfEndpoint}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        continue; // Try next endpoint
      }
    }

    this.debug('❌ Failed to obtain valid CSRF token');
    return null;
  }

  private createError(
    category: AdtClientError['category'],
    message: string,
    statusCode?: number,
    adtErrorCode?: string,
    context?: Record<string, unknown>
  ): AdtClientError {
    const error = new Error(message) as AdtClientError;
    (error as any).category = category;
    if (statusCode) (error as any).statusCode = statusCode;
    if (adtErrorCode) (error as any).adtErrorCode = adtErrorCode;
    if (context) (error as any).context = context;
    return error;
  }
}
