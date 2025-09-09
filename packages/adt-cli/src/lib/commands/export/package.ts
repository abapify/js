import { Command } from 'commander';
import { ExportService } from '../../services/export/service';
import { IconRegistry } from '../../utils/icon-registry';
import { AdtClientImpl } from '@abapify/adt-client';

export const exportPackageCommand = new Command('package')
  .argument('<packageName>', 'ABAP package name to export')
  .argument('[sourceFolder]', 'Source folder for input')
  .description(
    'Export an ABAP package and create objects in SAP from local files'
  )
  .option('-i, --input <path>', 'Input directory (overrides sourceFolder)', '')
  .option(
    '-t, --object-types <types>',
    'Comma-separated object types (e.g., CLAS,INTF,DDLS). Default: all supported by format'
  )
  .option('--sub-packages', 'Include subpackages', false)
  .option(
    '--format <format>',
    'Input format: oat (production) | abapgit (experimental demo) | json',
    'oat'
  )
  .option(
    '--transport <request>',
    'Transport request for object creation/updates'
  )
  .option(
    '--create',
    'Actually create/update objects in SAP (default: dry run)',
    false
  )
  .action(async (packageName, sourceFolder, options, command) => {
    const logger = command.parent?.parent?.logger;

    try {
      // Create ADT client with logger
      const adtClient = new AdtClientImpl({
        logger: logger?.child({ component: 'cli' }),
      });
      const exportService = new ExportService(adtClient);

      // Determine input path: --input option, sourceFolder argument, or default
      const inputPath =
        options.input ||
        sourceFolder ||
        `./oat-${packageName.toLowerCase().replace('$', '')}`;

      // Show start message
      console.log(`🚀 Starting export of package: ${packageName}`);
      console.log(`📁 Source folder: ${inputPath}`);

      // Parse object types if provided
      const objectTypes = options.objectTypes
        ? options.objectTypes
            .split(',')
            .map((t: string) => t.trim().toUpperCase())
        : undefined;

      const result = await exportService.exportPackage({
        packageName,
        inputPath,
        objectTypes,
        includeSubpackages: options.subPackages,
        format: options.format,
        transportRequest: options.transport,
        createObjects: options.create,
        debug: options.debug,
      });

      // Compact success message - details only in debug mode
      if (options.debug) {
        console.log(`\n✅ Export completed successfully!`);
        console.log(`📁 Package: ${result.packageName}`);
        console.log(`📝 Description: ${result.description}`);
        console.log(`📊 Total objects: ${result.totalObjects}`);
        console.log(`✅ Processed: ${result.processedObjects}`);
        if (options.create) {
          console.log(`🚀 Created in SAP: ${result.createdObjects}`);
        }

        // Show objects by type
        for (const [type, count] of Object.entries(result.objectsByType)) {
          const icon = IconRegistry.getIcon(type);
          console.log(`${icon} ${type}: ${count}`);
        }

        // Show created objects by type if any were created
        if (
          options.create &&
          Object.keys(result.createdObjectsByType).length > 0
        ) {
          console.log('\n🚀 Created in SAP:');
          for (const [type, count] of Object.entries(
            result.createdObjectsByType
          )) {
            const icon = IconRegistry.getIcon(type);
            console.log(`${icon} ${type}: ${count}`);
          }
        }
      }
    } catch (error) {
      console.error(
        `❌ Export failed:`,
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });
