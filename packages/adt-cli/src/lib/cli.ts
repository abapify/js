#!/usr/bin/env -S npx tsx

import { Command } from 'commander';
import { writeFileSync } from 'fs';
import { AuthManager } from './auth-manager';
import { ADTClient } from './adt-client';
import { TransportService } from './services/transport';
import { DiscoveryService } from './services/discovery';
import { ImportService } from './services/import/service';
import { SearchService } from './services/search/service';
import { IconRegistry } from './utils/icon-registry';

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

  // Search command
  program
    .command('search [searchTerm]')
    .description('Search ABAP objects using ADT Repository Information System')
    .option('-p, --package <package>', 'Filter by package name')
    .option(
      '-t, --object-type <type>',
      'Filter by object type (CLAS, INTF, PROG, etc.)'
    )
    .option('-m, --max-results <number>', 'Maximum number of results', '100')
    .option('--no-description', 'Exclude descriptions from results')
    .option('--debug', 'Enable debug output', false)
    .action(async (searchTerm, options) => {
      try {
        const searchService = new SearchService(adtClient);

        console.log(`🔍 Searching ABAP objects...`);

        const searchOptions = {
          operation: 'quickSearch' as const,
          query: searchTerm,
          packageName: options.package,
          objectType: options.objectType,
          maxResults: parseInt(options.maxResults),
          noDescription: options.noDescription,
          debug: options.debug,
        };

        const result = await searchService.searchObjects(searchOptions);

        if (result.objects.length === 0) {
          console.log('No objects found matching the search criteria.');
          return;
        }

        console.log(`\n📋 Found ${result.totalCount} objects:\n`);

        // Group by object type for better display
        const groupedObjects = result.objects.reduce((groups, obj) => {
          const type = obj.type;
          if (!groups[type]) groups[type] = [];
          groups[type].push(obj);
          return groups;
        }, {} as Record<string, typeof result.objects>);

        for (const [objectType, objects] of Object.entries(groupedObjects)) {
          const icon = IconRegistry.getIcon(objectType);
          console.log(`${icon} ${objectType} (${objects.length} objects):`);
          for (const obj of objects) {
            console.log(`   ${obj.name}`);
            if (obj.description) {
              console.log(`     📝 ${obj.description}`);
            }
            console.log(`     📦 Package: ${obj.packageName}`);
            if (options.debug) {
              console.log(`     🔗 URI: ${obj.uri}`);
            }
            console.log();
          }
        }
      } catch (error) {
        console.error(
          `❌ Search failed:`,
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

  transportCmd
    .command('get')
    .description('Get detailed information about a specific transport request')
    .argument('<tr-number>', 'Transport request number')
    .option('--objects', 'Include objects in the transport')
    .option('--tasks', 'Include detailed task information')
    .option('--full', 'Show everything (objects + tasks)')
    .option('--json', 'Output as JSON')
    .option('--debug', 'Show debug output for parsing')
    .action(async (trNumber, options) => {
      try {
        const transportService = new TransportService(adtClient);

        console.log(`🚚 Fetching transport request: ${trNumber}`);
        const result = await transportService.getTransport(trNumber, {
          includeObjects: options.objects || options.full,
          includeTasks: options.tasks || options.full,
          debug: options.debug,
        });

        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        // Check if requested number is a task, not the main transport
        const isTask = result.transport.number !== trNumber;
        const requestedTask = isTask
          ? result.transport.tasks?.find((t) => t.number === trNumber)
          : null;

        if (isTask && requestedTask) {
          // Display task information
          console.log(`\n📋 Task: ${requestedTask.number}`);
          console.log(`   Description: ${requestedTask.description}`);
          console.log(`   Status: ${requestedTask.status}`);
          console.log(`   Owner: ${requestedTask.owner}`);
          console.log(`   Created: ${requestedTask.created.toLocaleString()}`);
          console.log(`   Type: ${requestedTask.type}`);
          console.log(
            `   Parent Transport: ${result.transport.number} (${result.transport.description})`
          );
        } else {
          // Display transport request information
          console.log(`\n🚛 Transport Request: ${result.transport.number}`);
          console.log(`   Description: ${result.transport.description}`);
          console.log(`   Status: ${result.transport.status}`);
          console.log(`   Owner: ${result.transport.owner}`);
          console.log(
            `   Created: ${result.transport.created.toLocaleString()}`
          );
          if (result.transport.target) {
            console.log(`   Target: ${result.transport.target}`);
          }
        }

        // Only show tasks section for transport requests, not when viewing individual tasks
        if (!isTask) {
          if (
            result.transport.tasks &&
            result.transport.tasks.length > 0 &&
            (options.tasks || options.full)
          ) {
            console.log(`\n📋 Tasks (${result.transport.tasks.length}):`);
            for (const task of result.transport.tasks) {
              console.log(`   └─ ${task.number} (${task.type})`);
              console.log(`      Description: ${task.description}`);
              console.log(`      Owner: ${task.owner}`);
              console.log(`      Status: ${task.status}`);
            }
          } else if (
            result.transport.tasks &&
            result.transport.tasks.length > 0
          ) {
            console.log(`   Tasks: ${result.transport.tasks.length}`);
          }
        }

        // Objects would be displayed here when --objects or --full is used
        if (options.objects || options.full) {
          console.log(`\n📦 Objects:`);
          console.log(`   (Object list not yet implemented)`);
        }
      } catch (error) {
        console.error(
          '❌ Failed to get transport request:',
          error instanceof Error ? error.message : String(error)
        );
        process.exit(1);
      }
    });

  transportCmd
    .command('create')
    .description('Create a new transport request')
    .option(
      '-d, --description <description>',
      'Transport description (required)'
    )
    .option(
      '-t, --type <type>',
      'Transport type: K (Workbench) or W (Customizing)',
      'K'
    )
    .option('--target <target>', 'Target system', 'LOCAL')
    .option('--project <project>', 'CTS project name')
    .option('--owner <owner>', 'Task owner (defaults to current user)')
    .option('--json', 'Output as JSON')
    .option('--debug', 'Show debug output')
    .action(async (options) => {
      try {
        if (!options.description) {
          console.error(
            '❌ Description is required. Use -d or --description option.'
          );
          process.exit(1);
        }

        const transportService = new TransportService(adtClient);

        console.log(`🚚 Creating transport request: "${options.description}"`);

        const result = await transportService.createTransport({
          description: options.description,
          type: options.type,
          target: options.target,
          project: options.project,
          owner: options.owner,
          debug: options.debug,
        });

        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        console.log(`\n✅ Transport request created successfully!`);
        console.log(`\n🚛 Transport Request: ${result.transport.number}`);
        console.log(`   Description: ${result.transport.description}`);
        console.log(`   Status: ${result.transport.status}`);
        console.log(`   Owner: ${result.transport.owner}`);
        console.log(`   Type: ${result.transport.type || 'K'}`);
        console.log(`   Target: ${result.transport.target || 'LOCAL'}`);

        console.log(`\n📋 Task: ${result.task.number}`);
        console.log(`   Description: ${result.task.description}`);
        console.log(`   Owner: ${result.task.owner}`);
        console.log(`   Type: ${result.task.type}`);
      } catch (error) {
        console.error(
          '❌ Failed to create transport request:',
          error instanceof Error ? error.message : String(error)
        );
        process.exit(1);
      }
    });

  // Import commands
  const importCmd = program
    .command('import')
    .alias('exp')
    .description('Import ABAP objects to OAT format (Open ABAP Tooling)');

  importCmd
    .command('package <packageName> [targetFolder]')
    .description('Import an ABAP package and its contents')
    .option(
      '-o, --output <path>',
      'Output directory (overrides targetFolder)',
      ''
    )
    .option(
      '-t, --object-types <types>',
      'Comma-separated object types (e.g., CLAS,INTF,DDLS). Default: all supported by plugin'
    )
    .option('--sub-packages', 'Include subpackages', false)
    .option('--format <format>', 'Output format (oat|abapgit|json)', 'oat')
    .option('--debug', 'Enable debug output', false)
    .action(async (packageName, targetFolder, options) => {
      try {
        const importService = new ImportService(adtClient);

        // Determine output path: --output option, targetFolder argument, or default
        const outputPath =
          options.output ||
          targetFolder ||
          `./oat-${packageName.toLowerCase().replace('$', '')}`;

        console.log(`🚀 Starting import of package: ${packageName}`);
        console.log(`📁 Target folder: ${outputPath}`);

        // Parse object types if provided
        const objectTypes = options.objectTypes
          ? options.objectTypes
              .split(',')
              .map((t: string) => t.trim().toUpperCase())
          : undefined;

        const result = await importService.importPackage({
          packageName,
          outputPath,
          objectTypes,
          includeSubpackages: options.subPackages,
          format: options.format,
          debug: options.debug,
        });

        console.log(`\n✅ Import completed successfully!`);
        console.log(`📁 Package: ${result.packageName}`);
        console.log(`📝 Description: ${result.description}`);
        console.log(`📊 Total objects: ${result.totalObjects}`);
        console.log(`✅ Processed: ${result.processedObjects}`);

        // Show objects by type
        for (const [type, count] of Object.entries(result.objectsByType)) {
          const icon = IconRegistry.getIcon(type);
          console.log(`${icon} ${type}: ${count}`);
        }
      } catch (error) {
        console.error(
          `❌ Import failed:`,
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
