/**
 * Scenario-based Schema Tests
 * 
 * Uses adt-fixtures for centralized test fixtures.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { SCENARIOS } from './scenarios';

describe('Schema Scenarios', () => {
  for (const scenario of SCENARIOS) {
    describe(scenario.constructor.name, () => {
      for (const fixture of scenario.fixtures) {
        describe(fixture.path.replace('.xml', ''), () => {
          // State shared between tests - type safety is enforced in each scenario's validateParsed
          const state: { xml: string; parsed: any; built: string } = { xml: '', parsed: null, built: '' };
          
          beforeAll(async () => {
            // Load fixture using FixtureHandle.load()
            state.xml = await fixture.load();
            state.parsed = scenario.schema.parse(state.xml);
            state.built = scenario.schema.build!(state.parsed);
          });
          
          it('parses', () => {
            expect(state.parsed).toBeDefined();
          });
          
          it('validates parsed', () => {
            scenario.validateParsed(state.parsed);
          });
          
          it('builds', () => {
            expect(state.built).toContain('<?xml');
          });
          
          it('validates built', () => {
            scenario.validateBuilt?.(state.built);
          });
          
          it('round-trips', () => {
            const parsed2 = scenario.schema.parse(state.built);
            const built2 = scenario.schema.build!(parsed2 as any);
            expect(state.built).toBe(built2);
          });
        });
      }
    });
  }
});
