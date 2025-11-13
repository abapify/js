/**
 * xmlt - Universal XML ↔ JSON Transformer
 *
 * Zero-configuration bidirectional XML ↔ JSON transformation using pure XSLT with Saxon-JS.
 *
 * @packageDocumentation
 */

import SaxonJS from 'saxonjs-he';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Load pre-compiled SEF files using native JSON imports (cached by Node.js)
// These are bundled with the package in xslt/ folder
import xmlToJsonSef from '../xslt/xml-to-json-universal.sef.json' with { type: 'json' };
import jsonToXmlSef from '../xslt/json-to-xml-universal.sef.json' with { type: 'json' };
import jsonToXmlSchemaAwareSef from '../xslt/json-to-xml-schema-aware.sef.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Options for XML to JSON transformation
 */
export interface XmlToJsonOptions {
  /**
   * Whether to return formatted JSON (default: false)
   */
  format?: boolean;
}

/**
 * Options for JSON to XML transformation
 */
export interface JsonToXmlOptions {
  /**
   * Whether to format the output XML (default: true)
   */
  format?: boolean;
}

/**
 * Transform XML to JSON using universal XSLT transformation
 *
 * Features:
 * - Zero configuration - works with ANY XML structure
 * - Automatic type detection - boolean, number, string
 * - Automatic array detection - repeated elements become arrays
 * - Namespace stripping - removes namespace prefixes automatically
 * - Mixed content - handles text + attributes via `_text` property
 *
 * @param xml - XML string to transform
 * @param options - Transformation options
 * @returns Promise resolving to JSON object
 *
 * @example
 * ```typescript
 * const json = await xmlToJson('<book><title>XSLT Essentials</title></book>');
 * // { book: { title: "XSLT Essentials" } }
 * ```
 *
 * @example
 * ```typescript
 * // With automatic type detection
 * const json = await xmlToJson(`
 *   <product>
 *     <name>Laptop</name>
 *     <price>1299.99</price>
 *     <inStock>true</inStock>
 *   </product>
 * `);
 * // { product: { name: "Laptop", price: 1299.99, inStock: true } }
 * ```
 *
 * @example
 * ```typescript
 * // With arrays (repeated elements)
 * const json = await xmlToJson(`
 *   <chapters>
 *     <chapter id="1">Introduction</chapter>
 *     <chapter id="2">Advanced Topics</chapter>
 *   </chapters>
 * `);
 * // { chapters: { chapter: [{ id: 1, _text: "Introduction" }, { id: 2, _text: "Advanced Topics" }] } }
 * ```
 */
export async function xmlToJson<T = any>(
  xml: string,
  options: XmlToJsonOptions = {}
): Promise<T> {
  const result = await SaxonJS.transform(
    {
      stylesheetInternal: xmlToJsonSef,
      sourceText: xml,
      destination: 'serialized',
    },
    'async'
  );

  const json = JSON.parse(result.principalResult);

  if (options.format) {
    return JSON.parse(JSON.stringify(json, null, 2)) as T;
  }

  return json as T;
}

/**
 * Transform JSON to XML using universal XSLT transformation
 *
 * Features:
 * - Zero configuration - works with ANY JSON structure
 * - Smart strategy - complex children become elements, primitives become attributes
 * - Array handling - repeated elements for array items
 * - Type preservation - strings, numbers, booleans, null
 * - Mixed content - `_text` property becomes text content
 *
 * @param json - JSON object to transform
 * @param options - Transformation options
 * @returns Promise resolving to XML string
 *
 * @example
 * ```typescript
 * const xml = await jsonToXml({
 *   book: {
 *     title: "XSLT Essentials",
 *     author: "John Doe"
 *   }
 * });
 * // <book><title>XSLT Essentials</title><author>John Doe</author></book>
 * ```
 *
 * @example
 * ```typescript
 * // With arrays
 * const xml = await jsonToXml({
 *   order: {
 *     id: 12345,
 *     items: [
 *       { sku: "WIDGET-001", quantity: 2 },
 *       { sku: "GADGET-002", quantity: 1 }
 *     ]
 *   }
 * });
 * // <order><id>12345</id><items quantity="2" sku="WIDGET-001"/><items quantity="1" sku="GADGET-002"/></order>
 * ```
 *
 * @example
 * ```typescript
 * // With mixed content (_text property)
 * const xml = await jsonToXml({
 *   price: {
 *     currency: "USD",
 *     _text: 29.99
 *   }
 * });
 * // <price currency="USD">29.99</price>
 * ```
 */
export async function jsonToXml(
  json: any,
  options: JsonToXmlOptions = { format: true }
): Promise<string> {
  const result = await SaxonJS.transform(
    {
      stylesheetInternal: jsonToXmlSef,
      stylesheetParams: {
        'json-input': JSON.stringify(json),
      },
      destination: 'serialized',
    },
    'async'
  );

  return result.principalResult;
}

/**
 * Transform JSON to XML using schema-aware transformation
 *
 * This function uses the @metadata field in JSON to load transformation instructions
 * from a schema file. The schema defines how to reconstruct the exact XML structure
 * including namespaces, element ordering, and attribute placement.
 *
 * Features:
 * - Perfect XML reconstruction with namespaces
 * - Schema-driven transformation rules
 * - Dynamic schema loading from @metadata.schema path
 * - XPath-based pattern matching
 * - Element ordering and attribute namespace control
 *
 * @param json - JSON object with @metadata field containing schema reference
 * @param options - Transformation options
 * @returns Promise resolving to XML string
 *
 * @example
 * ```typescript
 * const json = {
 *   "@metadata": {
 *     "schema": "./schemas/package.instructions.v2.json"
 *   },
 *   "package": {
 *     "name": "$ABAPGIT_EXAMPLES",
 *     "type": "DEVC/K",
 *     "link": [
 *       { "href": "versions", "rel": "..." }
 *     ]
 *   }
 * };
 *
 * const xml = await jsonToXmlSchemaAware(json);
 * // Produces perfect XML with pak:, adtcore:, atom: namespaces
 * ```
 */
export async function jsonToXmlSchemaAware(
  json: any,
  options: JsonToXmlOptions = { format: true }
): Promise<string> {
  if (!json?.['@metadata']?.schema) {
    throw new Error(
      'Schema-aware transformation requires @metadata.schema field in JSON'
    );
  }

  const result = await SaxonJS.transform(
    {
      stylesheetInternal: jsonToXmlSchemaAwareSef,
      stylesheetParams: {
        'json-input': JSON.stringify(json),
      },
      destination: 'serialized',
    },
    'async'
  );

  return result.principalResult;
}

/**
 * Perform a round-trip transformation: JSON → XML → JSON
 *
 * Useful for validating data preservation through transformation.
 *
 * @param json - JSON object to transform
 * @returns Promise resolving to transformed JSON object
 *
 * @example
 * ```typescript
 * const original = {
 *   product: {
 *     name: "Laptop",
 *     price: 1299.99,
 *     inStock: true
 *   }
 * };
 *
 * const result = await roundTrip(original);
 * // Data preserved through JSON → XML → JSON transformation
 * ```
 */
export async function roundTrip<T = any>(json: any): Promise<T> {
  const xml = await jsonToXml(json);
  return xmlToJson<T>(xml);
}

// Export types
export type { default as SaxonJS } from 'saxonjs-he';

/**
 * Get the path to the XSLT files
 *
 * Useful if you want to use the XSLT files directly with another processor.
 *
 * @returns Object with paths to XSLT files
 *
 * @example
 * ```typescript
 * const paths = getXsltPaths();
 * console.log(paths.xmlToJson); // /path/to/xml-to-json-universal.xslt
 * console.log(paths.jsonToXml); // /path/to/json-to-xml-universal.xslt
 * ```
 */
export function getXsltPaths() {
  return {
    xmlToJson: join(__dirname, '../xslt/xml-to-json-universal.xslt'),
    jsonToXml: join(__dirname, '../xslt/json-to-xml-universal.xslt'),
    xmlToJsonSef: join(__dirname, '../xslt/xml-to-json-universal.sef.json'),
    jsonToXmlSef: join(__dirname, '../xslt/json-to-xml-universal.sef.json'),
  };
}
