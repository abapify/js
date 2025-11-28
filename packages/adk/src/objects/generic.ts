import { createAdkObject } from '../base/class-factory';
import { createAdtSchema, AdtCoreSchema } from '@abapify/adt-schemas';

/**
 * Generic ABAP object - fallback for unsupported types
 *
 * Provides basic ADT core functionality for any object type.
 * Used when specific object class is not registered in ObjectRegistry.
 */
export const GenericAbapObject = createAdkObject(
  'Generic',
  createAdtSchema(AdtCoreSchema)
);
