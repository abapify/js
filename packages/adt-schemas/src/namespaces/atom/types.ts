/**
 * Atom namespace types
 *
 * Standard Atom Syndication Format elements used in ADT APIs
 */

/**
 * Common Atom relation URIs used in ADT
 */
export type AtomRelationType =
  | "http://www.sap.com/adt/relations/versions"
  | "http://www.sap.com/adt/relations/source"
  | "http://www.sap.com/adt/relations/objectstructure"
  | "http://www.sap.com/adt/relations/sources/withabapdocfromshorttexts"
  | "http://www.sap.com/adt/relations/objectstates"
  | "http://www.sap.com/adt/relations/abapsource/parser"
  | "http://www.sap.com/adt/relations/informationsystem/abaplanguageversions"
  | "self"
  | string; // Allow custom relations

/**
 * Atom link element
 */
export interface AtomLinkType {
  href?: string;
  rel?: AtomRelationType;
  title?: string;
  type?: string;
}
