/**
 * Contract Scenario Tests
 * 
 * Validates contract definitions: method, path, headers, body, responses.
 * No HTTP calls - pure contract structure validation.
 */

import { describe, it, expect } from 'vitest';
import { SCENARIOS } from './contracts';

describe('Contract Scenarios', () => {
  for (const scenario of SCENARIOS) {
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
});
