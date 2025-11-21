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
 * - `speci` - Core types and utilities
 * - `speci/rest` - REST API helpers (GET, POST, PUT, DELETE, etc.)
 * - `speci/client` - Client generation utilities
 * - `speci/openapi` - OpenAPI generation (planned)
 * - `speci/cli` - CLI generation (planned)
 *
 * @example
 * ```typescript
 * import { get, post } from 'speci/rest';
 * import { createClient, createFetchAdapter } from 'speci/client';
 *
 * // Define your contract
 * const api = {
 *   users: {
 *     get: (id: string) => get(`/users/${id}`, {
 *       responses: { 200: UserSchema }
 *     }),
 *
 *     create: (user: UserInput) => post('/users', {
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
