import { createNamespace } from "../../base/namespace";

/**
 * Atom namespace schemas
 *
 * Namespace: http://www.w3.org/2005/Atom
 * Prefix: atom
 *
 * Note: Atom attributes use unprefixed names (href, rel, title, type)
 * as per the Atom specification.
 */

/**
 * Atom namespace object
 * Use atom.uri for namespace URI, atom.prefix for prefix
 */
export const atom = createNamespace({
  uri: "http://www.w3.org/2005/Atom",
  prefix: "atom",
});

/**
 * Atom link schema
 */
export const AtomLinkSchema = atom.schema({
  tag: "atom:link",
  fields: {
    // Note: Atom link attributes are unprefixed per spec
    href: { kind: "attr" as const, name: "href", type: "string" as const },
    rel: { kind: "attr" as const, name: "rel", type: "string" as const },
    title: { kind: "attr" as const, name: "title", type: "string" as const },
    type: { kind: "attr" as const, name: "type", type: "string" as const },
  },
} as const);
