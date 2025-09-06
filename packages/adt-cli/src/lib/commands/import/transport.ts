import { Command } from 'commander';
import { ImportService } from '../../services/import/service';
import { IconRegistry } from '../../utils/icon-registry';
import { adtClient } from '../../shared/clients';

export const importTransportCommand = new Command('transport')
  .argument('<transportNumber>', 'Transport request number to import')
  .argument('[targetFolder]', 'Target folder for output')
  .description('Import ABAP objects from a transport request')
  .option(
    '-o, --output <path>',
    'Output directory (overrides targetFolder)',
    ''
  )
  .option(
    '-t, --object-types <types>',
    'Comma-separated object types (e.g., CLAS,INTF,DDLS). Default: all supported by format'
  )
  .option(
    '--format <format>',
    'Output format: oat (production) | abapgit (experimental demo) | json',
    'oat'
  )
  .option('--debug', 'Enable debug output', false)
  .action(async (transportNumber, targetFolder, options) => {
    try {
      const importService = new ImportService(adtClient);

      // Determine output path: --output option, targetFolder argument, or default
      const outputPath =
        options.output ||
        targetFolder ||
        `./tr-${transportNumber.toLowerCase()}`;

      // Only show start message in debug mode
      if (options.debug) {
        console.log(`🚀 Starting import of transport: ${transportNumber}`);
        console.log(`📁 Target folder: ${outputPath}`);
      }

      // Parse object types if provided
      const objectTypes = options.objectTypes
        ? options.objectTypes
            .split(',')
            .map((t: string) => t.trim().toUpperCase())
        : undefined;

      const result = await importService.importTransport({
        transportNumber,
        outputPath,
        objectTypes,
        format: options.format,
        debug: options.debug,
      });

      // Compact success message - details only in debug mode
      if (options.debug) {
        console.log(`\n✅ Import completed successfully!`);
        console.log(`🚛 Transport: ${result.transportNumber}`);
        console.log(`📝 Description: ${result.description}`);
        console.log(`📊 Total objects: ${result.totalObjects}`);
        console.log(`✅ Processed: ${result.processedObjects}`);

        // Show objects by type
        for (const [type, count] of Object.entries(result.objectsByType)) {
          const icon = IconRegistry.getIcon(type);
          console.log(`${icon} ${type}: ${count}`);
        }
      }
    } catch (error) {
      console.error(
        `❌ Transport import failed:`,
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });
