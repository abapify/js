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

// Re-export types
export type { AdtCoreObject, AdtCorePageOptions } from './adt-core';
export type { DiscoveryData } from './discovery';
export type { Package } from './package';
export type { TransportParams, TransportData } from './transport';
