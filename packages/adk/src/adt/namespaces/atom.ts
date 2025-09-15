/**
 * Atom namespace types for links and relations
 */
export interface AtomLink {
  href: string;
  rel: string;
  type?: string;
  title?: string;
  etag?: string;
}

export type AtomRelation =
  | 'http://www.sap.com/adt/relations/versions'
  | 'http://www.sap.com/adt/relations/source'
  | 'http://www.sap.com/adt/relations/objectstructure'
  | 'http://www.sap.com/adt/relations/sources/withabapdocfromshorttexts'
  | 'http://www.sap.com/adt/relations/objectstates'
  | 'http://www.sap.com/adt/relations/abapsource/parser';
