import { Command } from 'commander';
import { ImportService } from '../../services/import/service';
import { IconRegistry } from '../../utils/icon-registry';
import { getAdtClientV2 } from '../../utils/adt-client-v2';
import {
  getErrorCode,
  getErrorMessage,
  getErrorStatus,
  printErrorStack,
} from '../../utils/command-helpers';

export const importPackageCommand = new Command('package')
  .argument('<packageName>', 'ABAP package name to import')
  .argument('[targetFolder]', 'Target folder for output')
  .description('Import an ABAP package and its contents')
  .option(
    '-o, --output <path>',
    'Output directory (overrides targetFolder)',
    '',
  )
  .option(
    '-t, --object-types <types>',
    'Comma-separated object types (e.g., CLAS,INTF,DDLS). Default: all supported by format',
  )
  .option('--sub-packages', 'Include subpackages', false)
  .option(
    '--format <format>',
    'Output format: abapgit | oat | @abapify/abapgit | @abapify/oat',
    'abapgit',
  )
  .option('--debug', 'Enable debug output', false)
  .action(async (packageName, targetFolder, options) => {
    try {
      // Initialize ADT client (also initializes ADK)
      await getAdtClientV2();

      const importService = new ImportService();

      // Determine output path: --output option, targetFolder argument, or default
      const outputPath = options.output || targetFolder || `./src`;

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

      // Display results
      console.log(`\n✅ Package import complete!`);
      console.log(`📦 Package: ${result.packageName}`);
      console.log(`📝 Description: ${result.description}`);
      console.log(
        `📊 Results: ${result.results.success} success, ${result.results.skipped} skipped, ${result.results.failed} failed`,
      );

      // Show object type breakdown
      if (Object.keys(result.objectsByType).length > 0) {
        console.log(`\n📋 Objects by type:`);
        for (const [type, count] of Object.entries(result.objectsByType)) {
          const icon = IconRegistry.getIcon(type);
          console.log(`   ${icon} ${type}: ${count}`);
        }
      }

      console.log(`\n✨ Files written to: ${result.outputPath}`);
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      const errorCode = getErrorCode(error) ?? 'UNKNOWN';
      const errorStatus = getErrorStatus(error) ?? '';
      const cause =
        error instanceof Error && 'cause' in error
          ? (error as any).cause
          : null;

      console.error(`❌ Import failed: ${errorMsg}`);
      if (errorCode && errorCode !== 'UNKNOWN') {
        console.error(`   Error code: ${errorCode}`);
      }
      if (errorStatus) {
        console.error(`   HTTP status: ${errorStatus}`);
      }
      if (cause) {
        const causeMsg = cause instanceof Error ? cause.message : String(cause);
        const causeCode = getErrorCode(cause) ?? '';
        console.error(
          `   Cause: ${causeMsg}${causeCode ? ` (${causeCode})` : ''}`,
        );
      }
      printErrorStack(error);
      process.exit(1);
    }
  });
