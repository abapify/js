#!/usr/bin/env -S npx tsx

import { Command } from 'commander';
import { AuthManager } from './auth-manager';

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
            Accept: 'application/atomsvc+xml', // Correct Accept header for ADT discovery
            'User-Agent': 'ADT-CLI/1.0.0',
          },
        });

        console.log(
          `📊 Response status: ${response.status} ${response.statusText}`
        );

        if (!response.ok) {
          const errorBody = await response.text();
          console.log('❌ Error response:', errorBody.substring(0, 500));
          throw new Error(
            `Discovery request failed: ${response.status} ${response.statusText}`
          );
        }

        const xmlContent = await response.text();
        console.log(
          `📄 Received ${xmlContent.length} bytes of ADT discovery XML`
        );
        console.log('✅ ADT discovery successful!');

        // Parse and show key services (optional - for better UX)
        if (xmlContent.includes('<app:workspace>')) {
          console.log('🎯 ADT workspace discovered successfully');
        }
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
