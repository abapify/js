import { Command } from 'commander';
// TODO: ObjectRegistry was removed - needs ADK migration
// import { ObjectRegistry } from '../objects/registry';
import { IconRegistry } from '../utils/icon-registry';
import { AdtClientImpl } from '@abapify/adt-client';

// TODO: Stub until ADK migration
const ObjectRegistry = {
  isSupported: (_type: string) => false,
  get: (_type: string, _client: unknown) => { throw new Error('ObjectRegistry needs ADK migration'); },
};

export const outlineCommand = new Command('outline')
  .argument('<objectName>', 'ABAP object name to show outline for')
  .description('Show object structure outline (methods, attributes, etc.)')
  .action(async (objectName, options, command) => {
    const logger = command.parent?.logger;

    try {
      // Create ADT client with logger
      const adtClient = new AdtClientImpl({
        logger: logger?.child({ component: 'cli' }),
      });

      // Search for the specific object by name
      const searchOptions = {
        operation: 'quickSearch',
        query: objectName,
        maxResults: 10,
      };
      const result = await adtClient.repository.searchObjectsDetailed(
        searchOptions
      );

      // Find exact match
      type SearchObject = { name: string; type: string; packageName?: string };
      const exactMatch = result.objects.find(
        (obj: SearchObject) => obj.name.toUpperCase() === objectName.toUpperCase()
      );

      if (!exactMatch) {
        console.log(`❌ Object '${objectName}' not found`);

        // Show similar objects if any
        const similarObjects = result.objects.filter((obj: SearchObject) =>
          obj.name.toUpperCase().includes(objectName.toUpperCase())
        );

        if (similarObjects.length > 0) {
          console.log(`\n💡 Similar objects found:`);
          similarObjects.slice(0, 5).forEach((obj: SearchObject) => {
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
