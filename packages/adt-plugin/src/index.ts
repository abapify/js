/**
 * @abapify/adt-plugin
 * 
 * ADT Plugin interface and factory for abapify.
 * 
 * @example
 * ```typescript
 * import { createPlugin, type AdtPlugin } from '@abapify/adt-plugin';
 * 
 * export const myPlugin = createPlugin({
 *   name: 'myFormat',
 *   version: '1.0.0',
 *   description: 'My format plugin',
 *   registry: { ... },
 *   format: { ... },
 * });
 * ```
 */

// Types
export type {
  AbapObjectType,
  ImportContext,
  ImportResult,
  ExportContext,
  ExportResult,
  AdtPlugin,
  AdtPluginDefinition,
} from './types';

// Factory
export { createPlugin } from './factory';
