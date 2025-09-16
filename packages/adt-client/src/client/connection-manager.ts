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

  async disconnect(): Promise<void> {
    this.cookies.clear();
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

        const abapEndpoint =
          session.serviceKey.endpoints['abap'] || session.serviceKey.url;

        const url = `${abapEndpoint}${endpoint}`;
        this.debug(`🌐 ${options.method || 'GET'} ${url}`);

        const headers: Record<string, string> = {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'ADT-CLI/1.0.0',
          Accept: 'application/xml',
          'sap-client': '100',
          'sap-language': 'EN',
          'X-sap-adt-sessiontype': 'stateful',
          ...options.headers,
        };

        // Add SAP session headers from service key if available
        if (session.serviceKey['URL.headers.x-sap-security-session']) {
          headers['x-sap-security-session'] =
            session.serviceKey['URL.headers.x-sap-security-session'];
        } else {
          // Fallback to 'use' if not specified in service key
          headers['x-sap-security-session'] = 'use';
        }

        // For POST/PUT/DELETE operations, we need CSRF token
        const method = options.method || 'GET';
        if (['POST', 'PUT', 'DELETE'].includes(method.toUpperCase())) {
          const csrfToken = await this.getCsrfToken(endpoint, session, token);
          if (csrfToken) {
            headers['x-csrf-token'] = csrfToken;
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

        if (!response.ok) {
          const errorText = await response.text();

          // On 403, clear session and retry if we haven't exhausted attempts
          if (response.status === 403 && attempt < maxRetries) {
            this.debug(
              `🔄 Got 403 on attempt ${attempt}, clearing session and retrying...`
            );
            this.cookies.clear();
            lastError = this.createError(
              'system',
              `Request failed: ${response.status} ${response.statusText}`,
              response.status,
              undefined,
              { endpoint, response: errorText }
            );
            continue; // Try again
          }

          throw this.createError(
            'system',
            `Request failed: ${response.status} ${response.statusText}`,
            response.status,
            undefined,
            { endpoint, response: errorText }
          );
        }

        // Success - capture cookies for session management
        this.updateCookies(response);
        return response;
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
   * Get CSRF token for POST/PUT/DELETE operations - enhanced version from working implementation
   */
  private async getCsrfToken(
    endpoint: string,
    session: any,
    token: string
  ): Promise<string | null> {
    const abapEndpoint =
      session.serviceKey.endpoints['abap'] || session.serviceKey.url;

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
