/**
 * @abapify/adt-schemas-v2
 *
 * Next-generation ADT schemas with content-type registry and clean API types
 */

// Packages
export type { Package } from './namespaces/adt/packages';
export { PackageAdapter } from './namespaces/adt/packages';

// Registry (exported separately via package.json exports)
// import { getSchemaByContentType } from '@abapify/adt-schemas-v2/registry';
