/**
 * Atom namespace (atom:*) - Atom protocol elements for links and relations
 * Based on XML: atom:link with href, rel, type, etc.
 */
export interface AtomLinkType {
  href: string;
  rel: string;
  type?: string;
  title?: string;
  etag?: string;
}

export type AtomRelationType =
  | 'http://www.sap.com/adt/relations/versions'
  | 'http://www.sap.com/adt/relations/source'
  | 'http://www.sap.com/adt/relations/objectstructure'
  | 'http://www.sap.com/adt/relations/sources/withabapdocfromshorttexts'
  | 'http://www.sap.com/adt/relations/objectstates'
  | 'http://www.sap.com/adt/relations/abapsource/parser';

// Atom attributes (none - atom:link elements have attributes but no namespace attributes)
export interface AtomAttributes {
  // No namespace-level attributes for atom
}

// Atom elements
export interface AtomElements {
  link?: AtomLinkType | AtomLinkType[];
}

/**
 * Atom namespace (atom:*) - Smart namespace with automatic attribute/element detection
 * Primarily used for atom:link elements
 */
export type AtomType = AtomAttributes & AtomElements;

// Atom decorator - smart namespace with automatic attribute/element detection
import { createNamespace } from '../decorators/decorators-v2';

export const atom = createNamespace<AtomElements, AtomAttributes>({
  name: 'atom',
  uri: 'http://www.w3.org/2005/Atom',
});
