import { tsxml } from "../../src/index.ts";

/**
 * Atom namespace schemas
 * Standard Atom feed/link elements
 */

// Namespace URI
export const ATOM_NS = "http://www.w3.org/2005/Atom";

// atom:link element
export const AtomLink = tsxml.schema({
  tag: "atom:link",
  fields: {
    href: { kind: "attr", name: "href", type: "string" },
    rel: { kind: "attr", name: "rel", type: "string" },
    title: { kind: "attr", name: "title", type: "string" },
    type: { kind: "attr", name: "type", type: "string" },
  },
} as const);

// Can add more atom elements as needed
// export const AtomEntry = ...
// export const AtomFeed = ...
