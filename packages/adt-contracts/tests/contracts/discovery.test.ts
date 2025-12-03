/**
 * Discovery Contract Scenarios
 */

import { discovery } from '@abapify/adt-schemas-xsd';
import { ContractScenario, runScenario, type ContractOperation } from './base';
import { discoveryContract } from '../../src/adt/discovery';

class DiscoveryScenario extends ContractScenario {
  readonly name = 'Discovery';
  
  readonly operations: ContractOperation[] = [
    {
      name: 'get discovery document',
      contract: () => discoveryContract.getDiscovery(),
      method: 'GET',
      path: '/sap/bc/adt/discovery',
      headers: { Accept: 'application/atomsvc+xml' },
      response: {
        status: 200,
        schema: discovery,
        // No fixture yet - discovery responses are large
      },
    },
  ];
}

// Run scenario
runScenario(new DiscoveryScenario());
