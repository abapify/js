/**
 * ADT Contracts
 * 
 * Type-safe SAP ADT REST API contracts using speci + ts-xsd schemas.
 * 
 * @example
 * ```typescript
 * import { adtContract } from 'adt-contracts';
 * import { createClient } from 'speci/rest';
 * 
 * const client = createClient(adtContract, {
 *   baseUrl: 'https://sap-server.example.com',
 *   adapter: myAdapter,
 * });
 * 
 * // Full type inference from XSD schemas!
 * const transport = await client.cts.getTransportRequests();
 * ```
 */

// ADT contracts
export * from './adt';
