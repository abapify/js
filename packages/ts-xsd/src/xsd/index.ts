/**
 * XSD Module
 * 
 * Parse and build XSD files using ts-xsd itself.
 * This is a self-hosting implementation - ts-xsd uses its own
 * schema format to define and process XSD files.
 */

import { parse } from '../xml/parse';
import { build, type BuildOptions } from '../xml/build';
import { XsdSchemaDefinition } from './schema';
import type { XsdDocument } from './types';

// Re-export types
export type * from './types';
export { XsdSchemaDefinition } from './schema';

/**
 * Parse an XSD string into a typed XsdDocument
 * 
 * @param xsd - XSD file content as string
 * @returns Parsed XSD document with full type information
 * 
 * @example
 * ```typescript
 * const xsdDoc = parseXsd(`
 *   <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
 *     <xs:element name="Person" type="PersonType"/>
 *     <xs:complexType name="PersonType">
 *       <xs:sequence>
 *         <xs:element name="Name" type="xs:string"/>
 *       </xs:sequence>
 *     </xs:complexType>
 *   </xs:schema>
 * `);
 * 
 * console.log(xsdDoc.element?.[0].name); // "Person"
 * console.log(xsdDoc.complexType?.[0].name); // "PersonType"
 * ```
 */
export function parseXsd(xsd: string): XsdDocument {
  return parse(XsdSchemaDefinition, xsd) as unknown as XsdDocument;
}

/**
 * Build an XSD string from an XsdDocument
 * 
 * @param doc - XSD document object
 * @param options - Build options (pretty print, etc.)
 * @returns XSD file content as string
 * 
 * @example
 * ```typescript
 * const xsdDoc: XsdDocument = {
 *   targetNamespace: 'http://example.com',
 *   element: [
 *     { name: 'Person', type: 'PersonType' }
 *   ],
 *   complexType: [
 *     {
 *       name: 'PersonType',
 *       sequence: {
 *         element: [
 *           { name: 'Name', type: 'xs:string' }
 *         ]
 *       }
 *     }
 *   ]
 * };
 * 
 * const xsd = buildXsd(xsdDoc, { pretty: true });
 * ```
 */
export function buildXsd(doc: XsdDocument, options: BuildOptions = {}): string {
  return build(XsdSchemaDefinition, doc as unknown, {
    ...options,
    elementName: 'schema',
  });
}
