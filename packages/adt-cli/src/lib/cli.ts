#!/usr/bin/env -S npx tsx

import { Command } from 'commander';
import { writeFileSync } from 'fs';
import { AuthManager } from './auth-manager';
import { parseDiscoveryXml } from './discovery-parser';

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
    .option('-o, --output <file>', 'Save discovery XML to file')
    .action(async (options) => {
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

        // Handle output file
        if (options.output) {
          const isJsonOutput = options.output.toLowerCase().endsWith('.json');

          if (isJsonOutput) {
            // Parse and save as JSON
            try {
              const discoveryData = parseDiscoveryXml(xmlContent);
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
              writeFileSync(
                options.output.replace('.json', '.xml'),
                xmlContent,
                'utf8'
              );
            }
          } else {
            // Save raw XML
            writeFileSync(options.output, xmlContent, 'utf8');
            console.log(`💾 Discovery XML saved to: ${options.output}`);
          }
        } else {
          // No output file - parse and display
          try {
            const discoveryData = parseDiscoveryXml(xmlContent);
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
          } catch (parseError) {
            console.log('⚠️  Could not parse discovery XML');
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

  return program;
}

// Main execution function
export async function main(): Promise<void> {
  const program = createCLI();
  await program.parseAsync(process.argv);
}
