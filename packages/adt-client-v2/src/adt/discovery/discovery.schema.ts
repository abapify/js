/**
 * ADT Discovery - XML Schema
 *
 * ts-xml schema for application/atomsvc+xml (AtomPub Service Document)
 *
 * Based on real SAP ADT API discovery response structure
 */

import type { InferSchemaType } from '../../base/schema';
import { createSchema } from '../../base/schema';
import { NS } from '../../namespaces';
import type { ElementSchema } from '../../base/schema';

/**
 * Atom Category Schema
 */
const AtomCategorySchema: ElementSchema = {
  tag: 'atom:category',
  ns: { atom: NS.atom },
  fields: {
    term: { kind: 'attr', name: 'term', type: 'string', optional: true },
    scheme: { kind: 'attr', name: 'scheme', type: 'string', optional: true },
  },
} as const;

/**
 * Template Link Schema
 */
const TemplateLinkSchema: ElementSchema = {
  tag: 'adtcomp:templateLink',
  ns: {
    adtcomp: NS.adtcomp,
  },
  fields: {
    rel: { kind: 'attr', name: 'rel', type: 'string', optional: true },
    template: {
      kind: 'attr',
      name: 'template',
      type: 'string',
      optional: true,
    },
    type: {
      kind: 'attr',
      name: 'type',
      type: 'string',
      optional: true,
    },
    title: {
      kind: 'attr',
      name: 'title',
      type: 'string',
      optional: true,
    },
  },
} as const;

/**
 * Template Links Container Schema
 */
const TemplateLinksSchema: ElementSchema = {
  tag: 'adtcomp:templateLinks',
  ns: { adtcomp: NS.adtcomp },
  fields: {
    templateLink: {
      kind: 'elems',
      name: 'adtcomp:templateLink',
      schema: TemplateLinkSchema,
    },
  },
} as const;

/**
 * Collection Schema (AtomPub collection)
 */
const CollectionSchema: ElementSchema = {
  tag: 'app:collection',
  ns: {
    app: NS.app,
    atom: NS.atom,
    adtcomp: NS.adtcomp,
  },
  fields: {
    href: { kind: 'attr', name: 'href', type: 'string' },
    title: {
      kind: 'elem',
      name: 'atom:title',
      type: 'string',
    },
    accept: {
      kind: 'elem',
      name: 'app:accept',
      type: 'string',
      optional: true,
    },
    category: {
      kind: 'elem',
      name: 'atom:category',
      schema: AtomCategorySchema,
      optional: true,
    },
    templateLinks: {
      kind: 'elem',
      name: 'adtcomp:templateLinks',
      schema: TemplateLinksSchema,
      optional: true,
    },
  },
} as const;

/**
 * Workspace Schema (AtomPub workspace)
 */
const WorkspaceSchema: ElementSchema = {
  tag: 'app:workspace',
  ns: {
    app: NS.app,
    atom: NS.atom,
  },
  fields: {
    title: {
      kind: 'elem',
      name: 'atom:title',
      type: 'string',
    },
    collection: {
      kind: 'elems',
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
export const DiscoverySchema = createSchema({
  tag: 'app:service',
  ns: {
    app: NS.app,
    atom: NS.atom,
    adtcomp: NS.adtcomp,
  },
  fields: {
    workspace: {
      kind: 'elems',
      name: 'app:workspace',
      schema: WorkspaceSchema,
    },
  },
});

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
