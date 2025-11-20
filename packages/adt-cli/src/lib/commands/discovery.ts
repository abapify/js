import { Command } from 'commander';
import { writeFileSync } from 'fs';
import {
  createAdtClient,
  type WorkspaceXml,
  type CollectionXml,
} from '@abapify/adt-client-v2';

export const discoveryCommand = new Command('discovery')
  .description('Discover available ADT services')
  .option('-o, --output <file>', 'Save discovery data to file')
  .action(async (options, command) => {
    try {
      // Create ADT v2 client
      const adtClient = createAdtClient();

      // Call discovery endpoint
      const response = await adtClient.discovery.getDiscovery();

      if (response.status !== 200) {
        throw new Error(`Discovery failed with status ${response.status}`);
      }

      const discovery = response.body;

      if (options.output) {
        if (options.output.endsWith('.json')) {
          // Save as JSON
          const outputData = {
            workspaces: discovery.workspace.map((ws: WorkspaceXml) => ({
              title: ws.title.text,
              collections: ws.collection.map((coll: CollectionXml) => ({
                href: coll.href,
                title: coll.title.text,
                accept: coll.accept?.text,
                category: coll.category
                  ? {
                      term: coll.category.term,
                      scheme: coll.category.scheme,
                    }
                  : undefined,
                templateLinks: coll.templateLinks?.templateLink.map(
                  (link: { rel: string; template: string; type?: string }) => ({
                    rel: link.rel,
                    template: link.template,
                    type: link.type,
                  })
                ),
              })),
            })),
          };
          writeFileSync(options.output, JSON.stringify(outputData, null, 2));
          console.log(`💾 Discovery data saved as JSON to: ${options.output}`);
        } else {
          // Save as XML - need to rebuild from parsed data
          // For now, just save JSON with .xml extension as a placeholder
          console.warn(
            '⚠️  XML output not yet supported with v2 client, saving as JSON'
          );
          const outputData = { workspaces: discovery.workspace };
          writeFileSync(options.output, JSON.stringify(outputData, null, 2));
          console.log(`💾 Discovery data saved to: ${options.output}`);
        }
      } else {
        // Display in console
        console.log(`\n📋 Found ${discovery.workspace.length} workspaces:\n`);

        for (const workspace of discovery.workspace) {
          console.log(`📁 ${workspace.title.text}`);
          for (const collection of workspace.collection) {
            console.log(`  └─ ${collection.title.text} (${collection.href})`);
            if (collection.category) {
              console.log(`     Category: ${collection.category.term}`);
            }
            if (collection.templateLinks?.templateLink) {
              console.log(
                `     Templates: ${collection.templateLinks.templateLink.length} available`
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
