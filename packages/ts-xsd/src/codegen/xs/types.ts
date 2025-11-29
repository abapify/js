/**
 * xs:simpleType handling
 * 
 * Maps XSD primitive types to ts-xsd types
 */

import type { XmlElement } from '../types';

/**
 * Map XSD primitive type to ts-xsd type
 */
export function mapXsdType(xsdType: string): string {
  const localType = xsdType.includes(':') ? xsdType.split(':').pop()! : xsdType;

  switch (localType) {
    // String types
    case 'string':
    case 'normalizedString':
    case 'token':
    case 'NMTOKEN':
    case 'Name':
    case 'NCName':
    case 'ID':
    case 'IDREF':
    case 'anyURI':
    case 'language':
      return 'string';

    // Numeric types
    case 'int':
    case 'integer':
    case 'long':
    case 'short':
    case 'byte':
    case 'decimal':
    case 'float':
    case 'double':
    case 'positiveInteger':
    case 'negativeInteger':
    case 'nonPositiveInteger':
    case 'nonNegativeInteger':
    case 'unsignedInt':
    case 'unsignedLong':
    case 'unsignedShort':
    case 'unsignedByte':
      return 'number';

    // Boolean
    case 'boolean':
      return 'boolean';

    // Date/time types
    case 'date':
    case 'dateTime':
    case 'time':
      return 'date';

    default:
      return 'string';
  }
}

/**
 * Resolve XSD type to ts-xsd type
 * Handles complex type references and simple type mappings
 */
export function resolveType(
  type: string | null,
  complexTypes: Map<string, XmlElement>,
  simpleTypes: Map<string, XmlElement>
): string {
  if (!type) return 'string';

  // Check for namespace prefix
  const hasPrefix = type.includes(':');
  const prefix = hasPrefix ? type.split(':')[0] : '';
  const localType = hasPrefix ? type.split(':').pop()! : type;

  // Check if it's a complex type reference (local)
  if (complexTypes.has(localType)) {
    return localType;
  }

  // Check if it's a simple type (enum)
  if (simpleTypes.has(localType)) {
    return 'string'; // For now, treat enums as strings
  }

  // If it has a non-xs namespace prefix, treat as complex type from imported schema
  // This handles cases like tm:request where the type is defined in an imported schema
  if (hasPrefix && prefix !== 'xs' && prefix !== 'xsd') {
    return localType;
  }

  // Map XSD primitive types
  return mapXsdType(localType);
}
