import { Command } from 'commander';
import { SearchService } from '../services/search/service';
import { ObjectRegistry } from '../objects/registry';
import { IconRegistry } from '../utils/icon-registry';
import { adtClient } from '../shared/clients';

export const outlineCommand = new Command('outline')
  .argument('<objectName>', 'ABAP object name to show outline for')
  .description('Show object structure outline (methods, attributes, etc.)')
  .option('--debug', 'Enable debug output', false)
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

      // Check if object type is supported
      if (!ObjectRegistry.isSupported(exactMatch.type)) {
        console.log(
          `❌ Outline not supported for object type: ${exactMatch.type}`
        );
        return;
      }

      // Show object structure only
      try {
        const objectHandler = ObjectRegistry.get(exactMatch.type, adtClient);
        await objectHandler.getStructure(exactMatch.name);
        console.log(); // Add spacing after outline
      } catch (error) {
        console.log(
          `⚠️ Could not fetch outline: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    } catch (error) {
      console.error(
        `❌ Outline failed:`,
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });
