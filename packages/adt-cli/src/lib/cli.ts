#!/usr/bin/env -S npx tsx

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { homedir } from 'os';
import { Command } from 'commander';
import {
  ServiceKeyParser,
  fetchOAuthToken,
  BTPServiceKey,
  OAuthToken,
} from './auth-utils';

// Auth session storage
const AUTH_CONFIG_DIR = join(homedir(), '.adt');
const AUTH_CONFIG_FILE = join(AUTH_CONFIG_DIR, 'config.json');

interface AuthSession {
  serviceKey: BTPServiceKey;
  token?: OAuthToken;
}

class AuthManager {
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

  async login(serviceKeyPath: string): Promise<void> {
    const filePath = resolve(serviceKeyPath);

    if (!existsSync(filePath)) {
      throw new Error(`Service key file not found: ${filePath}`);
    }

    const serviceKeyJson = readFileSync(filePath, 'utf8');
    const serviceKey = ServiceKeyParser.parse(serviceKeyJson);

    console.log(`🔧 System ID: ${serviceKey.systemid}`);
    console.log(
      `🌐 ABAP Endpoint: ${serviceKey.endpoints['abap'] || serviceKey.url}`
    );
    console.log('🔄 Fetching OAuth token...');

    const token = await fetchOAuthToken(serviceKey);

    const session: AuthSession = {
      serviceKey,
      token: {
        ...token,
        expires_at: token.expires_at,
      },
    };

    this.saveSession(session);
    console.log('✅ Successfully logged in!');
  }

  logout(): void {
    this.clearSession();
    console.log('✅ Successfully logged out!');
  }

  getAuthenticatedSession(): AuthSession {
    const session = this.loadSession();
    if (!session) {
      throw new Error(
        'Not authenticated. Run "adt auth login --file <service-key>" first.'
      );
    }

    if (session.token && session.token.expires_at < new Date()) {
      throw new Error(
        'Token expired. Please login again with "adt auth login --file <service-key>".'
      );
    }

    return session;
  }

  async getValidToken(): Promise<string> {
    const session = this.getAuthenticatedSession();

    // Check if token is expired or about to expire (refresh 1 minute early)
    const now = new Date();
    const expiresAt = new Date(session.token!.expires_at);
    const refreshThreshold = new Date(now.getTime() + 60000); // 1 minute

    if (expiresAt <= refreshThreshold) {
      console.log('🔄 Token expired, refreshing...');
      const newToken = await fetchOAuthToken(session.serviceKey);
      session.token = {
        ...newToken,
        expires_at: newToken.expires_at,
      };
      this.saveSession(session);
    }

    return session.token!.access_token;
  }
}

const authManager = new AuthManager();

// Create main program
export function createCLI(): Command {
  const program = new Command();

  program
    .name('adt')
    .description('ADT CLI tool for managing SAP ADT services')
    .version('1.0.0');

  // Auth commands
  const authCmd = program
    .command('auth')
    .description('Authentication commands');

  authCmd
    .command('login')
    .description('Login with ADT service key')
    .requiredOption('-f, --file <path>', 'Path to ADT service key JSON file')
    .action(async (options) => {
      try {
        await authManager.login(options.file);
      } catch (error) {
        console.error(
          '❌ Login failed:',
          error instanceof Error ? error.message : String(error)
        );
        process.exit(1);
      }
    });

  authCmd
    .command('logout')
    .description('Logout from ADT')
    .action(() => {
      try {
        authManager.logout();
      } catch (error) {
        console.error(
          '❌ Logout failed:',
          error instanceof Error ? error.message : String(error)
        );
        process.exit(1);
      }
    });

  // Discovery command
  program
    .command('discovery')
    .description('Discover ADT services and features')
    .action(async () => {
      try {
        const session = authManager.getAuthenticatedSession();
        const token = await authManager.getValidToken();

        const abapEndpoint =
          session.serviceKey.endpoints['abap'] || session.serviceKey.url;
        const discoveryUrl = `${abapEndpoint}/sap/bc/adt/discovery`;

        console.log(`🔍 Discovering ADT services from: ${discoveryUrl}`);

        const response = await fetch(discoveryUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/xml',
          },
        });

        if (!response.ok) {
          throw new Error(
            `Discovery request failed: ${response.status} ${response.statusText}`
          );
        }

        const xmlContent = await response.text();
        console.log('\n📋 ADT Discovery Response:');
        console.log('='.repeat(50));
        console.log(xmlContent);
      } catch (error) {
        console.error(
          '❌ Discovery failed:',
          error instanceof Error ? error.message : String(error)
        );
        process.exit(1);
      }
    });

  return program;
}

// Main execution function
export async function main(): Promise<void> {
  const program = createCLI();
  await program.parseAsync(process.argv);
}
