/**
 * ADT Core - Common ADT attributes and schemas
 *
 * Provides reusable field definitions for ADT core attributes
 * that are shared across different ADT object types.
 */

import { createSchema, type ElementSchema } from '../../base';
import { NS } from '../../namespaces';

/**
 * Atom Link Schema
 *
 * Used for hypermedia links in ADT responses (RFC 4287).
 * Common across all ADT object types.
 */
export const AtomLinkSchema = createSchema({
  tag: 'atom:link',
  ns: { atom: NS.atom },
  fields: {
    href: { kind: 'attr', name: 'href', type: 'string' },
    rel: { kind: 'attr', name: 'rel', type: 'string' },
    type: { kind: 'attr', name: 'type', type: 'string' },
    title: { kind: 'attr', name: 'title', type: 'string' },
    etag: { kind: 'attr', name: 'etag', type: 'string' },
  },
} as const);

/**
 * Common fields that appear on all ADT core objects
 */
const adtCoreCommonFields = {
  links: { kind: 'elems' as const, name: 'atom:link', schema: AtomLinkSchema },
};

/**
 * Create a schema with adtcore namespace and core fields automatically included
 *
 * Helper function for ADT core schemas that always need the adtcore namespace.
 * Automatically includes:
 * - adtcore namespace
 * - atom namespace (for links)
 * - Common ADT core fields (name, type, description, etc.)
 * - links field (atom:link elements)
 *
 * Additional namespaces and fields can be provided and will be merged.
 *
 * @param includeFields - Whether to include adtCoreFields and links (default: true)
 *
 * @example
 * const MySchema = createCoreSchema({
 *   tag: 'adtcore:myElement',
 *   fields: { customField: { ... } }
 * });
 * // Automatically includes:
 * // - ns: { adtcore: NS.adtcore, atom: NS.atom }
 * // - fields: { ...adtCoreFields, links: [...], customField: { ... } }
 *
 * @example
 * // Skip core fields for simple reference schemas
 * const MyRefSchema = createCoreSchema({
 *   tag: 'adtcore:ref',
 *   fields: { uri: { ... } }
 * }, false);
 */
export function createCoreSchema<
  T extends Omit<ElementSchema, 'ns'> & { ns?: Record<string, string> }
>(schema: T, includeFields: boolean = true) {
  return createSchema({
    ...schema,
    ns: {
      adtcore: NS.adtcore,
      atom: NS.atom, // Always include atom for links
      ...schema.ns,
    },
    fields: includeFields
      ? {
          ...adtCoreFields,
          ...adtCoreCommonFields, // Includes links
          ...schema.fields,
        }
      : schema.fields,
  } as const);
}

/**
 * ADT Core Reference Schema
 *
 * Used for references to other ADT objects (packages, parent objects, etc.)
 * Common pattern: adtcore:packageRef, adtcore:parentRef, etc.
 */
export const AdtCoreRefSchema = createCoreSchema(
  {
    tag: 'adtcore:ref',
    fields: {
      uri: { kind: 'attr', name: 'adtcore:uri', type: 'string' },
      type: { kind: 'attr', name: 'adtcore:type', type: 'string' },
      name: { kind: 'attr', name: 'adtcore:name', type: 'string' },
    },
  },
  false
); // Skip core fields - this is a simple reference

/**
 * ADT Core attributes that appear on most ADT objects
 * These can be spread into schema field definitions
 */
export const adtCoreFields = {
  name: {
    kind: 'attr' as const,
    name: 'adtcore:name',
    type: 'string' as const,
  },
  type: {
    kind: 'attr' as const,
    name: 'adtcore:type',
    type: 'string' as const,
  },
  description: {
    kind: 'attr' as const,
    name: 'adtcore:description',
    type: 'string' as const,
  },
  descriptionTextLimit: {
    kind: 'attr' as const,
    name: 'adtcore:descriptionTextLimit',
    type: 'string' as const,
  },
  language: {
    kind: 'attr' as const,
    name: 'adtcore:language',
    type: 'string' as const,
  },
  masterLanguage: {
    kind: 'attr' as const,
    name: 'adtcore:masterLanguage',
    type: 'string' as const,
  },
  masterSystem: {
    kind: 'attr' as const,
    name: 'adtcore:masterSystem',
    type: 'string' as const,
  },
  responsible: {
    kind: 'attr' as const,
    name: 'adtcore:responsible',
    type: 'string' as const,
  },
  version: {
    kind: 'attr' as const,
    name: 'adtcore:version',
    type: 'string' as const,
  },
  createdBy: {
    kind: 'attr' as const,
    name: 'adtcore:createdBy',
    type: 'string' as const,
  },
  createdAt: {
    kind: 'attr' as const,
    name: 'adtcore:createdAt',
    type: 'string' as const,
  },
  changedBy: {
    kind: 'attr' as const,
    name: 'adtcore:changedBy',
    type: 'string' as const,
  },
  changedAt: {
    kind: 'attr' as const,
    name: 'adtcore:changedAt',
    type: 'string' as const,
  },
  abapLanguageVersion: {
    kind: 'attr' as const,
    name: 'adtcore:abapLanguageVersion',
    type: 'string' as const,
  },
};
