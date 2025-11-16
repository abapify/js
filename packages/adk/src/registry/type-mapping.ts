/**
 * Type detection utilities for ADT XML
 *
 * Extracts object type from XML without full parsing
 */

import { ADT_TYPE_TO_KIND, type Kind } from './kinds';

/**
 * Extract adtcore:type attribute from XML string
 *
 * @param xml - ADT XML string
 * @returns Object type (e.g., "CLAS/OC", "INTF/OI", "DOMA/DD") or undefined
 */
export function extractTypeFromXml(xml: string): string | undefined {
  // Match adtcore:type="..." attribute
  const match = xml.match(/adtcore:type="([^"]+)"/);
  return match?.[1];
}

/**
 * Extract root element name from XML string
 *
 * @param xml - ADT XML string
 * @returns Root element name (e.g., "class:abapClass", "intf:abapInterface") or undefined
 */
export function extractRootElement(xml: string): string | undefined {
  // Skip XML declaration
  const cleanXml = xml.replace(/^<\?xml[^>]*\?>\s*/, '');
  // Match first element tag
  const match = cleanXml.match(/^<([^\s>]+)/);
  return match?.[1];
}

/**
 * Map ADT type to object kind
 *
 * Uses centralized ADT_TYPE_TO_KIND mapping from kinds.ts
 *
 * @param type - ADT type (e.g., "CLAS/OC", "INTF/OI")
 * @returns Kind enum value or undefined if not registered
 */
export function mapTypeToKind(type: string): Kind | undefined {
  return ADT_TYPE_TO_KIND[type];
}
