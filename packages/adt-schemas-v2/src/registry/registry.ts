/**
 * Content-Type Schema Registry
 *
 * Central registry mapping content-types to schemas and adapters
 */

import { ADT_CONTENT_TYPES, type AdtContentType } from './content-types';

/**
 * Schema adapter interface
 * Each namespace provides an adapter implementing this interface
 */
export interface SchemaAdapter<TClean = any, TXml = any> {
  /**
   * Content-type this adapter handles
   */
  readonly contentType: string;

  /**
   * Parse XML string to clean API type
   */
  fromXml(xml: string): TClean;

  /**
   * Build XML string from clean API type
   */
  toXml(
    data: TClean,
    options?: { xmlDecl?: boolean; encoding?: string }
  ): string;

  /**
   * Convert technical XML type to clean API type
   */
  toClean(xmlData: TXml): TClean;

  /**
   * Convert clean API type to technical XML type
   */
  toXml(cleanData: TClean): TXml;
}

/**
 * Schema registry entry
 */
interface RegistryEntry {
  contentType: string;
  adapter: SchemaAdapter;
  namespace: string;
  version: string;
}

/**
 * Internal registry storage
 */
const registry = new Map<string, RegistryEntry>();

/**
 * Register a schema adapter for a content-type
 *
 * @param contentType - SAP content-type
 * @param adapter - Schema adapter implementation
 *
 * @example
 * ```typescript
 * registerSchema(ADT_CONTENT_TYPES.PACKAGE, PackageAdapter);
 * ```
 */
export function registerSchema(
  contentType: string,
  adapter: SchemaAdapter
): void {
  const namespace = extractNamespace(contentType);
  const version = extractVersion(contentType);

  registry.set(contentType, {
    contentType,
    adapter,
    namespace: namespace || 'unknown',
    version: version || 'v1',
  });
}

/**
 * Get schema adapter by content-type
 *
 * @param contentType - SAP content-type
 * @returns Schema adapter or undefined if not found
 *
 * @example
 * ```typescript
 * const adapter = getSchemaByContentType('application/vnd.sap.adt.packages.v1+xml');
 * const pkg = adapter.fromXml(xmlString);
 * ```
 */
export function getSchemaByContentType(
  contentType: string
): SchemaAdapter | undefined {
  return registry.get(contentType)?.adapter;
}

/**
 * Get all registered content-types
 *
 * @returns Array of registered content-types
 */
export function getAllContentTypes(): string[] {
  return Array.from(registry.keys());
}

/**
 * Get all schemas for a namespace
 *
 * @param namespace - Namespace name (e.g., "packages", "oo.classes")
 * @returns Array of schema adapters for the namespace
 */
export function getSchemasByNamespace(namespace: string): SchemaAdapter[] {
  return Array.from(registry.values())
    .filter((entry) => entry.namespace === namespace)
    .map((entry) => entry.adapter);
}

/**
 * Check if content-type is registered
 */
export function hasSchema(contentType: string): boolean {
  return registry.has(contentType);
}

/**
 * Clear registry (useful for testing)
 */
export function clearRegistry(): void {
  registry.clear();
}

/**
 * Helper: Extract namespace from content-type
 */
function extractNamespace(contentType: string): string | undefined {
  const match = contentType.match(/application\/vnd\.sap\.adt\.([^.]+)/);
  return match?.[1];
}

/**
 * Helper: Extract version from content-type
 */
function extractVersion(contentType: string): string | undefined {
  const match = contentType.match(/\.v(\d+)\+xml/);
  return match ? `v${match[1]}` : undefined;
}
