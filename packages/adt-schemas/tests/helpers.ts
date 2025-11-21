/**
 * @file Test helpers
 * Reusable test utilities for schema testing
 */

import { strict as assert } from "node:assert";
import type { AdtSchema } from "../src/base/namespace.ts";

/**
 * Roundtrip test: XML → JSON → XML
 *
 * Tests that parsing XML and rebuilding it produces equivalent data
 *
 * @param schema - AdtSchema implementation
 * @param xml - Source XML string
 * @param assertions - Optional additional assertions on parsed object
 */
export function testRoundtrip<T>(
  schema: AdtSchema<T>,
  xml: string,
  assertions?: (parsed: T) => void
): void {
  // Parse XML to JSON
  const parsed = schema.fromAdtXml(xml);

  // Run custom assertions if provided
  if (assertions) {
    assertions(parsed);
  }

  // Build XML from JSON
  const rebuilt = schema.toAdtXml(parsed);

  // Parse the rebuilt XML
  const reparsed = schema.fromAdtXml(rebuilt);

  // The data should be identical after roundtrip
  assert.deepEqual(reparsed, parsed, "Roundtrip transformation should preserve data");
}

/**
 * Test XML parsing with assertions
 *
 * @param schema - AdtSchema implementation
 * @param xml - Source XML string
 * @param assertions - Assertions to run on parsed object
 * @returns The parsed object for further testing
 */
export function testParse<T>(
  schema: AdtSchema<T>,
  xml: string,
  assertions: (parsed: T) => void
): T {
  const parsed = schema.fromAdtXml(xml);
  assertions(parsed);
  return parsed;
}

/**
 * Test XML building with options
 *
 * @param schema - AdtSchema implementation
 * @param data - Data object to build from
 * @param options - Build options (xmlDecl, encoding)
 * @param assertions - Assertions to run on built XML
 */
export function testBuild<T>(
  schema: AdtSchema<T>,
  data: T,
  options: { xmlDecl?: boolean; encoding?: string },
  assertions: (xml: string) => void
): void {
  const xml = schema.toAdtXml(data, options);
  assertions(xml);
}
