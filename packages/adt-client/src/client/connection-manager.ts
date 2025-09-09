import {
  AdtConnectionConfig,
  RequestOptions,
  AdtClientError,
} from '../types/client.js';
import { AuthManager } from './auth-manager.js';
import { ErrorHandler } from '../utils/error-handler.js';
import { createLogger } from '../utils/logger.js';

export class ConnectionManager {
  private authManager: AuthManager;
  private config?: AdtConnectionConfig;
  private cookies = new Map<string, string>();
  private debugMode: boolean = false;
  private logger: any;

  constructor(logger?: any) {
    this.logger = logger || createLogger('connection');
    this.authManager = new AuthManager(
      this.logger.child({ component: 'auth' })
    );
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
        .replace(/https:\/\/[^\/]+/g, 'https://***')
    );
  }

  async request(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<Response> {
    if (!this.config) {
      throw this.createError(
        'connection',
        'Not connected. Call connect() first.'
      );
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
          Accept: 'application/xml,application/json,text/plain,*/*',
          'Content-Type': 'application/xml',
          ...options.headers,
        };

        // Add cookies if we have them
        if (this.cookies.size > 0) {
          const cookieHeader = Array.from(this.cookies.entries())
            .map(([name, value]) => `${name}=${value}`)
            .join('; ');
          headers.Cookie = cookieHeader;
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
          throw this.createError(
            'system',
            `Request failed: ${response.status} ${response.statusText}`,
            response.status,
            undefined,
            { endpoint, response: errorText }
          );
        }

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

  private parseCookies(setCookieHeader: string): void {
    const cookies = setCookieHeader.split(',');
    for (const cookie of cookies) {
      const [nameValue] = cookie.split(';');
      const [name, value] = nameValue.split('=');
      if (name && value) {
        this.cookies.set(name.trim(), value.trim());
      }
    }
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
