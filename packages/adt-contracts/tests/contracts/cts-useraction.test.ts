/**
 * CTS transportrequests user-action contract scenarios
 *
 * Validates the release / reassign / create endpoints that ADT exposes.
 */

import { describe, expect, it } from 'vitest';
import { fixtures } from '@abapify/adt-fixtures';
import {
  transportUseraction,
  transportmanagment,
  transportmanagmentSingle,
} from '../../src/schemas';
import { ContractScenario, runScenario, type ContractOperation } from './base';
import {
  addTaskBodySchema,
  changeOwnerBodySchema,
  useraction,
} from '../../src/adt/cts/transportrequests/useraction';

const CONTENT_TYPE = 'application/vnd.sap.adt.transportorganizer.v1+xml';

class TransportUseractionScenario extends ContractScenario {
  readonly name = 'CTS Transport Requests – User Action';

  readonly operations: ContractOperation[] = [
    {
      name: 'release transport',
      contract: () => useraction.release('DEVK900001'),
      method: 'POST',
      path: '/sap/bc/adt/cts/transportrequests/DEVK900001/newreleasejobs',
      headers: {
        Accept: CONTENT_TYPE,
      },
      response: { status: 200, schema: transportmanagment },
    },
    {
      name: 'reassign transport (changeowner)',
      contract: () =>
        useraction.reassign('DEVK900001', { targetUser: 'NEWOWNER' }),
      method: 'PUT',
      path: '/sap/bc/adt/cts/transportrequests/DEVK900001',
      headers: {
        Accept: CONTENT_TYPE,
        'Content-Type': CONTENT_TYPE,
      },
      body: {
        schema: changeOwnerBodySchema,
      },
      response: { status: 200, schema: transportmanagmentSingle },
    },
    {
      name: 'create task under request',
      contract: () => useraction.addTask('DEVK900001', { owner: 'NEWOWNER' }),
      method: 'POST',
      path: '/sap/bc/adt/cts/transportrequests/DEVK900001/tasks',
      headers: {
        Accept: CONTENT_TYPE,
        'Content-Type': CONTENT_TYPE,
      },
      body: {
        schema: addTaskBodySchema,
      },
      response: {
        status: 200,
        schema: transportmanagment,
        fixture: fixtures.transport.taskCreateResponse,
      },
    },
    {
      name: 'create transport (newrequest)',
      contract: () =>
        useraction.create({
          description: 'Sample request',
          type: 'K',
          target: 'LOCAL',
          owner: 'TESTUSER',
        }),
      method: 'POST',
      path: '/sap/bc/adt/cts/transportrequests',
      headers: {
        Accept: CONTENT_TYPE,
        'Content-Type': CONTENT_TYPE,
      },
      body: {
        schema: transportUseraction,
        fixture: fixtures.transport.useractionNewrequest,
      },
      response: { status: 200, schema: transportmanagmentSingle },
    },
  ];
}

runScenario(new TransportUseractionScenario());

describe('CTS lifecycle request bodies', () => {
  it('builds an add-task body with the requested owner', () => {
    const contract = useraction.addTask('DEVK900001', {
      owner: 'NEWOWNER',
    });

    expect(contract.body).toBe(addTaskBodySchema);
    const xml = addTaskBodySchema.build?.({
      root: { targetuser: 'NEWOWNER' },
    });
    expect(xml).toContain('tm:targetuser="NEWOWNER"');
    expect(addTaskBodySchema.parse?.(xml ?? '')).toEqual({
      root: { targetuser: 'NEWOWNER' },
    });
  });

  it('sends release as a body-less new release job', () => {
    const contract = useraction.release('DEVK900001');

    expect(contract.body).toBeUndefined();
    expect(contract.headers).not.toHaveProperty('Content-Type');
  });

  it('builds a typed change-owner body with the transport number', () => {
    const contract = useraction.reassign('DEVK900001', {
      targetUser: 'NEWOWNER',
    });

    expect(contract.body).toBe(changeOwnerBodySchema);
    expect(
      changeOwnerBodySchema.build?.({
        root: {
          number: 'DEVK900001',
          targetuser: 'NEWOWNER',
          useraction: 'changeowner',
        },
      }),
    ).toContain('tm:number="DEVK900001"');

    const xml = changeOwnerBodySchema.build?.({
      root: {
        number: 'DEVK900001',
        targetuser: 'NEWOWNER',
        useraction: 'changeowner',
      },
    });
    expect(xml).toContain('tm:targetuser="NEWOWNER"');
    expect(xml).toContain('tm:useraction="changeowner"');
    expect(changeOwnerBodySchema.parse?.(xml ?? '')).toEqual({
      root: {
        number: 'DEVK900001',
        targetuser: 'NEWOWNER',
        useraction: 'changeowner',
      },
    });
  });
});
