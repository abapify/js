/**
 * ABAP OO namespace (abapoo:*) - ABAP Object Oriented attributes
 * Based on XML: abapoo:modeled
 */
export interface AbapOOType {
  modeled: boolean;
}

// ABAP OO namespace URI
export const ABAPOO_NAMESPACE_URI = 'http://www.sap.com/adt/oo';

// ABAP OO decorator
import { namespace } from '../decorators';
export const abapoo = namespace('abapoo', ABAPOO_NAMESPACE_URI);
