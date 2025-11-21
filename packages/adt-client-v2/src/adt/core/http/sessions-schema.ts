/**
 * SAP ADT Sessions Schema
 *
 * Defines the structure of HTTP session responses from SAP ADT.
 * Used for session management and CSRF token initialization.
 */

import type { InferSchemaType, ElementSchema } from '../../../base/schema';
import { createSchema } from '../../../base/schema';
import { NS } from '../../../namespaces';

/**
 * Atom Link Schema (for session links)
 */
const AtomLinkSchema: ElementSchema = {
  tag: 'atom:link',
  ns: { atom: NS.atom },
  fields: {
    href: { kind: 'attr', name: 'href', type: 'string', optional: true },
    rel: { kind: 'attr', name: 'rel', type: 'string', optional: true },
    type: { kind: 'attr', name: 'type', type: 'string', optional: true },
    title: { kind: 'attr', name: 'title', type: 'string', optional: true },
  },
} as const;

/**
 * HTTP Property Schema
 */
const HttpPropertySchema: ElementSchema = {
  tag: 'http:property',
  ns: { http: 'http://www.sap.com/adt/http' },
  fields: {
    name: { kind: 'attr', name: 'name', type: 'string', optional: true },
    value: { kind: 'text', type: 'string', optional: true },
  },
} as const;

/**
 * HTTP Properties Container Schema
 */
const HttpPropertiesSchema: ElementSchema = {
  tag: 'http:properties',
  ns: { http: 'http://www.sap.com/adt/http' },
  fields: {
    properties: {
      kind: 'elems',
      name: 'http:property',
      schema: HttpPropertySchema,
      optional: true,
    },
  },
} as const;

/**
 * HTTP Session Schema
 * Represents an ADT HTTP session with security settings
 */
export const SessionSchema = createSchema({
  tag: 'http:session',
  ns: {
    http: 'http://www.sap.com/adt/http',
    atom: NS.atom,
  },
  fields: {
    // Atom links (security session, logoff, etc.)
    links: {
      kind: 'elems',
      name: 'atom:link',
      schema: AtomLinkSchema,
      optional: true,
    },

    // Session properties
    properties: {
      kind: 'elem',
      name: 'http:properties',
      schema: HttpPropertiesSchema,
      optional: true,
    },
  },
} as const);

export type SessionXml = InferSchemaType<typeof SessionSchema>;
