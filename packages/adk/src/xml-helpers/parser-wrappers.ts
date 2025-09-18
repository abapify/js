/**
 * Parser-specific wrapper functions
 * These convert clean namespace format to parser-compatible formats
 */

// Type to convert namespace format to fast-xml-parser attribute format
type ToFastXmlParser<T> = T extends Record<string, any>
  ? {
      [K in keyof T as K extends `${string}:${string}`
        ? `@_${K}`
        : K]: T[K] extends Record<string, any> ? ToFastXmlParser<T[K]> : T[K];
    }
  : T;

/**
 * Convert namespace format to fast-xml-parser attribute format
 * Usage: $attr(adtcore(input))
 *
 * Transforms:
 *   {'adtcore:name': 'value'} → {'@_adtcore:name': 'value'}
 */
export function $attr<T extends Record<string, any>>(
  input: T
): ToFastXmlParser<T> {
  if (typeof input !== 'object' || input === null) {
    return input as any;
  }

  const result: any = {};

  for (const [key, value] of Object.entries(input)) {
    // Convert namespace:prop → @_namespace:prop for fast-xml-parser
    const newKey = key.includes(':') ? `@_${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively convert nested objects
      result[newKey] = $attr(value);
    } else {
      // Convert booleans to strings, but preserve other types
      if (typeof value === 'boolean') {
        result[newKey] = value ? 'true' : 'false';
      } else if (value instanceof Date) {
        result[newKey] = value.toISOString();
      } else {
        result[newKey] = value; // Keep numbers, strings as-is
      }
    }
  }

  return result as ToFastXmlParser<T>;
}

/**
 * Convert namespace format to element format (no @ prefix)
 * Usage: $elem(adtcore(input))
 *
 * Transforms:
 *   {'adtcore:name': 'value'} → {'adtcore:name': 'value'} (passthrough)
 */
export function $elem<T>(input: T): T {
  return input; // Passthrough - already in correct element format
}

/**
 * Convert fast-xml-parser format back to clean namespace format
 * Usage: $clean(parsedXml)
 *
 * Transforms:
 *   {'@_adtcore:name': 'value'} → {'adtcore:name': 'value'}
 */
export function $clean<T extends Record<string, any>>(input: T): any {
  if (typeof input !== 'object' || input === null) {
    return input;
  }

  const result: any = {};

  for (const [key, value] of Object.entries(input)) {
    // Convert @_namespace:prop → namespace:prop
    const newKey = key.startsWith('@_') ? key.substring(2) : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[newKey] = $clean(value);
    } else {
      result[newKey] = value;
    }
  }

  return result;
}
