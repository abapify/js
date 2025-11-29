/**
 * xs:extension handling
 * 
 * Handles complexContent > extension pattern for type inheritance in XSD.
 * Extracts base type reference and generates `extends` property.
 */

import type { XmlElement } from '../types';
import { findChild } from '../utils';

/**
 * Extract extension info from a complexType element
 * 
 * @param typeEl - The complexType element
 * @param nsMap - Namespace prefix to URI mapping
 * @returns Extension info with base type, or undefined if no extension
 */
export interface ExtensionInfo {
  /** Base type name (without namespace prefix) */
  base: string;
  /** Original base type with prefix (e.g., "abapoo:AbapOoObject") */
  baseWithPrefix: string;
  /** Namespace URI of the base type (if prefixed) */
  baseNamespace?: string;
  /** The extension element containing sequence/attributes */
  extensionEl: XmlElement;
}

/**
 * Extract extension information from a complexType
 */
export function extractExtension(
  typeEl: XmlElement,
  nsMap?: Map<string, string>
): ExtensionInfo | undefined {
  const complexContent = findChild(typeEl, 'complexContent');
  if (!complexContent) return undefined;

  const extension = findChild(complexContent, 'extension');
  if (!extension) return undefined;

  const baseAttr = extension.getAttribute('base');
  if (!baseAttr) return undefined;

  // Parse base type: "prefix:TypeName" or "TypeName"
  const parts = baseAttr.split(':');
  const hasPrefix = parts.length > 1;
  const prefix = hasPrefix ? parts[0] : '';
  const base = hasPrefix ? parts[1] : parts[0];

  // Resolve namespace from prefix
  const baseNamespace = prefix && nsMap ? nsMap.get(prefix) : undefined;

  return {
    base,
    baseWithPrefix: baseAttr,
    baseNamespace,
    extensionEl: extension,
  };
}

/**
 * Generate extends property for schema element definition
 */
export function generateExtendsObj(
  typeEl: XmlElement,
  nsMap?: Map<string, string>
): string | undefined {
  const ext = extractExtension(typeEl, nsMap);
  return ext?.base;
}

/**
 * Generate extends property as TypeScript code string
 */
export function generateExtendsDef(
  typeEl: XmlElement,
  nsMap?: Map<string, string>
): string | undefined {
  const ext = extractExtension(typeEl, nsMap);
  return ext ? `extends: '${ext.base}'` : undefined;
}
