import { BTPServiceKey } from './types';

export interface OAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  expires_at: Date;
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
