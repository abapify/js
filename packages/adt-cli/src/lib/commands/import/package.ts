import { Command } from 'commander';
import { ImportService } from '../../services/import/service';
import { IconRegistry } from '../../utils/icon-registry';
import { AdtClientImpl } from '@abapify/adt-client';

export const importPackageCommand = new Command('package')
  .argument('<packageName>', 'ABAP package name to import')
  .argument('[targetFolder]', 'Target folder for output')
  .description('Import an ABAP package and its contents')
  .option(
    '-o, --output <path>',
    'Output directory (overrides targetFolder)',
    ''
  )
  .option(
    '-t, --object-types <types>',
    'Comma-separated object types (e.g., CLAS,INTF,DDLS). Default: all supported by format'
  )
  .option('--sub-packages', 'Include subpackages', false)
  .option(
    '--format <format>',
    'Output format: oat | abapgit | @abapify/oat | @abapify/abapgit | @abapify/oat/flat',
    'oat'
  )
  .action(async (packageName, targetFolder, options, command) => {
    const logger = command.parent?.parent?.logger;

    try {
      // Create ADT client with logger
      const adtClient = new AdtClientImpl({
        logger: logger?.child({ component: 'cli' }),
      });
      const importService = new ImportService(adtClient);

      // Determine output path: --output option, targetFolder argument, or default
      const outputPath =
        options.output ||
        targetFolder ||
        `./oat-${packageName.toLowerCase().replace('$', '')}`;

      // Show start message
      console.log(`🚀 Starting import of package: ${packageName}`);
      console.log(`📁 Target folder: ${outputPath}`);

      // Parse object types if provided
      const objectTypes = options.objectTypes
        ? options.objectTypes
            .split(',')
            .map((t: string) => t.trim().toUpperCase())
        : undefined;

      const result = await importService.importPackage({
        packageName,
        outputPath,
        objectTypes,
        includeSubpackages: options.subPackages,
        format: options.format,
        debug: options.debug,
      });

      // Compact success message - details only in debug mode
      if (options.debug) {
        console.log(`\n✅ Import completed successfully!`);
        console.log(`📁 Package: ${result.packageName}`);
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
        `❌ Import failed:`,
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });
