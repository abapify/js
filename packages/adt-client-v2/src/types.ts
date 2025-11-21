/**
 * Core types for ADT Client V2
 */

import type { RestContract, ElementSchema } from './base';

/**
 * Logger interface for ADT Client V2
 * Compatible with pino/winston/bunyan and custom loggers
 */
export interface Logger {
  trace(msg: string, obj?: any): void;
  debug(msg: string, obj?: any): void;
  info(msg: string, obj?: any): void;
  warn(msg: string, obj?: any): void;
  error(msg: string, obj?: any): void;
  fatal(msg: string, obj?: any): void;
  child(bindings: Record<string, any>): Logger;
}

// Connection configuration
export interface AdtConnectionConfig {
  baseUrl: string;
  username: string;
  password: string;
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
