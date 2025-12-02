/**
 * UI Pages
 *
 * Export page factories and types.
 * Note: Pages self-register via definePage() on import.
 */

export { default as AdtCorePage } from './adt-core';
export { default as GenericPage } from './generic';
export { default as DiscoveryPage } from './discovery';
export { default as TransportPage } from './transport';
export { default as PackagePage } from './package';

// Re-export types
export type { AdtCoreObject, AdtCorePageOptions } from './adt-core';
export type { DiscoveryData } from './discovery';
export type { TransportParams, TransportData } from './transport';
// Note: Package type is now AdkPackage from @abapify/adk-v2
