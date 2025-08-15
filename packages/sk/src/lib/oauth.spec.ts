import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchOAuthToken } from './oauth';
import { BTPServiceKey } from './types';

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
  const mockFetch = vi.fn();

  beforeEach(() => {
    global.fetch = mockFetch;
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

    expect(mockFetch).toHaveBeenCalledOnce();
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

  it('should handle HTTP error responses', async () => {
    const mockErrorResponse = {
      error: 'invalid_client',
      error_description: 'Client authentication failed',
    };

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => mockErrorResponse,
    });

    await expect(fetchOAuthToken(mockServiceKey)).rejects.toThrow(
      'OAuth token request failed: invalid_client - Client authentication failed'
    );
  });

  it('should handle HTTP error without JSON response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => {
        throw new Error('Not JSON');
      },
    });

    await expect(fetchOAuthToken(mockServiceKey)).rejects.toThrow(
      'OAuth token request failed: http_error - HTTP 500: Internal Server Error'
    );
  });

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(fetchOAuthToken(mockServiceKey)).rejects.toThrow(
      'Network error'
    );
  });

  it('should handle invalid token response', async () => {
    const mockInvalidResponse = {
      // Missing required fields
      some_field: 'value',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockInvalidResponse,
    });

    await expect(fetchOAuthToken(mockServiceKey)).rejects.toThrow(
      'Invalid OAuth token response: missing required fields'
    );
  });

  it('should use correct Basic Auth credentials', async () => {
    const mockTokenResponse = {
      access_token: 'mock-token',
      token_type: 'bearer',
      expires_in: 3600,
      scope: 'test',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTokenResponse,
    });

    await fetchOAuthToken(mockServiceKey);

    const expectedCredentials = Buffer.from(
      'mock-client-id:mock-client-secret'
    ).toString('base64');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Basic ${expectedCredentials}`,
        }),
      })
    );
  });

  it('should calculate expiration time correctly', async () => {
    const mockTokenResponse = {
      access_token: 'mock-token',
      token_type: 'bearer',
      expires_in: 7200, // 2 hours
      scope: 'test',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTokenResponse,
    });

    const beforeTime = Date.now();
    const result = await fetchOAuthToken(mockServiceKey);
    const afterTime = Date.now();

    const expectedExpirationMin = beforeTime + 7200 * 1000;
    const expectedExpirationMax = afterTime + 7200 * 1000;

    expect(result.expires_at.getTime()).toBeGreaterThanOrEqual(
      expectedExpirationMin
    );
    expect(result.expires_at.getTime()).toBeLessThanOrEqual(
      expectedExpirationMax
    );
  });
});
