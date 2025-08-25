import { AuthManager } from './auth-manager';

export interface ADTRequestOptions {
  headers?: Record<string, string>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: string;
}

export class ADTClient {
  private cookies = new Map<string, string>();
  private debugMode: boolean = false;

  constructor(private authManager: AuthManager) {}

  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  private debug(message: string): void {
    if (this.debugMode) {
      console.log(this.sanitizeForLogging(message));
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
        .replace(/https:\/\/[^\/]+/g, 'https://***')
    );
  }

  async request(
    endpoint: string,
    options: ADTRequestOptions = {}
  ): Promise<Response> {
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const session = this.authManager.getAuthenticatedSession();
        const token = await this.authManager.getValidToken();

        const abapEndpoint =
          session.serviceKey.endpoints['abap'] || session.serviceKey.url;
        const fullUrl = `${abapEndpoint}${endpoint}`;

        const defaultHeaders: Record<string, string> = {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'ADT-CLI/1.0.0',
          Accept: 'application/xml',
          'sap-client': '100',
          'sap-language': 'EN',
          'X-sap-adt-sessiontype': 'stateful',
        };

        // Add cookies for session management
        if (this.cookies.size > 0) {
          const cookieString = Array.from(this.cookies.values()).join('; ');
          defaultHeaders['Cookie'] = cookieString;
          this.debug(`🍪 Sending cookies: ${cookieString}`);
        }

        const response = await fetch(fullUrl, {
          method: options.method || 'GET',
          headers: {
            ...defaultHeaders,
            ...options.headers,
          },
          body: options.body,
        });

        if (!response.ok) {
          const errorBody = await response.text();
          const errorMessage = `ADT request failed: ${response.status} ${
            response.statusText
          }\nURL: ${fullUrl}\nResponse: ${errorBody.substring(0, 500)}`;

          // On 403, clear session and retry if we haven't exhausted attempts
          if (response.status === 403 && attempt < maxRetries) {
            this.debug(
              `🔄 Got 403 on attempt ${attempt}, clearing session and retrying...`
            );
            this.cookies.clear();
            lastError = new Error(errorMessage);
            continue; // Try again
          }

          throw new Error(errorMessage);
        }

        // Success - capture cookies for session management
        this.updateCookies(response);
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Only retry on 403 errors
        if (attempt < maxRetries && lastError.message.includes('403')) {
          this.debug(`🔄 Error on attempt ${attempt}, retrying...`);
          this.cookies.clear();
          continue;
        }

        // If we've exhausted retries or it's not a 403, throw
        throw lastError;
      }
    }

    // This should never be reached, but just in case
    throw lastError || new Error('Request failed after all retries');
  }

  async get(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<string> {
    const response = await this.request(endpoint, { method: 'GET', headers });
    return response.text();
  }

  async post(
    endpoint: string,
    body: string,
    headers?: Record<string, string>,
    debug?: boolean
  ): Promise<string> {
    if (debug !== undefined) {
      this.debugMode = debug;
    }

    this.debug(`🔄 POST to: ${endpoint}`);

    // Get CSRF token from the target endpoint
    const csrfToken = await this.fetchCsrfToken(endpoint, false);

    // Make POST request with CSRF token - retry logic is in request()
    const response = await this.request(endpoint, {
      method: 'POST',
      body,
      headers: {
        ...headers,
        'x-csrf-token': csrfToken,
      },
    });

    return response.text();
  }

  private async fetchCsrfToken(
    endpoint: string,
    clearSession: boolean = false
  ): Promise<string> {
    const session = this.authManager.getAuthenticatedSession();
    const token = await this.authManager.getValidToken();
    const abapEndpoint =
      session.serviceKey.endpoints['abap'] || session.serviceKey.url;

    // If requested, clear session first
    if (clearSession) {
      this.debug('🔄 Clearing session for fresh CSRF token...');
      this.cookies.clear();
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

        // If we get 403 during CSRF fetch, that's unusual but continue to next endpoint
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

    throw new Error('Failed to obtain valid CSRF token');
  }

  private updateCookies(response: Response): void {
    const setCookieHeaders = response.headers.get('set-cookie');
    if (setCookieHeaders) {
      this.debug(`🍪 Raw set-cookie: ${setCookieHeaders}`);

      const cookies = setCookieHeaders.split(',');
      cookies.forEach((cookie) => {
        const cleaned = cookie
          .replace(/path=\/,/g, '')
          .replace(/path=\//g, '')
          .split(';')[0];
        const [key] = cookie.split('=', 1);
        if (key) {
          this.cookies.set(key.trim(), cleaned.trim());
          this.debug(`🍪 Stored: ${key.trim()}`);
        }
      });

      this.debug(`🍪 Total cookies: ${this.cookies.size}`);
    }
  }

  async getCurrentUser(): Promise<string> {
    // Check if user is already cached in session
    const cachedUser = this.authManager.getCurrentUser();
    if (cachedUser) {
      this.debug(`👤 Using cached user: ${cachedUser}`);
      return cachedUser;
    }

    this.debug('👤 Detecting current user from metadata endpoint...');
    try {
      // Get metadata with correct content type
      const httpResponse = await this.request(
        '/sap/bc/adt/cts/transportrequests/searchconfiguration/metadata',
        {
          method: 'GET',
          headers: {
            Accept: 'application/vnd.sap.adt.configuration.metadata.v1+xml',
          },
        }
      );

      const response = await httpResponse.text();
      this.debug(
        `📋 Metadata response (${response.length} chars): ${response.substring(
          0,
          500
        )}...`
      );
      // Parse the response to extract the actual user
      const userMatch = response.match(
        /<configuration:property key="User"[^>]*>([^<]+)</
      );
      if (userMatch && userMatch[1]) {
        const detectedUser = userMatch[1].trim();
        this.debug(`👤 Current user detected: ${detectedUser}`);

        // Save user to persistent session
        this.authManager.saveCurrentUser(detectedUser);
        return detectedUser;
      }

      // No user found in metadata response
      throw new Error('Could not detect current user from metadata response');
    } catch (error) {
      this.debug(
        `❌ Error detecting current user: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
      throw new Error(
        `Failed to detect current user: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}
