/**
 * ATC (ABAP Test Cockpit) Contract Scenarios
 * 
 * Two types of tests:
 * 1. Contract Definition Tests - validate method, path, headers, body, responses
 * 2. Client Call Tests - test FULLY TYPED client calls
 *    - Input is typed (no casts)
 *    - Response is typed (no casts)
 *    - Access response.worklist.objectSets etc. with full type safety
 */

import { describe, it, expect } from 'vitest';
import { fixtures } from 'adt-fixtures';
import { atcworklist } from '../../src/schemas';
import { ContractScenario, runScenario, type ContractOperation, createClient } from './base';
import { atcContract } from '../../src/adt/atc';
import { createMockAdapter } from '../helpers/mock-adapter';

// Mock XML that matches AtcworklistSchema structure
const MOCK_WORKLIST_XML = `<?xml version="1.0" encoding="UTF-8"?>
<worklist xmlns="http://www.sap.com/adt/atc">
  <objectSets>
    <objectSet kind="inclusive" name="TestSet"/>
  </objectSets>
  <objects>
    <object uri="/sap/bc/adt/oo/classes/zcl_test" name="ZCL_TEST"/>
  </objects>
</worklist>`;

class AtcRunsScenario extends ContractScenario {
  readonly name = 'ATC Runs';
  
  readonly operations: ContractOperation[] = [
    {
      name: 'run ATC check',
      contract: () => atcContract.runs.post(),
      method: 'POST',
      path: '/sap/bc/adt/atc/runs',
      headers: { Accept: 'application/xml' },
      response: {
        status: 200,
        schema: atcworklist,
        fixture: fixtures.atc.worklist,
      },
    },
    {
      name: 'run ATC check with worklist ID',
      contract: () => atcContract.runs.post({ worklistId: 'WL123' }),
      method: 'POST',
      path: '/sap/bc/adt/atc/runs',
      query: { worklistId: 'WL123' },
      response: { status: 200, schema: atcworklist },
    },
    {
      name: 'run ATC check with client wait',
      contract: () => atcContract.runs.post({ clientWait: true }),
      method: 'POST',
      path: '/sap/bc/adt/atc/runs',
      query: { clientWait: true },
      response: { status: 200, schema: atcworklist },
    },
  ];
}

class AtcResultsScenario extends ContractScenario {
  readonly name = 'ATC Results';
  
  readonly operations: ContractOperation[] = [
    {
      name: 'list all results',
      contract: () => atcContract.results.get(),
      method: 'GET',
      path: '/sap/bc/adt/atc/results',
      headers: { Accept: 'application/xml' },
      response: {
        status: 200,
        schema: atcworklist,
        // fixture: fixtures.atc.result - different root element (checkresult vs worklist)
      },
    },
    {
      name: 'list results with filters',
      contract: () => atcContract.results.get({ 
        activeResult: true, 
        createdBy: 'DEVELOPER',
        ageMin: 0,
        ageMax: 30,
      }),
      method: 'GET',
      path: '/sap/bc/adt/atc/results',
      query: { activeResult: true, createdBy: 'DEVELOPER', ageMin: 0, ageMax: 30 },
      response: { status: 200, schema: atcworklist },
    },
    {
      name: 'get result by display ID',
      contract: () => atcContract.results.byDisplayId.get('RESULT001'),
      method: 'GET',
      path: '/sap/bc/adt/atc/results/RESULT001',
      headers: { Accept: 'application/xml' },
      response: { status: 200, schema: atcworklist },
    },
    {
      name: 'get result with exempted findings',
      contract: () => atcContract.results.byDisplayId.get('RESULT001', { 
        includeExemptedFindings: true 
      }),
      method: 'GET',
      path: '/sap/bc/adt/atc/results/RESULT001',
      query: { includeExemptedFindings: true },
      response: { status: 200, schema: atcworklist },
    },
  ];
}

class AtcWorklistsScenario extends ContractScenario {
  readonly name = 'ATC Worklists';
  
  readonly operations: ContractOperation[] = [
    {
      name: 'get worklist by ID',
      contract: () => atcContract.worklists.get('WL123'),
      method: 'GET',
      path: '/sap/bc/adt/atc/worklists/WL123',
      headers: { Accept: 'application/xml' },
      response: {
        status: 200,
        schema: atcworklist,
        fixture: fixtures.atc.worklist,
      },
    },
  ];
}

// =============================================================================
// Client Call Tests - FULLY TYPED input AND output
// =============================================================================

describe('ATC Client Calls - Typed Response Validation', () => {
  it('POST /runs returns typed worklist response', async () => {
    const { adapter } = createMockAdapter({ xml: MOCK_WORKLIST_XML });
    const client = createClient(atcContract.runs, {
      baseUrl: 'https://sap.example.com',
      adapter,
    });

    // Typed input - NO casts!
    const input = {
      run: {
        objectSets: {
          objectSet: [{ kind: 'inclusive' as const }],
        },
      },
    };

    // Response is FULLY TYPED - no casts needed!
    const response = await client.post({}, input);

    // TYPE CHECK: These property accesses would fail to compile if type inference breaks!
    // The compiler verifies these properties exist on the response type
    // Using underscore prefix to indicate these are for type checking
    const _typeCheck_worklist: typeof response.worklist = response.worklist;
    const _typeCheck_objectSets: typeof response.worklist.objectSets = response.worklist?.objectSets;
    const _typeCheck_objects: typeof response.worklist.objects = response.worklist?.objects;
    
    // Suppress unused variable warnings - these exist for compile-time type checking
    void _typeCheck_worklist;
    void _typeCheck_objectSets;
    void _typeCheck_objects;
    
    // Runtime assertion: response was parsed
    expect(response).toBeDefined();
  });

  it('GET /worklists/{id} returns typed worklist response', async () => {
    const { adapter } = createMockAdapter({ xml: MOCK_WORKLIST_XML });
    const client = createClient(atcContract.worklists, {
      baseUrl: 'https://sap.example.com',
      adapter,
    });

    // Response is FULLY TYPED
    const response = await client.get('WL123');

    // TYPE CHECK: These lines would fail to compile if type inference breaks!
    const _worklist = response.worklist;
    const _objectSets = response.worklist.objectSets;
    const _objectSetArray = response.worklist.objectSets.objectSet;
    
    // Runtime assertions
    expect(_worklist).toBeDefined();
    expect(_objectSets).toBeDefined();
    expect(_objectSetArray).toBeInstanceOf(Array);
  });

  it('GET /results returns typed worklist response', async () => {
    const { adapter } = createMockAdapter({ xml: MOCK_WORKLIST_XML });
    const client = createClient(atcContract.results, {
      baseUrl: 'https://sap.example.com',
      adapter,
    });

    // Typed query params - NO casts!
    const response = await client.get({
      activeResult: true,
      createdBy: 'DEVELOPER',
    });

    // TYPE CHECK: These property accesses would fail to compile if type inference breaks!
    const _typeCheck_worklist: typeof response.worklist = response.worklist;
    const _typeCheck_objectSets: typeof response.worklist.objectSets = response.worklist?.objectSets;
    
    // Suppress unused variable warnings
    void _typeCheck_worklist;
    void _typeCheck_objectSets;
    
    // Runtime assertion
    expect(response).toBeDefined();
  });
});

// =============================================================================
// Run contract definition scenarios
// =============================================================================

runScenario(new AtcRunsScenario());
runScenario(new AtcResultsScenario());
runScenario(new AtcWorklistsScenario());
