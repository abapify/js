import { Command } from 'commander';
import { ImportService } from '../../services/import/service';
import { IconRegistry } from '../../utils/icon-registry';
import { adtClient } from '../../shared/clients';

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
    'Output format: oat (production) | abapgit (experimental demo) | json',
    'oat'
  )
  .option('--debug', 'Enable debug output', false)
  .action(async (packageName, targetFolder, options) => {
    try {
      const importService = new ImportService(adtClient);

      // Determine output path: --output option, targetFolder argument, or default
      const outputPath =
        options.output ||
        targetFolder ||
        `./oat-${packageName.toLowerCase().replace('$', '')}`;

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
    } catch (error) {
      console.error(
        `❌ Import failed:`,
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });
