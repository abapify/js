import { Command } from 'commander';
import {
  createComponentLogger,
  handleCommandError,
} from '../../utils/command-helpers';
import {
  shouldUseMockClient,
  getMockAdtClient,
} from '../../testing/cli-test-utils';
// AdtClient will be imported dynamically when needed

/**
 * Parse format specification with optional preset
 * Examples:
 *   @abapify/oat -> { package: '@abapify/oat', preset: undefined }
 *   @abapify/oat/flat -> { package: '@abapify/oat', preset: 'flat' }
 */
function parseFormatSpec(formatSpec: string): {
  package: string;
  preset?: string;
} {
  const parts = formatSpec.split('/');
  if (parts.length === 2) {
    // @abapify/oat
    return { package: formatSpec };
  } else if (parts.length === 3) {
    // @abapify/oat/flat
    const package_ = `${parts[0]}/${parts[1]}`;
    const preset = parts[2];
    return { package: package_, preset };
  } else {
    throw new Error(`Invalid format specification: ${formatSpec}`);
  }
}

/**
 * Load format plugin dynamically
 */
async function loadFormatPlugin(formatSpec: string) {
  const { package: packageName, preset } = parseFormatSpec(formatSpec);

  try {
    // Check if we're in test mode and should use mock plugin
    if (shouldUseMockClient() && packageName === '@abapify/oat') {
      const { MockOatPlugin } = await import('../../testing/mock-oat-plugin');
      const options = preset
        ? { preset: preset as 'flat' | 'hierarchical' | 'grouped' }
        : {};
      const plugin = new MockOatPlugin(options);

      return {
        name: plugin.name,
        description: plugin.description,
        instance: plugin,
        preset,
      };
    }

    // Dynamic import of the real plugin package
    const pluginModule = await import(packageName);
    const PluginClass =
      pluginModule.default || pluginModule[Object.keys(pluginModule)[0]];

    if (!PluginClass) {
      throw new Error(`No plugin class found in ${packageName}`);
    }

    // Create plugin instance with preset options
    const options = preset ? { preset } : {};
    const plugin = new PluginClass(options);

    return {
      name: plugin.name || packageName,
      description: plugin.description || `Plugin from ${packageName}`,
      instance: plugin,
      preset,
    };
  } catch (error: any) {
    if (error?.code === 'MODULE_NOT_FOUND') {
      throw new Error(
        `Plugin package '${packageName}' not found. Install it with: npm install ${packageName}`
      );
    }
    throw error;
  }
}

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

      // TODO: Use adtClient to fetch transport data
      logger.info(`ADT client initialized: ${adtClient ? 'ready' : 'failed'}`);

      logger.info(`Transport: ${transport}`);
      logger.info(`Output directory: ${outputDir}`);

      if (options.objectTypes) {
        logger.info(`Object types: ${options.objectTypes}`);
      }

      console.log(`✅ Transport import configured successfully!`);
      console.log(`📦 Transport: ${transport}`);
      console.log(`📁 Output: ${outputDir}`);
      console.log(`🔧 Format: ${plugin.name} (${plugin.description})`);
      if (plugin.preset) {
        console.log(`🎛️  Preset: ${plugin.preset}`);
      }

      // TODO: Add actual import implementation
      console.log(`\n⚠️  Implementation pending - serialization logic needed`);
      console.log(
        `🔧 ADT Client: ${shouldUseMockClient() ? 'Mock (Testing)' : 'Real'}`
      );
    } catch (error) {
      handleCommandError(error, 'Transport import');
    }
  });
