/**
 * Core types for ADT Client V2
 */

import type { Logger } from '@abapify/logger';
import type { RestContract } from '@abapify/adt-contracts';

// Re-export Logger for convenience
export type { Logger };

// Connection configuration
export interface AdtConnectionConfig {
  baseUrl: string;
  username?: string;
  password?: string;
  cookieHeader?: string; // For SAML authentication
  client?: string;
  language?: string;
  logger?: Logger;
}

/**
 * ADT REST Contract
 * @deprecated Use RestContract from @abapify/adt-contracts directly
 */
export type AdtRestContract = RestContract;

// Note: Class/Interface types are available from adt-schemas via InferXsd
// Example: import { classes, InferXsd } from 'adt-schemas';
// type ClassData = InferXsd<typeof classes, 'AbapClass'>;

// Error response from ADT
export interface AdtError {
  message: string;
  code?: string;
  details?: string;
}

// Lock handle for object locking
export interface LockHandle {
  lockHandle: string;
  objectUri: string;
}

// Create/Update result
export interface OperationResult {
  success: boolean;
  message?: string;
}
