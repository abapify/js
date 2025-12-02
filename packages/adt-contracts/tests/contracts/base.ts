/**
 * Contract Testing Framework
 * 
 * Type-safe contract validation without HTTP calls.
 * Tests contract definitions: method, path, headers, body, responses.
 */

import type { FixtureHandle } from 'adt-fixtures';

/** HTTP methods */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/** Contract descriptor returned by http.get/post/etc - loosely typed for flexibility */
export interface ContractDescriptor {
  method: HttpMethod;
  path: string;
  query?: unknown;
  headers?: Record<string, string>;
  body?: unknown;
  responses: Record<number, unknown>;
}

/** Contract operation definition */
export interface ContractOperation {
  /** Human-readable name */
  name: string;
  /** Function that returns the contract descriptor */
  contract: () => ContractDescriptor;
  /** Expected HTTP method */
  method: HttpMethod;
  /** Expected path (can be exact or pattern) */
  path: string | RegExp;
  /** Expected headers (partial match) */
  headers?: Record<string, string>;
  /** Expected query params */
  query?: Record<string, unknown>;
  /** Body schema validation */
  body?: {
    schema: unknown;
    /** Fixture to test build/parse round-trip */
    fixture?: FixtureHandle;
  };
  /** Response schema validation */
  response?: {
    status: number;
    schema: unknown;
    /** Fixture to test parse */
    fixture?: FixtureHandle;
  };
}

/**
 * Base class for contract scenarios.
 * Groups related operations for a single API area.
 */
export abstract class ContractScenario {
  /** Scenario name (e.g., 'CTS Transports') */
  abstract readonly name: string;
  /** Operations to test */
  abstract readonly operations: ContractOperation[];
}

/** Re-export FixtureHandle for convenience */
export type { FixtureHandle };
