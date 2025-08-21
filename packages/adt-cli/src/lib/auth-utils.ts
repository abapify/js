// Standalone auth utilities for ADT CLI
// Based on @abapify/btp-service-key-parser

export interface UAACredentials {
  tenantmode: string;
  sburl: string;
  subaccountid: string;
  'credential-type': string;
  clientid: string;
  xsappname: string;
  clientsecret: string;
  serviceInstanceId: string;
  url: string;
  uaadomain: string;
  verificationkey: string;
  apiurl: string;
  identityzone: string;
  identityzoneid: string;
  tenantid: string;
  zoneid: string;
}

export interface Catalog {
  path: string;
  type: string;
}

export interface Binding {
  env: string;
  version: string;
  type: string;
  id: string;
}

export interface BTPServiceKey {
  uaa: UAACredentials;
  url: string;
  'sap.cloud.service': string;
  systemid: string;
  endpoints: Record<string, string>;
  catalogs: Record<string, Catalog>;
  binding: Binding;
  preserve_host_header: boolean;
}

export interface OAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  expires_at: Date;
}

export class ServiceKeyParser {
  static parse(serviceKeyJson: string | object): BTPServiceKey {
    let parsed: unknown;

    if (typeof serviceKeyJson === 'string') {
      try {
        parsed = JSON.parse(serviceKeyJson);
      } catch (error) {
        throw new Error('Invalid JSON format in service key');
      }
    } else {
      parsed = serviceKeyJson;
    }

    // Basic validation
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid service key format');
    }

    const serviceKey = parsed as any;

    if (!serviceKey.uaa || !serviceKey.url || !serviceKey.systemid) {
      throw new Error('Missing required fields in service key');
    }

    return serviceKey as BTPServiceKey;
  }
}

export async function fetchOAuthToken(
  serviceKey: BTPServiceKey
): Promise<OAuthToken> {
  const { uaa } = serviceKey;

  try {
    // Prepare OAuth 2.0 client credentials request
    const tokenUrl = `${uaa.url}/oauth/token`;
    const credentials = Buffer.from(
      `${uaa.clientid}:${uaa.clientsecret}`,
      'utf8'
    ).toString('base64');

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      let errorDetails;
      try {
        errorDetails = await response.json();
      } catch {
        errorDetails = {
          error: 'http_error',
          error_description: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
      throw new Error(
        `OAuth token request failed: ${errorDetails.error}${
          errorDetails.error_description
            ? ` - ${errorDetails.error_description}`
            : ''
        }`
      );
    }

    const tokenData = await response.json();

    if (!tokenData.access_token || !tokenData.expires_in) {
      throw new Error(
        'Invalid token response: missing access_token or expires_in'
      );
    }

    return {
      access_token: tokenData.access_token,
      token_type: tokenData.token_type || 'bearer',
      expires_in: tokenData.expires_in,
      scope: tokenData.scope || '',
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000),
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`OAuth token request failed: ${String(error)}`);
  }
}
