import type { PrimitiveType } from "./types.ts";

/**
 * Convert value to string based on primitive type
 */
export function toString(type: PrimitiveType, value: any): string {
  if (type === "date") {
    return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
  }
  if (type === "boolean") {
    return String(value);
  }
  if (type === "number") {
    return String(value);
  }
  return String(value);
}

/**
 * Parse string to typed value based on primitive type
 */
export function fromString(type: PrimitiveType, raw: string): any {
  if (type === "boolean") {
    return raw === "true";
  }
  if (type === "number") {
    return Number(raw);
  }
  if (type === "date") {
    return new Date(raw);
  }
  return raw;
}
