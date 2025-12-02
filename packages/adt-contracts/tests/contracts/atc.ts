/**
 * ATC (ABAP Test Cockpit) Contract Scenarios
 */

import { fixtures } from 'adt-fixtures';
import { atcworklist } from '@abapify/adt-schemas-xsd';
import { ContractScenario, type ContractOperation } from './base';
import { atcContract } from '../../src/adt/atc';

export class AtcRunsScenario extends ContractScenario {
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

export class AtcResultsScenario extends ContractScenario {
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

export class AtcWorklistsScenario extends ContractScenario {
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
