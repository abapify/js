import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createServer } from 'http';
import { parse as parseUrl } from 'url';
import open from 'open';

import {
  BTPServiceKey,
  OAuthToken,
  ServiceKeyParser,
} from '../utils/auth-utils.js';
import {
  generateCodeVerifier,
  generateCodeChallenge,
} from '../utils/oauth-utils.js';
import { generateState } from '../utils/oauth-utils.js';
import { createLogger } from '../utils/logger.js';

const AUTH_CONFIG_DIR = resolve(
  process.env.HOME || process.env.USERPROFILE || '.',
  '.adt'
);
const AUTH_CONFIG_FILE = resolve(AUTH_CONFIG_DIR, 'auth.json');
const OAUTH_REDIRECT_URI = 'http://localhost:3000/callback';
const OAUTH_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const CALLBACK_SERVER_PORT = 3000;

interface AuthSession {
  serviceKey: BTPServiceKey;
  token?: OAuthToken;
  currentUser?: string;
}

export class AuthManager {
  private logger: any;

  constructor(logger?: any) {
    this.logger = logger || createLogger('auth');
  }

  private session: AuthSession | null = null;

  loadSession(): AuthSession | null {
    if (!existsSync(AUTH_CONFIG_FILE)) {
      return null;
    }

    try {
      const config = JSON.parse(readFileSync(AUTH_CONFIG_FILE, 'utf8'));
      if (config.token?.expires_at) {
        config.token.expires_at = new Date(config.token.expires_at);
      }
      this.session = config;
      return this.session;
    } catch {
      return null;
    }
  }

  saveSession(session: AuthSession): void {
    try {
      if (!existsSync(AUTH_CONFIG_DIR)) {
        require('fs').mkdirSync(AUTH_CONFIG_DIR, { recursive: true });
      }
      writeFileSync(AUTH_CONFIG_FILE, JSON.stringify(session, null, 2));
      this.session = session;
    } catch (error) {
      throw new Error(`Failed to save auth session: ${error}`);
    }
  }

  clearSession(): void {
    if (existsSync(AUTH_CONFIG_FILE)) {
      require('fs').unlinkSync(AUTH_CONFIG_FILE);
    }
    this.session = null;
  }

  getCurrentUser(): string | null {
    if (!this.session) {
      this.loadSession();
    }
    if (!this.session) {
      return null;
    }
    return this.session.currentUser || null;
  }

  saveCurrentUser(user: string): void {
    if (!this.session) {
      throw new Error('No active session to save user to');
    }
    this.session.currentUser = user;
    this.saveSession(this.session);
  }

  async login(serviceKeyPath: string): Promise<void> {
    const filePath = resolve(serviceKeyPath);

    if (!existsSync(filePath)) {
      throw new Error(`Service key file not found: ${filePath}`);
    }

    const serviceKeyJson = readFileSync(filePath, 'utf8');
    const serviceKey = ServiceKeyParser.parse(serviceKeyJson);

    this.logger.info('System connection', { systemId: serviceKey.systemid });

    // Generate PKCE parameters
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();

    // Build authorization URL
    const authUrl = new URL(`${serviceKey.uaa.url}/oauth/authorize`);
    authUrl.searchParams.set('client_id', serviceKey.uaa.clientid);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', OAUTH_REDIRECT_URI);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('scope', 'openid'); // Use default scopes

    this.logger.info('Opening browser for authentication');

    const token = await this.performBrowserAuth(
      serviceKey,
      authUrl.toString(),
      state,
      codeVerifier
    );

    const session: AuthSession = {
      serviceKey,
      token,
    };

    this.saveSession(session);
    this.logger.info('Successfully logged in');
  }

  private async performBrowserAuth(
    serviceKey: BTPServiceKey,
    authUrl: string,
    expectedState: string,
    codeVerifier: string
  ): Promise<OAuthToken> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | null = null;

      const server = createServer(async (req, res) => {
        try {
          const url = parseUrl(req.url || '', true);

          // Only handle /callback path
          if (url.pathname !== '/callback') {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
            return;
          }

          const query = url.query;

          if (query.error) {
            throw new Error(
              `OAuth error: ${query.error} - ${query.error_description}`
            );
          }

          if (query.state !== expectedState) {
            throw new Error('State mismatch - possible CSRF attack');
          }

          if (!query.code) {
            throw new Error('No authorization code received');
          }

          // Exchange code for tokens
          const tokenResponse = await fetch(
            `${serviceKey.uaa.url}/oauth/token`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(
                  `${serviceKey.uaa.clientid}:${serviceKey.uaa.clientsecret}`
                ).toString('base64')}`,
              },
              body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: query.code as string,
                redirect_uri: OAUTH_REDIRECT_URI,
                code_verifier: codeVerifier,
              }),
            }
          );

          if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            throw new Error(
              `Token exchange failed: ${tokenResponse.status} ${tokenResponse.statusText} - ${errorText}`
            );
          }

          const tokenSet = await tokenResponse.json();

          const token: OAuthToken = {
            access_token: tokenSet.access_token,
            token_type: tokenSet.token_type || 'bearer',
            expires_in: tokenSet.expires_in,
            scope: tokenSet.scope || '',
            refresh_token: tokenSet.refresh_token,
            expires_at: new Date(Date.now() + tokenSet.expires_in * 1000),
          };

          // Send success response
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <html>
              <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h2>✅ Authentication Successful!</h2>
                <p>You can close this tab and return to the terminal.</p>
                <script>setTimeout(() => window.close(), 2000);</script>
              </body>
            </html>
          `);

          // Clear timeout and close server immediately after sending response
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          server.closeAllConnections?.();
          server.close(() => {
            resolve(token);
          });
        } catch (error) {
          this.logger.error('Authentication failed', {
            error: error instanceof Error ? error.message : String(error),
          });

          // Send error response
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <html>
              <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h2>❌ Authentication Failed</h2>
                <p>Error: ${
                  error instanceof Error ? error.message : String(error)
                }</p>
              </body>
            </html>
          `);

          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          server.closeAllConnections?.();
          server.close(() => {
            reject(error);
          });
        }
      });

      server.listen(CALLBACK_SERVER_PORT, () => {
        this.logger.info(
          `OAuth server started on http://localhost:${CALLBACK_SERVER_PORT}`
        );

        console.log('🌐 Opening browser for authentication...\n');
        console.log("🔗 If browser doesn't open automatically, please visit:");
        console.log(`   ${authUrl}\n`);

        // Open browser - use app.name with BROWSER env var if available
        const openOptions = process.env.BROWSER
          ? { app: { name: process.env.BROWSER } }
          : {};

        open(authUrl, openOptions)
          .then(() => {
            console.log('✅ Browser opened successfully');
          })
          .catch((err) => {
            this.logger.warn('Could not open browser automatically', {
              url: authUrl.toString(),
              error: err.message,
            });

            console.log('❌ Failed to open browser automatically');
            console.log(
              '🔗 Please manually open the URL above in your browser\n'
            );
          });
      });

      // Ensure server can be closed forcefully if needed
      server.on('error', (err: any) => {
        this.logger.error('Server error', { error: err.message });
        reject(err);
      });

      // Timeout after 5 minutes
      timeoutId = setTimeout(() => {
        this.logger.warn('Authentication timed out after 5 minutes');
        server.close(() => {
          reject(new Error('Authentication timed out'));
        });
      }, OAUTH_TIMEOUT_MS);
    });
  }

  logout(): void {
    this.clearSession();
    this.logger.info('Successfully logged out');
  }

  getAuthenticatedSession(): AuthSession {
    const session = this.loadSession();
    if (!session) {
      throw new Error(
        'Not authenticated. Run "adt auth login --file <service-key>" first.'
      );
    }

    // Don't throw here for expired tokens - let getValidToken handle refresh
    return session;
  }

  async getValidToken(): Promise<string> {
    const session = this.getAuthenticatedSession();

    // Check if token is expired or about to expire (refresh 1 minute early)
    const now = new Date();
    const expiresAt = new Date(session.token!.expires_at);
    const refreshThreshold = new Date(now.getTime() + 60000); // 1 minute

    if (expiresAt <= refreshThreshold) {
      this.logger.info('Token expired, re-authenticating automatically');

      try {
        const newToken = await this.reAuthenticate(session.serviceKey);
        session.token = newToken;
        this.saveSession(session);
        this.logger.info('Re-authentication successful');
        return newToken.access_token;
      } catch (reAuthError) {
        throw new Error(
          'Authentication failed. Please run "adt auth login --file <service-key>" to login again.'
        );
      }
    }

    return session.token!.access_token;
  }

  private async reAuthenticate(serviceKey: BTPServiceKey): Promise<OAuthToken> {
    // Generate new PKCE parameters
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();

    // Build authorization URL
    const authUrl = new URL(`${serviceKey.uaa.url}/oauth/authorize`);
    authUrl.searchParams.set('client_id', serviceKey.uaa.clientid);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', OAUTH_REDIRECT_URI);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('scope', 'openid'); // Use default scopes

    this.logger.info('Opening browser for re-authentication');

    return this.performBrowserAuth(
      serviceKey,
      authUrl.toString(),
      state,
      codeVerifier
    );
  }
}
