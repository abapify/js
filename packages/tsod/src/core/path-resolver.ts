/**
 * tsod - Transform Schema Object Definition
 * Path resolution utilities
 */

/**
 * Parse path into segments
 */
export function parsePath(path: string, arrayMarker = '[]'): {
  segments: readonly string[];
  isArray: boolean;
} {
  const isArray = path.endsWith(arrayMarker);
  const cleanPath = isArray ? path.slice(0, -arrayMarker.length) : path;
  const segments = cleanPath.split('.').filter((s) => s.length > 0);

  return { segments, isArray };
}

/**
 * Get value from object by path
 */
export function getValue(
  obj: unknown,
  path: string,
  arrayMarker = '[]'
): unknown {
  if (obj == null) return undefined;

  const { segments } = parsePath(path, arrayMarker);
  let current: unknown = obj;

  for (const segment of segments) {
    if (current == null) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

/**
 * Set value in object by path (creates nested objects as needed)
 */
export function setValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
  arrayMarker = '[]'
): void {
  const { segments } = parsePath(path, arrayMarker);

  if (segments.length === 0) return;

  let current: Record<string, unknown> = obj;

  // Navigate to parent
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];

    if (!(segment in current)) {
      current[segment] = {};
    }

    const next = current[segment];
    if (typeof next !== 'object' || next === null || Array.isArray(next)) {
      current[segment] = {};
    }

    current = current[segment] as Record<string, unknown>;
  }

  // Set final value
  const lastSegment = segments[segments.length - 1];
  current[lastSegment] = value;
}
