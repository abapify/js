import { expect } from 'vitest';
import { fixtures } from 'adt-fixtures';
import { Scenario, runScenario, type SchemaType } from './base/scenario';
import { sessions } from '../../src/schemas/index';

/**
 * Test for HTTP Session response - GET /sap/bc/adt/core/http/sessions
 *
 * Fixture: Real SAP session response with CSRF tokens and atom links
 * Source: GET /sap/bc/adt/core/http/sessions
 */
class SessionsScenario extends Scenario<typeof sessions> {
  readonly schema = sessions;
  readonly fixtures = [fixtures.core.http.session];

  validateParsed(data: SchemaType<typeof sessions>): void {
    // Validate properties structure
    expect(data.properties).toBeDefined();
    expect(data.properties?.property).toBeDefined();
    expect(Array.isArray(data.properties?.property)).toBe(true);

    // Validate inactivity timeout property
    const timeoutProp = data.properties?.property?.find((p: any) => p.name === 'inactivityTimeout');
    expect(timeoutProp).toBeDefined();
    expect(timeoutProp?.name).toBe('inactivityTimeout');

    // Type assertions - verify full typing (using actual parsed structure)
    const propName: string | undefined = data.properties?.property?.[0]?.name;

    // Suppress unused variable warnings
    void propName;
  }
}

runScenario(new SessionsScenario());
