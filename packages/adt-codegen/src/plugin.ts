/**
 * Plugin definition helper
 */

import type { CodegenPlugin, PluginHooks } from './types';

/**
 * Define a codegen plugin
 */
export function definePlugin(options: {
  name: string;
  hooks?: PluginHooks;
}): CodegenPlugin {
  return {
    name: options.name,
    hooks: options.hooks,
  };
}
