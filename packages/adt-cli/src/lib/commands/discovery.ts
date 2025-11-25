import { Command } from 'commander';
import { writeFileSync } from 'fs';
import type { ResponseContext } from '@abapify/adt-client-v2';
import { getAdtClientV2 } from '../utils/adt-client-v2';

export const discoveryCommand = new Command('discovery')
  .description('Discover available ADT services')
  .option(
    '-o, --output <file>',
    'Save discovery data to file (JSON or XML based on extension)'
  )
  .action(async (options, command) => {
    try {
      // Capture plugin to get both XML and JSON
      let capturedXml: string | undefined;
      let capturedJson: unknown | undefined;

      // Create v2 client with capture plugin
      const adtClient = getAdtClientV2({
        plugins: [
          {
            name: 'capture',
            process: (context: ResponseContext) => {
              capturedXml = context.rawText;
              capturedJson = context.parsedData;
              return context.parsedData;
            },
          },
        ],
      });

      // Call discovery endpoint
      const discovery = await adtClient.adt.discovery.getDiscovery();

      if (options.output) {
        // Detect format based on file extension
        const isXml = options.output.toLowerCase().endsWith('.xml');

        if (isXml) {
          if (capturedXml) {
            // Save raw XML
            writeFileSync(options.output, capturedXml);
            console.log(`💾 Discovery XML saved to: ${options.output}`);
          } else {
            console.error('❌ No XML captured - plugin may not have run');
            console.error('Captured XML:', capturedXml);
            console.error('Captured JSON:', capturedJson);
            process.exit(1);
          }
        } else {
          // Save as JSON (default)
          writeFileSync(options.output, JSON.stringify(discovery, null, 2));
          console.log(`💾 Discovery JSON saved to: ${options.output}`);
        }
      } else {
        // Display in console
        if (!discovery.workspace || !Array.isArray(discovery.workspace)) {
          console.error('❌ Unexpected response structure');
          console.error('Response:', discovery);
          process.exit(1);
        }
        console.log(`\n📋 Found ${discovery.workspace.length} workspaces:\n`);

        for (const workspace of discovery.workspace) {
          console.log(`📁 ${workspace.title}`);

          // Ensure collection is an array
          const collections = Array.isArray(workspace.collection)
            ? workspace.collection
            : [workspace.collection];

          for (const collection of collections) {
            // Type assertion since schema types are generic
            const coll = collection as any;
            console.log(`  └─ ${coll.title} (${coll.href})`);

            if (coll.category) {
              console.log(`     Category: ${coll.category.term}`);
            }

            if (coll.templateLinks?.templateLink) {
              const templates = Array.isArray(coll.templateLinks.templateLink)
                ? coll.templateLinks.templateLink
                : [coll.templateLinks.templateLink];

              if (templates.length > 0) {
                console.log(`     Templates: ${templates.length} available`);
              }
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
