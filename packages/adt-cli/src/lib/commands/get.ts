import { Command } from 'commander';
import { SearchService } from '../services/search/service';
import { ObjectRegistry } from '../objects/registry';
import { IconRegistry } from '../utils/icon-registry';
import { AdtUrlGenerator } from '../utils/adt-url-generator';
import { adtClient, authManager } from '../shared/clients';
import { promises as fs } from 'fs';
import * as path from 'path';

export const getCommand = new Command('get')
  .argument('<objectName>', 'ABAP object name to inspect')
  .description('Get details about a specific ABAP object')
  .option('--source', 'Show source code preview', false)
  .option('--json', 'Output as JSON', false)
  .option('--debug', 'Enable debug output', false)
  .option('--structure', 'Show object structure information', false)
  .option(
    '-o, --output <file>',
    'Save ADT XML to file instead of displaying details'
  )
  .action(async (objectName, options) => {
    try {
      const searchService = new SearchService(adtClient);

      // Search for the specific object by name
      const searchResult = await searchService.searchObjects({
        operation: 'quickSearch',
        query: objectName,
        maxResults: 10,
        debug: options.debug,
      });

      // Find exact match
      const exactMatch = searchResult.objects.find(
        (obj) => obj.name.toUpperCase() === objectName.toUpperCase()
      );

      if (!exactMatch) {
        console.log(`❌ Object '${objectName}' not found`);

        // Show similar objects if any
        const similarObjects = searchResult.objects.filter((obj) =>
          obj.name.toUpperCase().includes(objectName.toUpperCase())
        );

        if (similarObjects.length > 0) {
          console.log(`\n💡 Similar objects found:`);
          similarObjects.slice(0, 5).forEach((obj) => {
            const icon = IconRegistry.getIcon(obj.type);
            console.log(
              `   ${icon} ${obj.name} (${obj.type}) - ${obj.packageName}`
            );
          });
        }
        return;
      }

      // Handle output to file option
      if (options.output) {
        try {
          let xmlContent: string;

          // If structure flag is set and it's a class, get structure XML
          if (options.structure && exactMatch.type === 'CLAS') {
            const structureUri = `/sap/bc/adt/oo/classes/${exactMatch.name.toLowerCase()}/objectstructure?version=active&withShortDescriptions=true`;
            xmlContent = await adtClient.get(structureUri);
          } else {
            // Otherwise get the regular ADT XML
            if (!ObjectRegistry.isSupported(exactMatch.type)) {
              console.log(
                `❌ ADT XML export not supported for object type: ${exactMatch.type}`
              );
              return;
            }

            const objectHandler = ObjectRegistry.get(
              exactMatch.type,
              adtClient
            );
            xmlContent = await objectHandler.getAdtXml(
              exactMatch.name,
              exactMatch.uri
            );
          }

          // Ensure directory exists
          const outputDir = path.dirname(options.output);
          await fs.mkdir(outputDir, { recursive: true });

          // Write XML to file
          await fs.writeFile(options.output, xmlContent, 'utf8');

          const contentType = options.structure ? 'structure XML' : 'ADT XML';
          console.log(`✅ ${contentType} saved to: ${options.output}`);
          return;
        } catch (error) {
          console.error(
            `❌ Failed to save XML: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
          process.exit(1);
        }
      }

      if (options.json) {
        console.log(JSON.stringify(exactMatch, null, 2));
        return;
      }

      // Display object details
      const icon = IconRegistry.getIcon(exactMatch.type);
      console.log(`\n${icon} ${exactMatch.name} (${exactMatch.type})`);
      console.log(`📝 ${exactMatch.description || 'No description'}`);
      console.log(`📦 Package: ${exactMatch.packageName}`);

      // Generate clickable ADT URLs
      try {
        const session = authManager.getAuthenticatedSession();
        const systemId = session.serviceKey.systemid;
        const abapEndpoint =
          session.serviceKey.endpoints['abap'] || session.serviceKey.url;

        const adtIdeUrl = AdtUrlGenerator.generateAdtUrl(
          systemId,
          exactMatch.type,
          exactMatch.name
        );
        const webAdtUrl = AdtUrlGenerator.generateWebAdtUrl(
          abapEndpoint,
          exactMatch.type,
          exactMatch.name
        );

        console.log(`🔗 Open in ADT: ${adtIdeUrl}`);
        console.log(`🌐 Web ADT: ${webAdtUrl}`);
      } catch (error) {
        console.log(`🔗 ADT URI: ${exactMatch.uri}`);
      }

      // Show object structure if requested
      if (options.structure && exactMatch.type === 'CLAS') {
        try {
          const structureUri = `/sap/bc/adt/oo/classes/${exactMatch.name.toLowerCase()}/objectstructure?version=active&withShortDescriptions=true`;
          const structureXml = await adtClient.get(structureUri);

          console.log(`\n🏗️ Object Structure:`);
          console.log('─'.repeat(60));
          console.log(structureXml);
        } catch (error) {
          console.log(
            `⚠️ Could not fetch structure: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      } else if (options.structure && exactMatch.type !== 'CLAS') {
        console.log(
          `⚠️ Structure information only available for classes (CLAS)`
        );
      }

      // Show source code preview if requested and object is supported
      if (options.source && ObjectRegistry.isSupported(exactMatch.type)) {
        try {
          const objectHandler = ObjectRegistry.get(exactMatch.type, adtClient);
          const objectData = await objectHandler.read(exactMatch.name);

          console.log(`\n📄 Source Code Preview:`);
          console.log('─'.repeat(60));
          const lines = objectData.source.split('\n');
          const preview = lines.slice(0, 15).join('\n');
          console.log(preview);

          if (lines.length > 15) {
            console.log(`\n... (${lines.length - 15} more lines)`);
            console.log(
              `💡 Use 'adt import package ${exactMatch.packageName} --object-types=${exactMatch.type}' to get full source`
            );
          }
        } catch (error) {
          console.log(
            `⚠️ Could not fetch source: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      } else if (options.source) {
        console.log(
          `⚠️ Source preview not supported for object type: ${exactMatch.type}`
        );
      }
    } catch (error) {
      console.error(
        `❌ Get failed:`,
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });
