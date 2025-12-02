/**
 * ADT XML Schemas - Speci-compatible
 * 
 * This package exports XSD schemas with parse/build methods
 * for automatic type inference in speci contracts.
 * 
 * Schemas are generated using ts-xsd factory generator,
 * so they're already wrapped with parse/build at generation time.
 * 
 * @example
 * import { configurations } from 'adt-schemas-xsd';
 * 
 * // In speci contract - type is automatically inferred
 * const contract = {
 *   get: () => http.get('/endpoint', {
 *     responses: { 200: configurations },
 *   }),
 * };
 * 
 * // Direct parsing
 * const data = configurations.parse(xmlString);
 */

// Re-export all schemas (already wrapped with parse/build)
export * from './schemas';