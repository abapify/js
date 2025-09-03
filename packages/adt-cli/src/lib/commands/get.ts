import { Command } from 'commander';
import { SearchService } from '../services/search/service';
import { ObjectRegistry } from '../objects/registry';
import { IconRegistry } from '../utils/icon-registry';
import { AdtUrlGenerator } from '../utils/adt-url-generator';
import { adtClient, authManager } from '../shared/clients';
import { promises as fs } from 'fs';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser';

export const getCommand = new Command('get')
  .argument('<objectName>', 'ABAP object name to inspect')
  .description('Get details about a specific ABAP object')
  .option('--source', 'Show source code preview', false)
  .option('--json', 'Output as JSON', false)
  .option('--debug', 'Enable debug output', false)
  .option('--outline', 'Show object outline structure', false)
  .option(
    '--properties',
    'Show object properties (package, application, etc.)',
    false
  )
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

          // If outline flag is set and it's a class, get structure XML
          if (options.outline && exactMatch.type === 'CLAS') {
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

          const contentType = options.outline ? 'structure XML' : 'ADT XML';
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
      console.log(`\n${icon} ${exactMatch.name} (${exactMatch.type}):`);
      console.log(
        `\t📝 Description: ${exactMatch.description || 'No description'}`
      );
      console.log(`\t📦 Package: ${exactMatch.packageName}`);

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

        console.log(`\t🔗 Open in ADT: ${adtIdeUrl}`);
        console.log(`\t🌐 Web ADT: ${webAdtUrl}`);
      } catch (error) {
        console.log(`🔗 ADT URI: ${exactMatch.uri}`);
      }

      // Show object outline if requested
      if (options.outline) {
        if (ObjectRegistry.isSupported(exactMatch.type)) {
          try {
            console.log(`\n🏗️ Object Outline:`);
            const objectHandler = ObjectRegistry.get(
              exactMatch.type,
              adtClient
            );
            await objectHandler.getStructure(exactMatch.name);
          } catch (error) {
            console.log(
              `⚠️ Could not fetch outline: ${
                error instanceof Error ? error.message : String(error)
              }`
            );
          }
        } else {
          console.log(
            `⚠️ Outline not supported for object type: ${exactMatch.type}`
          );
        }
      }

      // Show object properties if requested
      if (options.properties) {
        try {
          console.log(`\n🏷️ Object Properties:`);

          // Get package hierarchy first to build breadcrumb
          const encodedUri = encodeURIComponent(exactMatch.uri);
          const propertiesUri = `/sap/bc/adt/repository/informationsystem/objectproperties/values?uri=${encodedUri}&facet=package&facet=appl`;
          const propertiesXml = await adtClient.get(propertiesUri, {
            Accept:
              'application/vnd.sap.adt.repository.objproperties.result.v1+xml',
          });

          // Parse properties
          const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
          });
          const parsed = parser.parse(propertiesXml);

          const properties =
            parsed['opr:objectProperties']?.['opr:property'] || [];
          const propertyArray = Array.isArray(properties)
            ? properties
            : [properties];

          // Separate packages and applications
          const packages = propertyArray.filter(
            (prop: any) => prop['@_facet'] === 'PACKAGE'
          );
          const applications = propertyArray.filter(
            (prop: any) => prop['@_facet'] === 'APPL'
          );

          // Build package breadcrumb path (like IDE)
          if (packages.length > 0) {
            const packagePath = packages
              .map((pkg: any) => pkg['@_displayName'])
              .reverse()
              .join(' -> ');
            console.log(`\t📦 Package: ${packagePath}`);
          } else {
            console.log(`\t📦 Package: ${exactMatch.packageName}`);
          }

          console.log(`\t📋 Version: Active`);
          console.log(
            `\t📝 Description: ${exactMatch.description || 'No description'}`
          );

          applications.forEach((prop: any) => {
            console.log(`\t📱 Application: ${prop['@_text']}`);
          });

          // Get additional metadata from object if supported
          if (ObjectRegistry.isSupported(exactMatch.type)) {
            try {
              const objectHandler = ObjectRegistry.get(
                exactMatch.type,
                adtClient
              );
              const objectData = await objectHandler.read(exactMatch.name);

              if (objectData.responsible) {
                console.log(`\t👤 Responsible: ${objectData.responsible}`);
              }
              if (objectData.createdOn) {
                console.log(`\t📅 Created on: ${objectData.createdOn}`);
              }
              if (objectData.changedBy) {
                console.log(`\t✏️ Last changed by: ${objectData.changedBy}`);
              }
              if (objectData.changedOn) {
                console.log(`\t🕐 Last changed on: ${objectData.changedOn}`);
              }
            } catch (error) {
              // Continue with properties even if object read fails
            }
          }
        } catch (error) {
          console.log(
            `⚠️ Could not fetch properties: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
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
