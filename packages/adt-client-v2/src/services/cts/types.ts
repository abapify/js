/**
 * CTS Transport Service Types
 * 
 * Response types are inferred from ts-xsd transportmanagment schema.
 * Additional types for service layer operations.
 */

// Note: Response types are inferred from the service methods via TransportService type
// This ensures consumers always get the correct type even if the contract changes

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

/**
 * Lock handle returned by lock operations
 */
export interface LockHandle {
  /** Lock handle string for subsequent operations */
  handle: string;
  /** Correlation number (optional) */
  correlationNumber?: string;
  /** Correlation user (optional) */
  correlationUser?: string;
}
