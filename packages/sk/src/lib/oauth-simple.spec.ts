import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchOAuthToken } from './oauth-simple';
import { BTPServiceKey } from './types';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock service key for testing
const mockServiceKey: BTPServiceKey = {
  uaa: {
    tenantmode: 'dedicated',
    sburl:
      'https://internal-xsuaa.authentication.mock-region.hana.ondemand.com',
    subaccountid: '12345678-1234-4678-babc-def012345678',
    'credential-type': 'binding-secret',
    clientid: 'mock-client-id',
    xsappname: 'mock-xsappname',
    clientsecret: 'mock-client-secret',
    serviceInstanceId: '12345678-1234-4678-babc-def012345679',
    url: 'https://mock-tenant.authentication.mock-region.hana.ondemand.com',
    uaadomain: 'authentication.mock-region.hana.ondemand.com',
    verificationkey:
      '-----BEGIN PUBLIC KEY-----\nMOCKKEY\n-----END PUBLIC KEY-----',
    apiurl: 'https://api.authentication.mock-region.hana.ondemand.com',
    identityzone: 'mock-identity-zone',
    identityzoneid: '12345678-1234-4678-babc-def012345678',
    tenantid: '12345678-1234-4678-babc-def012345678',
    zoneid: '12345678-1234-4678-babc-def012345678',
  },
  url: 'https://mock-system-uuid.abap.mock-region.hana.ondemand.com',
  'sap.cloud.service': 'com.sap.cloud.abap',
  systemid: 'MCK',
  endpoints: {
    abap: 'https://mock-system-uuid.abap.mock-region.hana.ondemand.com',
  },
  catalogs: {
    abap: {
      path: '/sap/opu/odata/IWFND/CATALOGSERVICE;v=2',
      type: 'sap_abap_catalog_v1',
    },
  },
  binding: {
    env: 'cf',
    version: '1.0.1.1',
    type: 'oauth',
    id: 'mock-binding-id-1234-5678-9abc',
  },
  preserve_host_header: true,
};

describe('fetchOAuthToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully fetch OAuth token', async () => {
    const mockTokenResponse = {
      access_token: 'mock-access-token-12345',
      token_type: 'bearer',
      expires_in: 3600,
      scope: 'uaa.resource',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTokenResponse,
    });

    const result = await fetchOAuthToken(mockServiceKey);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://mock-tenant.authentication.mock-region.hana.ondemand.com/oauth/token',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('Basic '),
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        }),
        body: 'grant_type=client_credentials',
      })
    );

    expect(result.access_token).toBe('mock-access-token-12345');
    expect(result.token_type).toBe('bearer');
    expect(result.expires_in).toBe(3600);
    expect(result.scope).toBe('uaa.resource');
    expect(result.expires_at).toBeInstanceOf(Date);
    expect(result.expires_at.getTime()).toBeGreaterThan(Date.now());
  });

  it('should handle missing token response fields', async () => {
    const mockTokenResponse = {
      // Missing access_token
      token_type: 'bearer',
      expires_in: 3600,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTokenResponse,
    });

    await expect(fetchOAuthToken(mockServiceKey)).rejects.toThrow(
      'Invalid token response: missing access_token or expires_in'
    );
  });

  it('should handle HTTP errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({
        error: 'invalid_client',
        error_description: 'Client credentials invalid',
      }),
    });

    await expect(fetchOAuthToken(mockServiceKey)).rejects.toThrow(
      'OAuth token request failed: invalid_client - Client credentials invalid'
    );
  });

  it('should provide default values for optional fields', async () => {
    const mockTokenResponse = {
      access_token: 'mock-token',
      expires_in: 3600,
      // Missing token_type and scope
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTokenResponse,
    });

    const result = await fetchOAuthToken(mockServiceKey);

    expect(result.token_type).toBe('bearer'); // Default value
    expect(result.scope).toBe(''); // Default value
  });
});
