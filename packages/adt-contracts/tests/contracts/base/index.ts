/**
 * Contract Testing Framework
 * 
 * Type-safe contract validation without HTTP calls.
 * Tests contract definitions: method, path, headers, body, responses.
 */

import { describe, it, expect } from 'vitest';
import { type FixtureHandle } from 'adt-fixtures';

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

/**
 * Run a contract scenario as a standalone test suite.
 * Call this from each *.test.ts file.
 */
export function runScenario(scenario: ContractScenario): void {
  describe(scenario.name, () => {
    for (const op of scenario.operations) {
      describe(op.name, () => {
        const contract = op.contract();
        
        it('has correct method', () => {
          expect(contract.method).toBe(op.method);
        });
        
        it('has correct path', () => {
          if (typeof op.path === 'string') {
            expect(contract.path).toBe(op.path);
          } else {
            expect(contract.path).toMatch(op.path);
          }
        });
        
        if (op.headers) {
          it('has correct headers', () => {
            expect(contract.headers).toMatchObject(op.headers!);
          });
        }
        
        if (op.query) {
          it('has correct query params', () => {
            expect(contract.query).toEqual(op.query);
          });
        }
        
        if (op.body) {
          it('has body schema', () => {
            expect(contract.body).toBe(op.body!.schema);
          });
          
          if (op.body.fixture) {
            it('body schema parses fixture', async () => {
              const xml = await op.body!.fixture!.load();
              const schema = op.body!.schema as { parse: (xml: string) => unknown };
              const parsed = schema.parse(xml);
              expect(parsed).toBeDefined();
            });
            
            it('body schema round-trips', async () => {
              const xml = await op.body!.fixture!.load();
              const schema = op.body!.schema as { 
                parse: (xml: string) => unknown; 
                build?: (data: unknown) => string;
              };
              const parsed = schema.parse(xml);
              if (schema.build) {
                const rebuilt = schema.build(parsed);
                expect(rebuilt).toContain('<?xml');
              }
            });
          }
        }
        
        if (op.response) {
          it(`has response schema for ${op.response.status}`, () => {
            expect(contract.responses[op.response!.status]).toBe(op.response!.schema);
          });
          
          if (op.response.fixture) {
            it('response schema parses fixture', async () => {
              const xml = await op.response!.fixture!.load();
              const schema = op.response!.schema as { parse: (xml: string) => unknown };
              const parsed = schema.parse(xml);
              expect(parsed).toBeDefined();
            });
          }
        }
      });
    }
  });
}

/** Re-export FixtureHandle for convenience */
export type { FixtureHandle };
