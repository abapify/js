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

// Re-export speci utilities and contract wrapper
export { http, createHttp, type RestContract } from 'speci/rest';
export { contract } from './base';

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

// Re-export CTS transport types for convenience
export {
  TransportFunction,
  TransportStatus,
  SearchMode,
  DateFilter,
  normalizeTransportFindResponse,
  type TransportFindParams,
  type CtsReqHeader,
  type TransportFunctionCode,
  type TransportStatusCode,
  type SearchModeValue,
  type DateFilterValue,
} from './adt/cts/transports';

// Re-export schemas for convenience
export * from 'adt-schemas-xsd';
