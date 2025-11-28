/**
 * ADT Repository Information System - Search
 *
 * Schema for ABAP object search results
 * Path: /sap/bc/adt/repository/informationsystem/search
 */

import { createSchema, type ElementSchema, type InferSchemaType } from '../../../base';

/**
 * Object Reference Schema (individual reference)
 */
const ObjectReferenceSchema: ElementSchema = {
  tag: 'adtcore:objectReference',
  ns: { adtcore: 'http://www.sap.com/adt/core' },
  fields: {
    uri: { kind: 'attr', name: 'adtcore:uri', type: 'string' },
    type: { kind: 'attr', name: 'adtcore:type', type: 'string' },
    name: { kind: 'attr', name: 'adtcore:name', type: 'string' },
    packageName: { kind: 'attr', name: 'adtcore:packageName', type: 'string', optional: true },
    description: { kind: 'attr', name: 'adtcore:description', type: 'string', optional: true },
  },
} as const;

/**
 * XML Schema for object references
 */
export const ObjectReferencesSchema = createSchema({
  tag: 'adtcore:objectReferences',
  ns: {
    adtcore: 'http://www.sap.com/adt/core',
  },
  fields: {
    objectReference: {
      kind: 'elems',
      name: 'adtcore:objectReference',
      schema: ObjectReferenceSchema,
      optional: true,
    },
  },
} as const);

export type ObjectReferencesXml = InferSchemaType<typeof ObjectReferencesSchema>;
export type ObjectReference = InferSchemaType<typeof ObjectReferenceSchema>;
