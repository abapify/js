/**
 * ADT Client V2 - Using Speci's Client Generation
 *
 * Creates a type-safe ADT client from the contract.
 * The contract defines all available operations.
 * Business logic should be built separately using this client.
 */

import { createClient } from './base';
import { adtContract } from './contract';
import { createAdtAdapter, type AdtAdapterConfig } from './adapter';

/**
 * Create ADT client with automatic XML parsing/building and optional plugins
 *
 * @example
 * // Basic usage
 * const client = createAdtClient({
 *   baseUrl: 'https://sap-system.com:8000',
 *   username: 'user',
 *   password: 'pass',
 *   client: '100'
 * });
 *
 * // With file storage plugin
 * import { FileStoragePlugin } from '@abapify/adt-client-v2';
 * const client = createAdtClient({
 *   baseUrl: 'https://sap-system.com:8000',
 *   username: 'user',
 *   password: 'pass',
 *   client: '100',
 *   plugins: [
 *     new FileStoragePlugin({
 *       outputDir: './adt-responses',
 *       saveXml: true,
 *       saveJson: true
 *     })
 *   ]
 * });
 *
 * // Use the generated client
 * const metadata = await client.classes.getMetadata('ZCL_MY_CLASS');
 * await client.classes.create('ZCL_NEW_CLASS', classData);
 */
export function createAdtClient(config: AdtAdapterConfig) {
  return createClient(adtContract, {
    baseUrl: config.baseUrl,
    adapter: createAdtAdapter(config),
  });
}

export type AdtClient = ReturnType<typeof createAdtClient>;
