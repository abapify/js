/**
 * Shared adapter utilities for transforming between XML and Clean API types
 */

/**
 * Convert string boolean to actual boolean
 */
export function stringToBoolean(value?: string): boolean | undefined {
  if (value === undefined) return undefined;
  return value === 'true' || value === 'X';
}

/**
 * Convert boolean to string boolean
 */
export function booleanToString(value?: boolean): string | undefined {
  if (value === undefined) return undefined;
  return value ? 'true' : 'false';
}

/**
 * Parse padded numeric string to number
 * SAP often sends numbers as "000010"
 */
export function parseNumericString(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Format number to padded string
 */
export function formatNumericString(
  value?: number,
  length: number = 6
): string | undefined {
  if (value === undefined) return undefined;
  return value.toString().padStart(length, '0');
}

/**
 * Flatten nested text element
 * { text: string } → string
 */
export function flattenText<T extends { text?: string }>(
  obj?: T
): string | undefined {
  return obj?.text;
}

/**
 * Nest string into text element
 * string → { text: string }
 */
export function nestText(value?: string): { text?: string } | undefined {
  if (value === undefined) return undefined;
  return { text: value };
}

/**
 * Extract nested value from path
 * Safely navigate nested objects
 */
export function getNestedValue<T>(obj: any, path: string[]): T | undefined {
  let current = obj;
  for (const key of path) {
    if (current === undefined || current === null) return undefined;
    current = current[key];
  }
  return current as T;
}
