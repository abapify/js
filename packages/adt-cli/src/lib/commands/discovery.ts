import { Command } from 'commander';
import { writeFileSync } from 'fs';
import { DiscoveryService } from '../services/discovery';
import { adtClient } from '../shared/clients';

export const discoveryCommand = new Command('discovery')
  .description('Discover available ADT services')
  .option('-o, --output <file>', 'Save discovery data to file')
  .action(async (options) => {
    try {
      const discoveryService = new DiscoveryService(adtClient);
      const result = await discoveryService.getDiscovery();

      if (options.output) {
        // Save to file
        const outputData = {
          workspaces: result.workspaces,
        };

        if (options.output.endsWith('.json')) {
          writeFileSync(options.output, JSON.stringify(outputData, null, 2));
          console.log(`💾 Discovery data saved as JSON to: ${options.output}`);
        } else {
          // Save as XML (original format)
          const xmlContent = await discoveryService.getDiscoveryXml();
          writeFileSync(options.output, xmlContent);
          console.log(`💾 Discovery data saved as XML to: ${options.output}`);
        }
      } else {
        // Display in console
        console.log(`\n📋 Found ${result.workspaces.length} workspaces:\n`);

        for (const workspace of result.workspaces) {
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
