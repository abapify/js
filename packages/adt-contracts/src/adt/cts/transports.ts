/**
 * /sap/bc/adt/cts/transports/**
 * ADT CTS Transports Contract
 *
 * GET with _action=FIND - Search transports (undocumented but works)
 *
 * Uses manual ts-xsd schema from adt-schemas-xsd for proper XML parsing.
 */

import { http } from 'speci/rest';
import { transportfind } from 'adt-schemas-xsd';

// ============================================================================
// URL Parameter Enums
// ============================================================================

/**
 * Transport function codes (TRFUNCTION field)
 */
export const TransportFunction = {
  /** Workbench request - development objects */
  WORKBENCH: 'K',
  /** Customizing request - configuration */
  CUSTOMIZING: 'W',
  /** Transport of copies */
  TRANSPORT_OF_COPIES: 'T',
  /** Development/correction task */
  DEVELOPMENT_CORRECTION: 'S',
  /** Repair task */
  REPAIR: 'R',
  /** Unclassified task */
  UNCLASSIFIED: 'X',
  /** Customizing task */
  CUSTOMIZING_TASK: 'Q',
  /** Wildcard - all types */
  ALL: '*',
} as const;

export type TransportFunctionCode =
  (typeof TransportFunction)[keyof typeof TransportFunction];

/**
 * Transport status codes (TRSTATUS field)
 */
export const TransportStatus = {
  /** Modifiable - can be edited */
  MODIFIABLE: 'D',
  /** Release started - in progress */
  RELEASE_STARTED: 'O',
  /** Release in preparation */
  RELEASE_IN_PREPARATION: 'P',
  /** Released - locked, cannot be edited */
  RELEASED: 'R',
  /** Locked */
  LOCKED: 'L',
} as const;

export type TransportStatusCode =
  (typeof TransportStatus)[keyof typeof TransportStatus];

/**
 * Search mode - what to search for
 */
export const SearchMode = {
  /** Search requests only */
  REQUEST_ONLY: 'request',
  /** Search tasks only */
  TASK_ONLY: 'task',
  /** Search both requests and tasks */
  REQUEST_AND_TASK: 'requestWithTask',
} as const;

export type SearchModeValue = (typeof SearchMode)[keyof typeof SearchMode];

/**
 * Date filter presets
 */
export const DateFilter = {
  /** Last 7 days */
  LAST_WEEK: '0',
  /** Last 14 days */
  LAST_2_WEEKS: '1',
  /** Last 28 days */
  LAST_4_WEEKS: '2',
  /** Last ~3 months (92 days) */
  LAST_3_MONTHS: '3',
  /** Custom date range */
  CUSTOM: '4',
  /** All time (since 1950-01-01) */
  ALL: '5',
} as const;

export type DateFilterValue = (typeof DateFilter)[keyof typeof DateFilter];

// ============================================================================
// URL Parameters Interface
// ============================================================================

/**
 * Query parameters for transport find endpoint
 */
export interface TransportFindParams {
  /** Action - must be 'FIND' for search */
  _action: 'FIND';
  /** Owner filter - username or '*' for all */
  user: string;
  /** Transport function filter - use TransportFunction enum or '*' */
  trfunction: TransportFunctionCode | string;
  /** Transport number pattern (optional) - e.g., 'S0DK*' */
  transportNumber?: string;
  /** Request status filter (optional) - comma-separated TransportStatus codes */
  requestStatus?: string;
  /** Task status filter (optional) - comma-separated TransportStatus codes */
  taskStatus?: string;
  /** Request type filter (optional) - comma-separated TransportFunction codes */
  requestType?: string;
  /** Task type filter (optional) - comma-separated TransportFunction codes */
  taskType?: string;
  /** Search mode (optional) */
  searchFor?: SearchModeValue;
  /** From date filter (optional) - format: yyyyMMdd */
  fromDate?: string;
  /** To date filter (optional) - format: yyyyMMdd */
  toDate?: string;
}

// ============================================================================
// Response Schema
// ============================================================================

/**
 * Single transport header from the response
 */
export interface CtsReqHeader {
  /** Transport number (e.g., S0DK921630) */
  TRKORR: string;
  /** Transport function code */
  TRFUNCTION: string;
  /** Transport status code */
  TRSTATUS: string;
  /** Target system (e.g., /SOD_ALL/) */
  TARSYSTEM: string;
  /** Owner username */
  AS4USER: string;
  /** Creation/modification date (YYYY-MM-DD) */
  AS4DATE: string;
  /** Creation/modification time (HH:MM:SS) */
  AS4TIME: string;
  /** Description text */
  AS4TEXT: string;
  /** Client number */
  CLIENT: string;
  /** Repository ID (usually empty) */
  REPOID?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Normalize response to always return array of headers
 * Works with the parsed transportfind schema response
 */
export function normalizeTransportFindResponse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  response: any
): CtsReqHeader[] {
  // ts-xsd parses root element content directly: { version, values: { DATA: { CTS_REQ_HEADER: [...] } } }
  const headers = response?.values?.DATA?.CTS_REQ_HEADER;
  if (!headers) return [];
  return Array.isArray(headers) ? headers : [headers];
}

// ============================================================================
// Contract
// ============================================================================

export const transports = {
  /**
   * Search transports with filters
   *
   * GET /sap/bc/adt/cts/transports?_action=FIND&user=X&trfunction=*
   *
   * @example
   * // Find all modifiable workbench requests for current user
   * const result = await client.cts.transports.find({
   *   _action: 'FIND',
   *   user: 'PPLENKOV',
   *   trfunction: '*',
   * });
   *
   * @example
   * // Find with status filter
   * const result = await client.cts.transports.find({
   *   _action: 'FIND',
   *   user: '*',
   *   trfunction: 'K',
   *   requestStatus: 'D',  // Modifiable only
   * });
   */
  find: (params: TransportFindParams) =>
    http.get('/sap/bc/adt/cts/transports', {
      query: params,
      responses: { 200: transportfind },
      headers: { Accept: '*/*' },
    }),
};
