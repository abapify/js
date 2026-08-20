/**
 * AUnit (ABAP Unit) Contract Tests
 *
 * Tests manually-defined contracts from src/adt/aunit/
 *
 * Two types of tests:
 * 1. Contract Definition Tests - validate method, path, headers, body, responses
 * 2. Fixture parsing tests - validate schemas parse real SAP XML
 */

import { fixtures } from '@abapify/adt-fixtures';
import { expect, it } from 'vitest';
import { aunitRun, aunitResult } from '../../src/schemas';
import { ContractScenario, runScenario, type ContractOperation } from './base';

// Import contracts
import { aunitContract } from '../../src/adt/aunit';
import { extractCoverageMeasurementId } from '../../src/adt/aunit/coverage-link';

// =============================================================================
// Contract Definition Tests
// =============================================================================

class AunitTestrunsScenario extends ContractScenario {
  readonly name = 'AUnit Testruns';

  readonly operations: ContractOperation[] = [
    {
      name: 'run ABAP Unit tests',
      contract: () => aunitContract.testruns.post(),
      method: 'POST',
      path: '/sap/bc/adt/abapunit/testruns',
      headers: {
        Accept: 'application/vnd.sap.adt.abapunit.testruns.result.v2+xml',
        'Content-Type':
          'application/vnd.sap.adt.abapunit.testruns.config.v4+xml',
      },
      body: {
        schema: aunitRun,
        fixture: fixtures.aunit.runRequest,
      },
      response: {
        status: 200,
        schema: aunitResult,
        fixture: fixtures.aunit.runResult,
      },
    },
  ];
}

// =============================================================================
// Run contract definition scenarios
// =============================================================================

runScenario(new AunitTestrunsScenario());

it('preserves the Atom coverage measurement link from an AUnit result', async () => {
  const xml = await fixtures.aunit.runResultCoverageLink.load();
  const parsed = aunitResult.parse(xml);

  expect(extractCoverageMeasurementId(parsed)).toBe(
    '6D664D9B46CB1FE1859107ADE8729541',
  );
});
