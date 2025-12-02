/**
 * Packages Contract Scenarios
 */

import { packagesV1 } from '@abapify/adt-schemas-xsd';
import { ContractScenario, type ContractOperation } from './base';
import { packagesContract } from '../../src/adt/packages';

export class PackagesScenario extends ContractScenario {
  readonly name = 'Packages';
  
  readonly operations: ContractOperation[] = [
    {
      name: 'get package by name',
      contract: () => packagesContract.get('$TEST'),
      method: 'GET',
      path: '/sap/bc/adt/packages/%24TEST',  // $ is URL-encoded
      headers: { Accept: 'application/vnd.sap.adt.packages.v1+xml' },
      response: {
        status: 200,
        schema: packagesV1,
        // No fixture yet
      },
    },
    {
      name: 'get package with special chars',
      contract: () => packagesContract.get('Z_MY_PACKAGE'),
      method: 'GET',
      path: '/sap/bc/adt/packages/Z_MY_PACKAGE',
      headers: { Accept: 'application/vnd.sap.adt.packages.v1+xml' },
      response: { status: 200, schema: packagesV1 },
    },
  ];
}
