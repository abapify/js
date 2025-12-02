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

/**
 * Generate simpleType object from XSD simpleType element
 * Extracts restriction base, enumerations, patterns, etc.
 */
export function generateSimpleTypeObj(typeEl: XmlElement): Record<string, unknown> | null {
  const result: Record<string, unknown> = {};
  
  // Find restriction element
  const children = typeEl.childNodes;
  for (let i = 0; i < children.length; i++) {
    const child = children[i] as XmlElement;
    if (child.nodeType !== 1) continue;
    
    const localName = child.localName || child.tagName?.split(':').pop();
    
    if (localName === 'restriction') {
      const base = child.getAttribute('base');
      if (base) {
        result.restriction = mapXsdType(base);
      }
      
      // Collect enumeration values
      const enumValues: string[] = [];
      const restrictionChildren = child.childNodes;
      for (let j = 0; j < restrictionChildren.length; j++) {
        const rChild = restrictionChildren[j] as XmlElement;
        if (rChild.nodeType !== 1) continue;
        
        const rLocalName = rChild.localName || rChild.tagName?.split(':').pop();
        
        if (rLocalName === 'enumeration') {
          const value = rChild.getAttribute('value');
          if (value !== null) {
            enumValues.push(value);
          }
        } else if (rLocalName === 'pattern') {
          const value = rChild.getAttribute('value');
          if (value) {
            result.pattern = value;
          }
        } else if (rLocalName === 'minLength') {
          const value = rChild.getAttribute('value');
          if (value) {
            result.minLength = parseInt(value, 10);
          }
        } else if (rLocalName === 'maxLength') {
          const value = rChild.getAttribute('value');
          if (value) {
            result.maxLength = parseInt(value, 10);
          }
        }
      }
      
      if (enumValues.length > 0) {
        result.enum = enumValues;
      }
      
      break;
    }
  }
  
  // Return null if no restriction found (not a useful simpleType)
  if (!result.restriction) {
    return null;
  }
  
  return result;
}
