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

// Atom namespace URI
export const ATOM_NAMESPACE_URI = 'http://www.w3.org/2005/Atom';

// Atom decorator
import { namespace } from '../decorators';
export const atom = namespace('atom', ATOM_NAMESPACE_URI);
