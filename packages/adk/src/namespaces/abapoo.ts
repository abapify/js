/**
 * ABAP OO attributes - these become XML attributes
 */
export interface AbapOOAttributes {
  modeled: boolean;
}

/**
 * ABAP OO elements - these become XML child elements
 */
export interface AbapOOElements {
  // No child elements for abapoo namespace currently
}

/**
 * ABAP OO namespace (abapoo:*) - Smart namespace with automatic attribute/element detection
 * Attributes: simple values (string, number, boolean)
 * Elements: complex values (objects, arrays)
 */
export type AbapOOType = AbapOOAttributes & AbapOOElements;

// ABAP OO decorator - smart namespace with automatic attribute/element detection
import { createNamespace } from '../decorators/decorators-v2';

export const abapoo = createNamespace<AbapOOElements, AbapOOAttributes>({
  name: 'abapoo',
  uri: 'http://www.sap.com/adt/oo',
});
