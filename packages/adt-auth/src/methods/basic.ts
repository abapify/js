import * as https from 'https';
import type { AuthMethod } from './base';
import type {
  BasicAuth,
  BasicCredentials,
  ConnectionTestResult,
} from '../types';

export class BasicAuthMethod implements AuthMethod<BasicAuth, BasicCredentials> {
  readonly name = 'basic';

  async authenticate(config: BasicAuth): Promise<BasicCredentials> {
    if (!config.credentials.baseUrl) {
      throw new Error('baseUrl is required for basic authentication');
    }
    if (!config.credentials.username) {
      throw new Error('username is required for basic authentication');
    }
    if (!config.credentials.password) {
      throw new Error('password is required for basic authentication');
    }

    const testResult = await this.testConnection(config.credentials);
    if (!testResult.success) {
      throw new Error(`Authentication failed: ${testResult.error || 'Unknown error'}`);
    }

    return config.credentials;
  }

  async test(credentials: BasicCredentials): Promise<ConnectionTestResult> {
    return this.testConnection(credentials);
  }

  private async testConnection(credentials: BasicCredentials): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      try {
        const url = new URL('/sap/bc/adt/core/http/sessions', credentials.baseUrl);
        if (credentials.client) {
          url.searchParams.set('sap-client', credentials.client);
        }
        if (credentials.language) {
          url.searchParams.set('sap-language', credentials.language);
        }

        const authHeader = `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}`;

        const requestOptions: https.RequestOptions = {
          method: 'GET',
          headers: {
            Authorization: authHeader,
            Accept: 'application/xml',
            'X-sap-adt-sessiontype': 'stateful',
          },
          rejectUnauthorized: !credentials.insecure,
        };

        const req = https.request(url, requestOptions, (res) => {
          const responseTime = Date.now() - startTime;

          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve({ success: true, responseTime });
          } else {
            resolve({ success: false, responseTime, error: `HTTP ${res.statusCode}: ${res.statusMessage}` });
          }
          res.resume();
        });

        req.on('error', (error) => {
          resolve({ success: false, responseTime: Date.now() - startTime, error: error.message });
        });

        req.on('timeout', () => {
          req.destroy();
          resolve({ success: false, responseTime: Date.now() - startTime, error: 'Connection timeout' });
        });

        req.setTimeout(30000);
        req.end();
      } catch (error) {
        resolve({ success: false, responseTime: Date.now() - startTime, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });
  }
}
