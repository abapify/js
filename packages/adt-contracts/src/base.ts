/**
 * Base contract utilities
 * 
 * Re-exports speci utilities for contract definitions.
 * 
 * Schemas from adt-schemas-xsd are already speci-compatible
 * (they have parse/build methods), so no wrapping is needed.
 */

export { http, createHttp, type RestContract } from 'speci/rest';

/**
 * Identity function for contract definitions.
 * 
 * Schemas from adt-schemas-xsd are already speci-compatible,
 * so this is just a pass-through for type safety and documentation.
 * 
 * @example
 * ```ts
 * import { configurations } from 'adt-schemas-xsd';
 * import { contract, http } from '../base';
 * 
 * export const myContract = contract({
 *   get: () => http.get('/endpoint', {
 *     responses: { 200: configurations },
 *   }),
 * });
 * // Type is automatically inferred from configurations.parse() return type
 * ```
 */
export function contract<T extends Record<string, any>>(definition: T): T {
  return definition;
}
