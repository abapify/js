import { createHash } from 'node:crypto';

export function compareStrings(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function canonicalize(value: unknown, key = '', invokeToJson = true): unknown {
  if (invokeToJson && value !== null && typeof value === 'object') {
    const toJson = (value as { toJSON?: (key: string) => unknown }).toJSON;
    if (typeof toJson === 'function') {
      return canonicalize(toJson.call(value, key), '', false);
    }
  }
  if (Array.isArray(value)) {
    return value.map((item, index) => canonicalize(item, String(index)));
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .sort(([left], [right]) => compareStrings(left, right))
        .map(([entryKey, item]) => [entryKey, canonicalize(item, entryKey)]),
    );
  }
  return value;
}

export function stableJson(value: unknown): string {
  const serialized = JSON.stringify(canonicalize(value), null, 2);
  if (serialized === undefined) {
    throw new TypeError('Value cannot be serialized to stable JSON.');
  }
  return `${serialized}\n`;
}

export function sha256(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

export function digest(value: unknown): string {
  return sha256(stableJson(value));
}
