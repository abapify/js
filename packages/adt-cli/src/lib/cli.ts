#!/usr/bin/env -S npx tsx

import { Command } from 'commander';
import { writeFileSync } from 'fs';
import { AuthManager } from './auth-manager';
import { ADTClient } from './adt-client';
import { TransportService } from './services/transport';
import { DiscoveryService } from './services/discovery';

const authManager = new AuthManager();
const adtClient = new ADTClient(authManager);

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
    .option('-o, --output <file>', 'Save discovery XML to file')
    .action(async (options) => {
      try {
        const discoveryService = new DiscoveryService(adtClient);

        // Handle output file
        if (options.output) {
          const isJsonOutput = options.output.toLowerCase().endsWith('.json');

          if (isJsonOutput) {
            // Parse and save as JSON
            try {
              const discoveryData = await discoveryService.getDiscovery();
              writeFileSync(
                options.output,
                JSON.stringify(discoveryData, null, 2),
                'utf8'
              );
              console.log(
                `💾 Discovery data saved as JSON to: ${options.output}`
              );
            } catch (parseError) {
              console.log('⚠️  Could not parse XML, saving raw XML instead');
              const xmlContent = await adtClient.get('/sap/bc/adt/discovery', {
                Accept: 'application/atomsvc+xml',
              });
              writeFileSync(
                options.output.replace('.json', '.xml'),
                xmlContent,
                'utf8'
              );
            }
          } else {
            // Save raw XML
            const xmlContent = await adtClient.get('/sap/bc/adt/discovery', {
              Accept: 'application/atomsvc+xml',
            });
            writeFileSync(options.output, xmlContent, 'utf8');
            console.log(`💾 Discovery XML saved to: ${options.output}`);
          }
        } else {
          // No output file - parse and display
          const discoveryData = await discoveryService.getDiscovery();
          console.log('\n📋 Available ADT Services:');

          for (const workspace of discoveryData.workspaces) {
            console.log(`\n📁 ${workspace.title}`);
            for (const collection of workspace.collections) {
              console.log(`  └─ ${collection.title} (${collection.href})`);
              if (collection.category) {
                console.log(`     Category: ${collection.category.term}`);
              }
              if (
                collection.templateLinks &&
                collection.templateLinks.length > 0
              ) {
                console.log(
                  `     Templates: ${collection.templateLinks.length} available`
                );
              }
            }
          }
        }
      } catch (error) {
        console.error(
          '❌ Discovery failed:',
          error instanceof Error ? error.message : String(error)
        );
        process.exit(1);
      }
    });

  // Transport commands
  const transportCmd = program
    .command('transport')
    .alias('tr')
    .description('Transport request management');

  transportCmd
    .command('list')
    .description('List transport requests')
    .option('-u, --user <user>', 'Filter by user')
    .option('-s, --status <status>', 'Filter by status (modifiable, released)')
    .option('-m, --max <number>', 'Maximum number of results', '50')
    .option('--debug', 'Show debug output for parsing')
    .action(async (options) => {
      try {
        const transportService = new TransportService(adtClient);

        const filters = {
          user: options.user,
          status: options.status,
          maxResults: parseInt(options.max),
          debug: options.debug,
        };

        const result = await transportService.listTransports(filters);

        console.log(
          `\n📋 Found ${result.transports.length} transport requests:`
        );

        if (result.transports.length === 0) {
          console.log('No transport requests found.');
          return;
        }

        for (const transport of result.transports) {
          console.log(`\n🚛 ${transport.number}`);
          console.log(`   Description: ${transport.description}`);
          console.log(`   Status: ${transport.status}`);
          console.log(`   Owner: ${transport.owner}`);
          console.log(`   Created: ${transport.created.toLocaleDateString()}`);
          if (transport.target) {
            console.log(`   Target: ${transport.target}`);
          }
          if (transport.tasks && transport.tasks.length > 0) {
            console.log(`   Tasks: ${transport.tasks.length}`);
          }
        }
      } catch (error) {
        console.error(
          '❌ Failed to list transport requests:',
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
