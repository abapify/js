/**
 * Interface namespace (intf:*) - ABAP Interface object model
 * Based on SAP ADT XML: <intf:abapInterface>
 */

// Interface-specific attributes that become XML attributes on <intf:abapInterface> element
// Note: Based on fixture, interfaces seem to only use attributes from other namespaces
// (adtcore, abapoo, abapsource), not intf-specific attributes
export interface IntfAttributes {
  // Currently no intf-specific attributes - all come from other namespaces
  // This is different from classes which have class:final, class:abstract, etc.
}

// Interface elements
export interface IntfElements {
  // Note: Unlike classes, interfaces don't seem to have intf-specific child elements
  // All child elements come from other namespaces (atom:link, adtcore:packageRef, etc.)
}

/**
 * Interface namespace (intf:*) - Smart namespace with automatic attribute/element detection
 * Currently empty as interfaces use other namespaces for their attributes/elements
 */
export type IntfType = IntfAttributes & IntfElements;

// Interface decorator - smart namespace with automatic attribute/element detection
import { createNamespace } from '../decorators/decorators-v2';

export const intf = createNamespace<IntfElements, IntfAttributes>({
  name: 'intf',
  uri: 'http://www.sap.com/adt/oo/interfaces',
});
