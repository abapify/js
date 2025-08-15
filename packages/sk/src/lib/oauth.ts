import { BTPServiceKey } from './types';

export interface OAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  expires_at: Date;
}

export interface OAuthError {
  error: string;
  error_description?: string;
}

export async function fetchOAuthToken(
  serviceKey: BTPServiceKey
): Promise<OAuthToken> {
  const { uaa } = serviceKey;

  // Prepare the request
  const tokenUrl = `${uaa.url}/oauth/token`;
  const credentials = Buffer.from(
    `${uaa.clientid}:${uaa.clientsecret}`
  ).toString('base64');

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
  });

  try {
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
      let errorDetails: OAuthError;
      try {
        errorDetails = (await response.json()) as OAuthError;
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

    // Validate required fields
    if (
      !tokenData.access_token ||
      !tokenData.token_type ||
      !tokenData.expires_in
    ) {
      throw new Error('Invalid OAuth token response: missing required fields');
    }

    // Calculate expiration timestamp
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    return {
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      scope: tokenData.scope || '',
      expires_at: expiresAt,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`OAuth token request failed: ${String(error)}`);
  }
}
