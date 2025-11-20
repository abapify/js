/**
 * ADT Discovery - XML Schema
 *
 * ts-xml schema for application/atomsvc+xml (AtomPub Service Document)
 *
 * Based on real SAP ADT API discovery response structure
 */

import type { InferSchemaType } from '../../base';
import { NS } from '../../namespaces';
import { FieldKind, PrimitiveType } from '../../base';

/**
 * Atom Category Schema
 */
const AtomCategorySchema = {
  tag: 'atom:category',
  ns: { atom: NS.atom },
  fields: {
    term: { kind: 'attr' as const, name: '@term', type: 'string' as const },
    scheme: { kind: 'attr' as const, name: '@scheme', type: 'string' as const },
  },
} as const;

/**
 * Template Link Schema
 */
const TemplateLinkSchema = {
  tag: 'adtcomp:templateLink',
  ns: {
    adtcomp: NS.adtcomp,
  },
  fields: {
    rel: { kind: 'attr' as const, name: '@rel', type: 'string' as const },
    template: {
      kind: 'attr' as const,
      name: '@template',
      type: 'string' as const,
    },
    type: {
      kind: 'attr' as const,
      name: '@type',
      type: 'string' as const,
      optional: true,
    },
  },
} as const;

/**
 * Template Links Container Schema
 */
const TemplateLinksSchema = {
  tag: 'adtcomp:templateLinks',
  ns: { adtcomp: NS.adtcomp },
  fields: {
    templateLink: {
      kind: 'elems' as const,
      name: 'adtcomp:templateLink',
      schema: TemplateLinkSchema,
    },
  },
} as const;

/**
 * Collection Schema (AtomPub collection)
 */
const CollectionSchema = {
  tag: 'app:collection',
  ns: {
    app: NS.app,
    atom: NS.atom,
    adtcomp: NS.adtcomp,
  },
  fields: {
    href: { kind: FieldKind.Attr, name: '@href', type: PrimitiveType.String },
    title: {
      kind: FieldKind.Elem,
      name: 'atom:title',
      type: PrimitiveType.String,
    },
    accept: {
      kind: FieldKind.Elem,
      name: 'app:accept',
      type: PrimitiveType.String,
      optional: true,
    },
    category: {
      kind: FieldKind.Elem,
      name: 'atom:category',
      schema: AtomCategorySchema,
      optional: true,
    },
    templateLinks: {
      kind: FieldKind.Elem,
      name: 'adtcomp:templateLinks',
      schema: TemplateLinksSchema,
      optional: true,
    },
  },
} as const;

/**
 * Workspace Schema (AtomPub workspace)
 */
const WorkspaceSchema = {
  tag: 'app:workspace',
  ns: {
    app: NS.app,
    atom: NS.atom,
  },
  fields: {
    title: {
      kind: FieldKind.Elem,
      name: 'atom:title',
      type: PrimitiveType.String,
    },
    collection: {
      kind: FieldKind.Elems,
      name: 'app:collection',
      schema: CollectionSchema,
    },
  },
} as const;

/**
 * Discovery Service Schema (AtomPub service document)
 *
 * Matches the structure of application/atomsvc+xml
 */
export const DiscoverySchema = {
  tag: 'app:service',
  ns: {
    app: NS.app,
    atom: NS.atom,
    adtcomp: NS.adtcomp,
  },
  fields: {
    workspace: {
      kind: 'elems' as const,
      name: 'app:workspace',
      schema: WorkspaceSchema,
    },
  },
} as const;

/**
 * Type inferred from schema
 */
export type DiscoveryXml = InferSchemaType<typeof DiscoverySchema>;

/**
 * Type for workspace
 */
export type WorkspaceXml = InferSchemaType<typeof WorkspaceSchema>;

/**
 * Type for collection
 */
export type CollectionXml = InferSchemaType<typeof CollectionSchema>;
