import { AuthManager } from './auth-manager';

export interface ADTRequestOptions {
  headers?: Record<string, string>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: string;
}

export class ADTClient {
  constructor(private authManager: AuthManager) {}

  async request(
    endpoint: string,
    options: ADTRequestOptions = {}
  ): Promise<Response> {
    const session = this.authManager.getAuthenticatedSession();
    const token = await this.authManager.getValidToken();

    const abapEndpoint =
      session.serviceKey.endpoints['abap'] || session.serviceKey.url;
    const fullUrl = `${abapEndpoint}${endpoint}`;

    const defaultHeaders = {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'ADT-CLI/1.0.0',
      Accept: 'application/xml',
    };

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
      throw new Error(
        `ADT request failed: ${response.status} ${
          response.statusText
        }\nURL: ${fullUrl}\nResponse: ${errorBody.substring(0, 500)}`
      );
    }

    return response;
  }

  async get(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<string> {
    const response = await this.request(endpoint, {
      method: 'GET',
      headers,
    });
    return response.text();
  }

  async post(
    endpoint: string,
    body: string,
    headers?: Record<string, string>
  ): Promise<string> {
    const response = await this.request(endpoint, {
      method: 'POST',
      body,
      headers,
    });
    return response.text();
  }
}
