import { describe, expect, it, vi } from 'vitest';
import type { AdtClient } from '@abapify/adt-client';
import { AdkTransportRequest } from '../src/objects/cts/transport/transport';

interface TransportState {
  owner: string;
  status: string;
}

interface LifecycleFixtureOptions {
  releaseStatus?: string;
  releaseStatusText?: string;
  applyReassign?: boolean;
}

function requestResponse(
  number: string,
  state: TransportState,
  tasks: Array<{ number: string; owner: string; status: string }> = [],
) {
  return {
    root: {
      object_type: 'K',
      name: number,
      type: 'RQRQ',
      request: {
        number,
        owner: state.owner,
        status: state.status,
        status_text: state.status === 'R' ? 'Released' : 'Modifiable',
        task: tasks,
      },
    },
  };
}

function taskResponse(number: string, parent: string, state: TransportState) {
  return {
    root: {
      object_type: 'T',
      name: number,
      type: 'RQTQ',
      request: { number: parent },
      task: [
        {
          number,
          parent,
          owner: state.owner,
          status: state.status,
          status_text: state.status === 'R' ? 'Released' : 'Modifiable',
        },
      ],
    },
  };
}

function releaseResponse(status: string, statusText: string) {
  return {
    root: {
      releasereports: {
        checkReport: [{ status, statusText }],
      },
    },
  };
}

function createLifecycleFixture(options: LifecycleFixtureOptions = {}) {
  const rootNumber = 'DEVK900001';
  const taskDefinitions = [
    { number: 'DEVK900002', owner: 'OLDUSER', status: 'D' },
    { number: 'DEVK900003', owner: 'OLDUSER', status: 'R' },
    { number: 'DEVK900004', owner: 'OLDUSER', status: 'N' },
  ];
  const states = new Map<string, TransportState>([
    [rootNumber, { owner: 'OLDUSER', status: 'D' }],
    ...taskDefinitions.map(
      (task) =>
        [task.number, { owner: task.owner, status: task.status }] as const,
    ),
  ]);

  const get = vi.fn(async (number: string) => {
    const state = states.get(number);
    if (!state) throw new Error(`Unexpected transport ${number}`);
    return number === rootNumber
      ? requestResponse(rootNumber, state, taskDefinitions)
      : taskResponse(number, rootNumber, state);
  });
  const release = vi.fn(async (number: string) => {
    const status = options.releaseStatus ?? 'released';
    if (status === 'released') {
      const state = states.get(number);
      if (state) state.status = 'R';
    }
    return releaseResponse(
      status,
      options.releaseStatusText ??
        (status === 'released' ? 'Released' : 'Release failed'),
    );
  });
  const reassign = vi.fn(
    async (
      number: string,
      _options: { targetUser: string; recursive?: boolean },
      body: { root: { targetuser: string } },
    ) => {
      if (options.applyReassign !== false) {
        const state = states.get(number);
        if (state) state.owner = body.root.targetuser;
      }
      return requestResponse(
        rootNumber,
        states.get(rootNumber)!,
        taskDefinitions,
      );
    },
  );

  const client = {
    adt: {
      cts: {
        transportrequests: {
          get,
          useraction: { release, reassign },
        },
      },
    },
  } as unknown as AdtClient;

  return { client, get, release, reassign, states, rootNumber };
}

describe('AdkTransportRequest CTS lifecycle', () => {
  it('updates cached release state only after a released read-back', async () => {
    const fixture = createLifecycleFixture();
    const transport = await AdkTransportRequest.get(fixture.rootNumber, {
      client: fixture.client,
    });

    const result = await transport.release();

    expect(result).toEqual({ success: true });
    expect(fixture.release).toHaveBeenCalledWith(fixture.rootNumber);
    expect(fixture.get).toHaveBeenCalledTimes(2);
    expect(transport.status).toBe('R');
    expect(transport.statusText).toBe('Released');
  });

  it('surfaces a failed release report instead of reporting success', async () => {
    const fixture = createLifecycleFixture({
      releaseStatus: 'abortrelapifail',
      releaseStatusText: 'Task is unclassified and cannot be released',
    });
    const transport = await AdkTransportRequest.get(fixture.rootNumber, {
      client: fixture.client,
    });

    const result = await transport.release();

    expect(result).toEqual({
      success: false,
      message: 'Task is unclassified and cannot be released',
    });
    expect(fixture.get).toHaveBeenCalledTimes(1);
  });

  it('fails release when read-back does not show released status', async () => {
    const fixture = createLifecycleFixture();
    fixture.release.mockImplementationOnce(async () =>
      releaseResponse('released', 'Released'),
    );
    const transport = await AdkTransportRequest.get(fixture.rootNumber, {
      client: fixture.client,
    });

    const result = await transport.release();

    expect(result.success).toBe(false);
    expect(result.message).toContain('still has status D');
    expect(transport.status).toBe('D');
  });

  it('rejects a change-owner response when read-back still has the old owner', async () => {
    const fixture = createLifecycleFixture({ applyReassign: false });
    const transport = await AdkTransportRequest.get(fixture.rootNumber, {
      client: fixture.client,
    });

    await expect(transport.reassign('NEWUSER')).rejects.toThrow(
      'owner verification failed',
    );
    expect(transport.owner).toBe('OLDUSER');
    expect(fixture.get).toHaveBeenCalledTimes(2);
  });

  it('recursively reassigns only modifiable tasks and verifies each owner', async () => {
    const fixture = createLifecycleFixture();
    const transport = await AdkTransportRequest.get(fixture.rootNumber, {
      client: fixture.client,
    });

    await transport.reassign('NEWUSER', true);

    expect(fixture.reassign.mock.calls.map(([number]) => number)).toEqual([
      'DEVK900001',
      'DEVK900002',
    ]);
    expect(fixture.states.get('DEVK900001')?.owner).toBe('NEWUSER');
    expect(fixture.states.get('DEVK900002')?.owner).toBe('NEWUSER');
    expect(fixture.states.get('DEVK900003')?.owner).toBe('OLDUSER');
    expect(fixture.states.get('DEVK900004')?.owner).toBe('OLDUSER');
    expect(transport.owner).toBe('NEWUSER');
  });
});
