/**
 * Speci v0.1 - Minimal Arrow-Function-Based Contract Specification
 *
 * Zero decorators, zero DSL, zero dependencies.
 * Just TypeScript arrow functions that define API contracts.
 *
 * ## Modular Architecture
 *
 * Speci is organized into protocol-specific modules:
 *
 * - `@abapify/speci` - Core types and utilities
 * - `@abapify/speci/rest` - REST API helpers (GET, POST, PUT, DELETE, etc.) and client generation utilities
 * - `@abapify/speci/openapi` - OpenAPI generation (planned)
 * - `@abapify/speci/cli` - CLI generation (planned)
 *
 * @example
 * ```typescript
 * import { http, createClient, createFetchAdapter } from '@abapify/speci/rest';
 *
 * // Define your contract
 * const api = {
 *   users: {
 *     get: (id: string) => http.get(`/users/${id}`, {
 *       responses: { 200: UserSchema }
 *     }),
 *
 *     create: (user: UserInput) => http.post('/users', {
 *       body: user,
 *       responses: { 201: UserSchema }
 *     })
 *   }
 * };
 *
 * // Generate a typed client
 * const client = createClient(api, {
 *   baseUrl: 'https://api.example.com',
 *   adapter: createFetchAdapter()
 * });
 *
 * // Use it with full type safety
 * const user = await client.users.get('123');
 * ```
 */

// Core specification types (protocol-agnostic)
export * from './core';

// Re-export commonly used REST types for convenience
export type { Serializable, Inferrable } from './rest/types';
