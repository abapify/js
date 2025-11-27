/**
 * CTS Transport Service Types
 * 
 * Response types are inferred from ts-xsd transportmanagment schema.
 * Additional types for service layer operations.
 */

// Re-export schema type for convenience
export type { InferXsd } from 'ts-xsd';
import type { transportmanagment } from 'adt-schemas-xsd';
import type { InferXsd } from 'ts-xsd';

/** Parsed transport response from /sap/bc/adt/cts/transportrequests */
export type TransportResponse = InferXsd<typeof transportmanagment>;

/**
 * ABAP Object in a transport
 */
export interface TransportObject {
  /** Program ID (R3TR, LIMU, CORR) */
  pgmid?: string;
  /** Object type (CLAS, PROG, TABL, etc.) */
  type?: string;
  /** Object name */
  name?: string;
  /** Workbench type */
  wbtype?: string;
  /** Object URI */
  uri?: string;
  /** Object info */
  obj_info?: string;
  /** Object description */
  obj_desc?: string;
}

/**
 * Task within a transport request
 */
export interface TransportTask {
  /** Task number */
  number?: string;
  /** Task owner */
  owner?: string;
  /** Task description */
  desc?: string;
  /** Task status (D=modifiable, R=released, etc.) */
  status?: string;
  /** Objects in this task */
  objects: TransportObject[];
}

/**
 * Transport request with normalized structure
 */
export interface TransportRequest {
  /** Transport number (e.g., S0DK921630) */
  number: string;
  /** Transport owner */
  owner?: string;
  /** Transport description */
  desc?: string;
  /** Transport status (D=modifiable, R=released, etc.) */
  status?: string;
  /** Transport URI */
  uri?: string;
  /** Tasks in this transport */
  tasks: TransportTask[];
  /** All objects (from request and tasks combined) */
  objects: TransportObject[];
}
