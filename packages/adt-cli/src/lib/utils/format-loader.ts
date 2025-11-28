import { shouldUseMockClient } from '../testing/cli-test-utils';

/**
 * Parse format specification with optional preset
 * Examples:
 *   @abapify/oat -> { package: '@abapify/oat', preset: undefined }
 *   @abapify/oat/flat -> { package: '@abapify/oat', preset: 'flat' }
 *   oat -> { package: '@abapify/oat', preset: undefined } (shortcut)
 *   abapgit -> { package: '@abapify/abapgit', preset: undefined } (shortcut)
 */
export function parseFormatSpec(formatSpec: string): {
  package: string;
  preset?: string;
} {
  // Handle shortcuts for backward compatibility
  if (formatSpec === 'oat') {
    return { package: '@abapify/oat' };
  }
  if (formatSpec === 'abapgit') {
    return { package: '@abapify/abapgit' };
  }

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
 * Supports both @abapify/... packages and legacy shortcuts (oat, abapgit)
 */
export async function loadFormatPlugin(formatSpec: string) {
  const { package: packageName, preset } = parseFormatSpec(formatSpec);

  try {
    // Check if we're in test mode and should use mock plugin
    if (shouldUseMockClient() && packageName === '@abapify/oat') {
      const { MockOatPlugin } = await import('../testing/mock-oat-plugin');
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

    // Check if PluginClass is already an instance (from createFormatPlugin)
    // or if it's a constructor function that needs to be instantiated
    const plugin =
      typeof PluginClass === 'function' && PluginClass.prototype
        ? new PluginClass(options)
        : PluginClass;

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
