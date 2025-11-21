/**
 * ADT XML Namespaces Registry
 *
 * Central registry for all ADT XML namespaces used across the client.
 * This ensures consistency and makes it easy to reference namespaces.
 *
 * @example
 * import { NS } from './namespaces';
 *
 * const schema = {
 *   ns: {
 *     adtcore: NS.adtcore,
 *     class: NS.class,
 *   }
 * };
 */

export enum NS {
  /** ADT Core - common attributes across all ADT objects */
  adtcore = 'http://www.sap.com/adt/core',

  /** ADT Object-Oriented - OO-specific elements */
  abapoo = 'http://www.sap.com/adt/oo',

  /** ADT OO Classes - class-specific elements */
  class = 'http://www.sap.com/adt/oo/classes',

  /** ABAP Source - ABAP source code attributes */
  abapsource = 'http://www.sap.com/adt/abapsource',

  /** Atom - links and feeds (RFC 4287) */
  atom = 'http://www.w3.org/2005/Atom',

  /** AtomPub - Atom Publishing Protocol (RFC 5023) */
  app = 'http://www.w3.org/2007/app',

  /** ADT Component - ADT component-specific elements */
  adtcomp = 'http://www.sap.com/adt/component',
}
