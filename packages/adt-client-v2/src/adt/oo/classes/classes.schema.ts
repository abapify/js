/**
 * ADT OO Classes - XML Schema
 *
 * ts-xml schema for application/vnd.sap.adt.oo.classes.v4+xml
 *
 * Based on real SAP ADT API response structure
 */

import type { InferSchemaType } from '../../../base';
import { AdtCoreRefSchema, createCoreSchema } from '../../core';
import { NS } from '../../../namespaces';

// Note: Using AdtCoreRefSchema from core module
// Note: createCoreSchema automatically includes adtcore fields, atom namespace, and links

/**
 * Class Include Schema
 */
const ClassIncludeSchema = createCoreSchema({
  tag: 'class:include',
  ns: {
    class: NS.class,
    abapsource: NS.abapsource,
  },
  fields: {
    // Class-specific fields
    includeType: { kind: 'attr', name: 'class:includeType', type: 'string' },
    sourceUri: { kind: 'attr', name: 'abapsource:sourceUri', type: 'string' },
    // Note: adtcore fields (name, type, changedAt, etc.) automatically included by createCoreSchema
  },
});

/**
 * Class XML Schema
 *
 * Matches the structure of application/vnd.sap.adt.oo.classes.v4+xml
 *
 * Automatically implements Inferrable for Speci integration
 */
export const ClassSchema = createCoreSchema({
  tag: 'class:abapClass',
  ns: {
    class: NS.class,
    abapoo: NS.abapoo,
    abapsource: NS.abapsource,
  },
  fields: {
    // Note: ADT Core attributes automatically included by createCoreSchema

    // Class-specific attributes
    final: {
      kind: 'attr',
      name: 'class:final',
      type: 'boolean',
      optional: true,
    },
    abstract: {
      kind: 'attr',
      name: 'class:abstract',
      type: 'boolean',
      optional: true,
    },
    visibility: {
      kind: 'attr',
      name: 'class:visibility',
      type: 'string',
      optional: true,
    },
    category: {
      kind: 'attr',
      name: 'class:category',
      type: 'string',
      optional: true,
    },
    sharedMemoryEnabled: {
      kind: 'attr',
      name: 'class:sharedMemoryEnabled',
      type: 'boolean',
      optional: true,
    },

    // ABAP OO attributes
    modeled: {
      kind: 'attr',
      name: 'abapoo:modeled',
      type: 'boolean',
      optional: true,
    },

    // ABAP Source attributes
    fixPointArithmetic: {
      kind: 'attr',
      name: 'abapsource:fixPointArithmetic',
      type: 'boolean',
      optional: true,
    },
    activeUnicodeCheck: {
      kind: 'attr',
      name: 'abapsource:activeUnicodeCheck',
      type: 'boolean',
      optional: true,
    },

    // Child elements
    packageRef: {
      kind: 'elem',
      name: 'adtcore:packageRef',
      schema: AdtCoreRefSchema,
      optional: true,
    },
    includes: {
      kind: 'elems',
      name: 'class:include',
      schema: ClassIncludeSchema,
      optional: true,
    },
    // Note: links field automatically included by createCoreSchema
  },
  allowUnknown: true, // Allow syntaxConfiguration and other elements we don't parse
} as const);

/**
 * Type inferred from schema - now with proper type narrowing!
 */
export type ClassXml = InferSchemaType<typeof ClassSchema>;
