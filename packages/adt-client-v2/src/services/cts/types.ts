/**
 * CTS Transport Service Types
 * 
 * Response types are inferred from ts-xsd transportmanagment schema.
 * This file is kept minimal - use schema types directly.
 */

// Re-export schema type for convenience
export type { InferXsd } from 'ts-xsd';
import type { transportmanagment } from 'adt-schemas-xsd';
import type { InferXsd } from 'ts-xsd';

/** Parsed transport response from /sap/bc/adt/cts/transportrequests */
export type TransportResponse = InferXsd<typeof transportmanagment>;
