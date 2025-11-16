import type { ElementSchema } from "./types.ts";

/**
 * Schema builder API
 */
export const tsxml = {
  /**
   * Create a typed element schema
   */
  schema: <S extends ElementSchema>(s: S): S => s,
};
