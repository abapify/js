import { Command } from 'commander';
import { writeFileSync } from 'fs';
import { AdtClientImpl } from '@abapify/adt-client';

export const discoveryCommand = new Command('discovery')
  .description('Discover available ADT services')
  .option('-o, --output <file>', 'Save discovery data to file')
  .action(async (options, command) => {
    const logger = command.parent?.logger;

    try {
      // Create ADT client with logger
      const adtClient = new AdtClientImpl({
        logger: logger?.child({ component: 'cli' }),
      });

      const discovery = await adtClient.discovery.getDiscovery();

      if (options.output) {
        // Save to file
        const outputData = {
          workspaces: discovery.workspaces,
        };

        if (options.output.endsWith('.json')) {
          writeFileSync(options.output, JSON.stringify(outputData, null, 2));
          console.log(`💾 Discovery data saved as JSON to: ${options.output}`);
        } else {
          // Save as XML (original format) - get raw XML from connection manager
          const xmlResponse = await adtClient.connectionManager.request(
            '/sap/bc/adt/discovery',
            {
              headers: { Accept: 'application/atomsvc+xml' },
            }
          );
          const xmlContent = await xmlResponse.text();
          writeFileSync(options.output, xmlContent);
          console.log(`💾 Discovery data saved as XML to: ${options.output}`);
        }
      } else {
        // Display in console
        console.log(`\n📋 Found ${discovery.workspaces.length} workspaces:\n`);

        for (const workspace of discovery.workspaces) {
          console.log(`📁 ${workspace.title}`);
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
