import { xml, root, attribute } from 'xmld';
import type { AtomRelation } from './types';

/**
 * Atom link element representation.
 *
 * Important: Attributes are intentionally NOT namespaced (SAP ADT format).
 * We set the element name with prefix via @root('atom:link') and keep
 * attributes as plain names using @attribute only.
 */
@xml
@root('atom:link')
export class AtomLink {
  @attribute href!: string;
  @attribute rel!: string | AtomRelation;
  @attribute type?: string;
  @attribute title?: string;
  @attribute etag?: string;
}
