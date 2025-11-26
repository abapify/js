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

// Re-export speci utilities and schema wrapper
export { http, createHttp, type RestContract } from 'speci/rest';
export { schema, contract, type Serializable, type SerializableSchema } from './base';

// ADT contracts
export {
  adtContract,
  ctsContract,
  atcContract,
  ooContract,
  type AdtContract,
  type CtsContract,
  type AtcContract,
  type OoContract,
} from './adt';

// Re-export schemas for convenience
export * from 'adt-schemas-xsd';
