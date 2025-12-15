/**
 * Schema re-exports - single point of entry
 *
 * All contract files import schemas from here.
 * When we rename/swap the schema package, only this file changes.
 *
 * Schemas from adt-schemas are ts-xsd TypedSchema instances,
 * which are speci-compatible (have parse/build methods).
 */
export * from '@abapify/adt-schemas';
export type * from '@abapify/adt-schemas';

// Re-export InferTypedSchema for extracting types from schemas
export type { InferTypedSchema } from '@abapify/adt-schemas';
