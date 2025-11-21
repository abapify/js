/**
 * Session Management for SAP ADT
 *
 * Handles stateful sessions with cookie management and CSRF token caching.
 * Separated into testable modules for better maintainability.
 */

/**
 * Cookie Store - Manages HTTP cookies for stateful sessions
 */
export class CookieStore {
  private cookies = new Map<string, string>();

  /**
   * Parse Set-Cookie header and store cookies
   * Handles complex cookie strings with expires dates
   */
  parseCookies(setCookieHeader: string): void {
    const cookieStrings = this.splitCookieHeader(setCookieHeader);

    for (const cookieString of cookieStrings) {
      // Extract name=value pair (first part before semicolon)
      const nameValuePart = cookieString.split(';')[0].trim();
      const [name, value] = nameValuePart.split('=', 2);

      // Store only valid cookies (ignore metadata like expires, path)
      if (
        name &&
        value &&
        !name.includes('expires') &&
        !name.includes('path')
      ) {
        this.cookies.set(name.trim(), value.trim());
      }
    }
  }

  /**
   * Split Set-Cookie header by commas, avoiding splitting on expires dates
   */
  private splitCookieHeader(setCookieHeader: string): string[] {
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

  /**
   * Get Cookie header value for requests
   */
  getCookieHeader(): string | undefined {
    if (this.cookies.size === 0) {
      return undefined;
    }

    return Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }

  /**
   * Check if we have any cookies
   */
  hasCookies(): boolean {
    return this.cookies.size > 0;
  }

  /**
   * Clear all cookies
   */
  clear(): void {
    this.cookies.clear();
  }

  /**
   * Get all cookies as a map (for testing/debugging)
   */
  getAll(): Map<string, string> {
    return new Map(this.cookies);
  }
}

/**
 * CSRF Token Manager - Handles CSRF token caching and initialization
 */
export class CsrfTokenManager {
  private cachedToken?: string;

  /**
   * Extract CSRF token from cookies (SAP stores it there)
   */
  extractFromCookies(cookies: Map<string, string>): string | undefined {
    // Find CSRF/XSRF cookie
    const xsrfEntry = Array.from(cookies.entries()).find(([key]) =>
      key.toLowerCase().includes('xsrf') || key.toLowerCase().includes('csrf')
    );

    if (!xsrfEntry) {
      return undefined;
    }

    // Decode cookie value
    const cookieValue = xsrfEntry[1];
    const decodedToken = decodeURIComponent(cookieValue);

    // Extract just the token part (before timestamp if present)
    const tokenMatch = decodedToken.match(/^([A-Za-z0-9+/_-]+=*)/);
    const actualToken = tokenMatch ? tokenMatch[1] : decodedToken;

    // Validate token (ignore placeholder values)
    if (
      actualToken &&
      actualToken !== 'Required' &&
      actualToken !== 'fetch' &&
      actualToken !== 'Fetch'
    ) {
      return actualToken;
    }

    return undefined;
  }

  /**
   * Extract CSRF token from response header
   */
  extractFromHeader(headerValue: string | null): string | undefined {
    if (
      !headerValue ||
      headerValue === 'Required' ||
      headerValue === 'fetch' ||
      headerValue === 'Fetch'
    ) {
      return undefined;
    }

    return headerValue;
  }

  /**
   * Cache a CSRF token
   */
  cache(token: string): void {
    this.cachedToken = token;
  }

  /**
   * Get cached CSRF token
   */
  getCached(): string | undefined {
    return this.cachedToken;
  }

  /**
   * Clear cached CSRF token (e.g., on 403 errors)
   */
  clear(): void {
    this.cachedToken = undefined;
  }

  /**
   * Check if we have a cached token
   */
  hasCached(): boolean {
    return !!this.cachedToken;
  }
}

/**
 * Session Manager - Orchestrates cookies and CSRF tokens
 */
export class SessionManager {
  private cookieStore = new CookieStore();
  private csrfManager = new CsrfTokenManager();

  /**
   * Process response to update session state
   * Extracts cookies and CSRF tokens
   */
  processResponse(response: Response): void {
    // Update cookies
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      this.cookieStore.parseCookies(setCookieHeader);
    }

    // Try to extract and cache CSRF token from header
    const csrfHeader = response.headers.get('x-csrf-token');
    const csrfToken = this.csrfManager.extractFromHeader(csrfHeader);
    if (csrfToken) {
      this.csrfManager.cache(csrfToken);
    }

    // Try to extract CSRF from cookies if not in header
    if (!csrfToken && this.cookieStore.hasCookies()) {
      const cookieCsrf = this.csrfManager.extractFromCookies(
        this.cookieStore.getAll()
      );
      if (cookieCsrf) {
        this.csrfManager.cache(cookieCsrf);
      }
    }
  }

  /**
   * Get headers for next request
   */
  getRequestHeaders(method: string): Record<string, string> {
    const headers: Record<string, string> = {};

    // Add cookies if we have any
    const cookieHeader = this.cookieStore.getCookieHeader();
    if (cookieHeader) {
      headers.Cookie = cookieHeader;
    }

    // Add CSRF token for write operations
    const needsCsrf = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(
      method.toUpperCase()
    );
    if (needsCsrf) {
      const cachedToken = this.csrfManager.getCached();
      if (cachedToken) {
        headers['x-csrf-token'] = cachedToken;
      } else {
        // Request CSRF token if we don't have one
        headers['x-csrf-token'] = 'Fetch';
      }
    }

    return headers;
  }

  /**
   * Initialize CSRF token by making a preflight request
   * Should be called before first write operation
   *
   * NOTE: This method is kept for backward compatibility and non-contract usage.
   * For contract-based usage, use the sessionsContract from adt/core/http/sessions.contract
   */
  async initializeCsrf(
    baseUrl: string,
    authHeader: string,
    client?: string,
    language?: string
  ): Promise<boolean> {
    const url = new URL('/sap/bc/adt/core/http/sessions', baseUrl);

    if (client) {
      url.searchParams.append('sap-client', client);
    }
    if (language) {
      url.searchParams.append('sap-language', language);
    }

    const headers: Record<string, string> = {
      Authorization: authHeader,
      'x-csrf-token': 'Fetch',
      Accept: 'application/vnd.sap.adt.core.http.session.v3+xml',
      'X-sap-adt-sessiontype': 'stateful',
    };

    // Include existing cookies if any
    const cookieHeader = this.cookieStore.getCookieHeader();
    if (cookieHeader) {
      headers.Cookie = cookieHeader;
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        return false;
      }

      // Process response to extract cookies and CSRF
      this.processResponse(response);

      return this.csrfManager.hasCached();
    } catch {
      return false;
    }
  }

  /**
   * Clear all session state (cookies and CSRF)
   */
  clear(): void {
    this.cookieStore.clear();
    this.csrfManager.clear();
  }

  /**
   * Get session type header value
   * SAP ADT requires 'stateful' for operations that need session persistence
   */
  getSessionTypeHeader(): string {
    return 'stateful';
  }
}
