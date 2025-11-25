/**
 * SAP Secure Login Client (SLC) authentication method
 * 
 * Uses SLC Web Adapter as HTTP proxy for authentication
 */

import https from 'https';
import { ProxyAgent } from 'proxy-agent';
import type { AuthMethod } from './base';
import type {
  SlcAuth,
  SlcCredentials,
  ConnectionTestResult,
} from '../types';

export class SlcAuthMethod implements AuthMethod<SlcAuth, SlcCredentials> {
  readonly name = 'slc';

  async authenticate(config: SlcAuth): Promise<SlcCredentials> {
    // Validate configuration
    if (!config.credentials.baseUrl) {
      throw new Error('baseUrl is required');
    }
    if (!config.credentials.slcProxy) {
      throw new Error('slcProxy configuration is required');
    }
    if (!config.credentials.slcProxy.host || !config.credentials.slcProxy.port) {
      throw new Error('slcProxy.host and slcProxy.port are required');
    }

    // Test connection before returning credentials
    const testResult = await this.testConnection(config.credentials);
    if (!testResult.success) {
      throw new Error(
        `SLC authentication failed: ${testResult.error || 'Unknown error'}`
      );
    }

    // Return credentials for storage
    return config.credentials;
  }

  async test(credentials: SlcCredentials): Promise<ConnectionTestResult> {
    return this.testConnection(credentials);
  }

  private async testConnection(
    credentials: SlcCredentials
  ): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      try {
        // Build test URL
        const url = new URL('/sap/bc/adt/core/http/sessions', credentials.baseUrl);
        if (credentials.client) {
          url.searchParams.set('sap-client', credentials.client);
        }
        if (credentials.language) {
          url.searchParams.set('sap-language', credentials.language);
        }

        // Create proxy agent
        const proxyUrl = `http://${credentials.slcProxy.host}:${credentials.slcProxy.port}`;
        const agent = new ProxyAgent(proxyUrl);

        const requestOptions: https.RequestOptions = {
          method: 'GET',
          headers: {
            Accept: 'application/xml',
            'X-sap-adt-sessiontype': 'stateful',
          },
          agent,
        };

        const req = https.request(url, requestOptions, (res) => {
          const responseTime = Date.now() - startTime;

          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve({
              success: true,
              responseTime,
            });
          } else {
            resolve({
              success: false,
              responseTime,
              error: `HTTP ${res.statusCode}: ${res.statusMessage}`,
            });
          }

          // Consume response to free up memory
          res.resume();
        });

        req.on('error', (error) => {
          const responseTime = Date.now() - startTime;
          resolve({
            success: false,
            responseTime,
            error: error.message,
          });
        });

        req.on('timeout', () => {
          req.destroy();
          const responseTime = Date.now() - startTime;
          resolve({
            success: false,
            responseTime,
            error: 'Connection timeout',
          });
        });

        // Set timeout (30 seconds)
        req.setTimeout(30000);

        req.end();
      } catch (error) {
        const responseTime = Date.now() - startTime;
        resolve({
          success: false,
          responseTime,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });
  }
}
