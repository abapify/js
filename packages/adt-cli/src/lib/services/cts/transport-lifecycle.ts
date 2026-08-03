import { AdkTransportRequest, type ReleaseResult } from '@abapify/adk';
import type { AdtClient } from '@abapify/adt-client';

export interface CtsTransportLifecycleOperations {
  getTransport(
    transport: string,
    client: AdtClient,
  ): Promise<AdkTransportRequest>;
}

const DEFAULT_OPERATIONS: CtsTransportLifecycleOperations = {
  getTransport: (transport, client) =>
    AdkTransportRequest.get(transport, { client }),
};

export interface CtsTransportSummary {
  transport: string;
  status: string;
  statusText: string;
  owner: string;
  description: string;
  target: string;
  targetDescription: string;
  taskCount: number;
  objectCount: number;
}

export interface ReleaseTransportInput {
  transport: string;
  releaseAll?: boolean;
}

export interface ReleaseTransportResult {
  status: 'released' | 'already_released';
  transport: string;
  releaseAll: boolean;
  result: ReleaseResult;
}

export interface ReassignTransportInput {
  transport: string;
  newOwner: string;
  recursive?: boolean;
}

export interface ReassignTransportResult {
  status: 'reassigned';
  transport: string;
  previousOwner: string;
  newOwner: string;
  recursive: boolean;
}

export interface CreateTaskInput {
  transport: string;
  owner: string;
}

export interface CreateTaskResult {
  status: 'created';
  transport: string;
  task: string;
  owner: string;
}

export class CtsTransportLifecycleService {
  constructor(
    private readonly client: AdtClient,
    private readonly operations: CtsTransportLifecycleOperations = DEFAULT_OPERATIONS,
  ) {}

  async getTransport(transport: string): Promise<CtsTransportSummary> {
    const model = await this.operations.getTransport(transport, this.client);
    return {
      transport: model.number,
      status: model.status,
      statusText: model.statusText,
      owner: model.owner,
      description: model.description,
      target: model.target,
      targetDescription: model.targetDescription,
      taskCount: model.tasks.length,
      objectCount: model.objects.length,
    };
  }

  async release(input: ReleaseTransportInput): Promise<ReleaseTransportResult> {
    const model = await this.operations.getTransport(
      input.transport,
      this.client,
    );
    const releaseAll = input.releaseAll ?? false;
    if (model.status === 'R') {
      return {
        status: 'already_released',
        transport: model.number,
        releaseAll,
        result: { success: true },
      };
    }

    const result = releaseAll
      ? await model.releaseAll()
      : await model.release();
    if (!result.success) {
      throw new Error(
        result.message || `Release of transport ${model.number} failed`,
      );
    }

    return {
      status: 'released',
      transport: model.number,
      releaseAll,
      result,
    };
  }

  async createTask(input: CreateTaskInput): Promise<CreateTaskResult> {
    const transport = input.transport.trim().toUpperCase();
    const owner = input.owner.trim().toUpperCase();
    if (!transport || !owner) {
      throw new Error('Transport and task owner are required');
    }
    const model = await this.operations.getTransport(transport, this.client);
    const task = await model.addTask(owner);
    return {
      status: 'created',
      transport: model.number,
      task: task.number,
      owner: task.owner,
    };
  }

  async reassign(
    input: ReassignTransportInput,
  ): Promise<ReassignTransportResult> {
    const model = await this.operations.getTransport(
      input.transport,
      this.client,
    );
    if (model.status === 'R') {
      throw new Error(`Transport ${model.number} is already released`);
    }

    const recursive = input.recursive ?? false;
    const previousOwner = model.owner;
    await model.reassign(input.newOwner, recursive);

    return {
      status: 'reassigned',
      transport: model.number,
      previousOwner,
      newOwner: input.newOwner,
      recursive,
    };
  }
}
