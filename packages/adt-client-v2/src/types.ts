/**
 * Core types for ADT Client V2
 */

import type { RestContract, ElementSchema } from './base';
import type { Logger } from '@abapify/logger';

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
 * ADT REST Contract - extends REST contract with XML schema metadata
 *
 * Use this type for ADT API contracts that need automatic XML parsing/building
 */
export type AdtRestContract = RestContract & {
  // Contract methods can include schema metadata
  [key: string]: (...args: any[]) => {
    metadata?: {
      schema?: ElementSchema; // Shorthand for both request and response
      requestSchema?: ElementSchema; // Schema for building request XML
      responseSchema?: ElementSchema; // Schema for parsing response XML
    };
  };
};

// Re-export schema types from adt module for convenience
export type { ClassXml } from './adt/oo/classes/classes.schema';

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
