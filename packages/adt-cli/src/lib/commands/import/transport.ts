import { Command } from 'commander';
import {
  createComponentLogger,
  handleCommandError,
} from '../../utils/command-helpers';
import {
  shouldUseMockClient,
  getMockAdtClient,
} from '../../testing/cli-test-utils';
import { loadFormatPlugin } from '../../utils/format-loader';
// AdtClient will be imported dynamically when needed

export const importTransportCommand = new Command('transport')
  .description('Import transport request objects to local files')
  .argument('<transport>', 'Transport request number')
  .argument('[outputDir]', 'Output directory', './output')
  .option(
    '--format <format>',
    'Format plugin (e.g., @abapify/oat, @abapify/oat/flat)'
  )
  .option('--object-types <types>', 'Comma-separated object types to import')
  .action(async (transport: string, outputDir: string, options, command) => {
    const logger = createComponentLogger(command, 'import-transport');

    try {
      logger.info(`Starting transport import: ${transport}`);

      // Require format specification
      if (!options.format) {
        throw new Error(
          'Format specification required. Example: --format=@abapify/oat or --format=@abapify/oat/flat'
        );
      }

      // Load the format plugin
      logger.info(`Loading format plugin: ${options.format}`);
      const plugin = await loadFormatPlugin(options.format);
      logger.info(
        `Loaded plugin: ${plugin.name}${
          plugin.preset ? ` (preset: ${plugin.preset})` : ''
        }`
      );

      // Initialize ADT client (mock or real based on test mode)
      let adtClient: any;
      if (shouldUseMockClient()) {
        adtClient = getMockAdtClient();
        logger.info('Using mock ADT client for testing');
      } else {
        // Dynamic import to avoid bundling issues
        const adtClientModule = await import('@abapify/adt-client');
        adtClient = adtClientModule.createAdtClient();
        logger.info('Using real ADT client');
      }

      // Fetch transport objects
      logger.info(`Fetching transport objects from SAP...`);
      const transportObjects = await adtClient.transport.getObjects(transport);
      logger.info(`Found ${transportObjects.length} objects in transport`);

      // Filter by object types if specified
      let objectsToImport = transportObjects;
      if (options.objectTypes) {
        const types = options.objectTypes.split(',').map((t: string) => t.trim());
        objectsToImport = transportObjects.filter((obj: any) =>
          types.includes(obj.type)
        );
        logger.info(`Filtered to ${objectsToImport.length} objects by type`);
      }

      // Convert ADT objects to ADK objects using handlers
      logger.info(`Converting objects to ADK format...`);
      const adkObjects = [];
      
      for (const obj of objectsToImport) {
        try {
          const handler = adtClient.getHandler(obj.type);
          if (handler && typeof handler.getAdkObject === 'function') {
            const adkObj = await handler.getAdkObject(obj.name, { lazyLoad: true });
            adkObjects.push(adkObj);
            logger.info(`✓ Converted ${obj.type} ${obj.name}`);
          } else {
            logger.warn(`⚠ No ADK handler for ${obj.type} ${obj.name}, skipping`);
          }
        } catch (error: any) {
          logger.error(`✗ Failed to convert ${obj.type} ${obj.name}: ${error.message}`);
        }
      }

      logger.info(`Successfully converted ${adkObjects.length} objects to ADK format`);

      // Serialize using the format plugin
      logger.info(`Serializing to ${plugin.name} format...`);
      await plugin.instance.serialize(adkObjects, outputDir);
      
      console.log(`\n✅ Transport import complete!`);
      console.log(`📦 Transport: ${transport}`);
      console.log(`📁 Output: ${outputDir}`);
      console.log(`🔧 Format: ${plugin.name}`);
      console.log(`📊 Objects: ${adkObjects.length} converted`);
      console.log(`\n✨ Files written to: ${outputDir}`);
    } catch (error) {
      handleCommandError(error, 'Transport import');
    }
  });
