/**
 * AdkTransportRequest & AdkTransportTask
 * 
 * Simplified 2-layer structure:
 * - AdkTransportRequest: full transport request with tasks, CRUD, etc.
 * - AdkTransportTask: extends request with task-specific overrides
 * 
 * Both share the same API response structure, just different data sources.
 * Kept in one file to avoid circular dependency issues.
 */

import type { AdkContext } from '../../../base/context';
import { AdkObject } from '../../../base/model';
import { TransportRequest as TransportRequestKind } from '../../../base/kinds';
import { requiresLock, parseSapTimestamp } from '../../../decorators';
import type { 
  TransportData, 
  TransportRequestData, 
  TransportTaskData,
  TransportCreateOptions, 
  TransportUpdateOptions, 
  ReleaseResult 
} from './transport.types';
import { AdkTransportObject } from './transport-object';

// =============================================================================
// Helpers
// =============================================================================

const STATUS_TEXT: Record<string, string> = { D: 'Modifiable', R: 'Released', N: 'Not released' };

function asArray<T>(val: T | T[] | undefined): T[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

function getService(ctx: AdkContext) {
  return ctx.services.transports;
}

interface TransportObjectData {
  name: string;
  type: string;
  response: TransportData;
}

// =============================================================================
// AdkTransportRequest
// =============================================================================

/**
 * Transport Request - main transport object
 * 
 * Handles both requests (K) and can be extended for tasks (T).
 */
export class AdkTransportRequest extends AdkObject<typeof TransportRequestKind, TransportObjectData> {
  readonly kind = TransportRequestKind;
  protected _tasks?: AdkTransportTask[];
  protected _objects?: AdkTransportObject[];

  constructor(ctx: AdkContext, dataOrNumber: TransportData | string) {
    if (typeof dataOrNumber === 'string') {
      super(ctx, dataOrNumber);
    } else {
      super(ctx, {
        name: dataOrNumber.name || dataOrNumber.request?.number || '',
        type: dataOrNumber.object_type === 'T' ? 'RQTQ' : 'RQRQ',
        response: dataOrNumber,
      });
    }
  }

  // ===========================================================================
  // Response Access
  // ===========================================================================

  protected get response(): TransportData {
    return this.dataSync.response;
  }

  /** The item's data - override in subclass for different source */
  protected get itemData(): TransportRequestData {
    return this.response.request || {} as TransportRequestData;
  }

  get objectUri(): string {
    return `/sap/bc/adt/cts/transportrequests/${this.name}`;
  }

  async load(): Promise<this> {
    const response = await getService(this.ctx).get(this.name);
    this.setData({
      name: this.name,
      type: response.object_type === 'T' ? 'RQTQ' : 'RQRQ',
      response,
    });
    return this;
  }

  // ===========================================================================
  // Properties (shared by request and task)
  // ===========================================================================

  get itemType(): 'request' | 'task' {
    return this.response.object_type === 'T' ? 'task' : 'request';
  }

  get number(): string { return this.name; }
  get owner(): string { return this.itemData.owner || ''; }
  get description(): string { return this.itemData.desc || ''; }
  get status(): string { return this.itemData.status || 'D'; }
  get statusText(): string { 
    return this.itemData.status_text || STATUS_TEXT[this.status] || this.status; 
  }
  get target(): string { return this.itemData.target || ''; }
  get targetDescription(): string { return this.itemData.target_desc || ''; }
  get uri(): string { return this.itemData.uri || this.objectUri; }
  get parent(): string { return this.itemData.parent || ''; }

  get lastChangedAt(): Date | undefined {
    return parseSapTimestamp(this.itemData.lastchanged_timestamp);
  }

  // ===========================================================================
  // Composition: Tasks (request only)
  // ===========================================================================

  /** Tasks belonging to this transport request */
  get tasks(): AdkTransportTask[] {
    if (!this._tasks) {
      const taskData = this.itemData.task;
      this._tasks = asArray(taskData).map(t => {
        // Build response for task
        const { request, task: _existingTasks, ...rootProps } = this.response;
        const { task: _nestedTasks, ...requestWithoutTasks } = request || {};
        
        const taskResponse: TransportData = {
          ...rootProps,
          object_type: 'T',
          name: t.number || '',
          request: request ? requestWithoutTasks as typeof request : undefined,
          task: [t],
        };
        return new AdkTransportTask(this.ctx, taskResponse, this);
      });
    }
    return this._tasks;
  }

  // ===========================================================================
  // Composition: Objects
  // ===========================================================================

  /** 
   * All objects in this request (aggregated from tasks)
   * Override in AdkTransportTask for direct objects
   */
  get objects(): AdkTransportObject[] {
    if (!this._objects) {
      // Direct objects in request
      const directObjects = asArray(this.itemData.abap_object).map(
        o => new AdkTransportObject(o)
      );
      // Objects from tasks
      const taskObjects = this.tasks.flatMap(t => t.objects);
      this._objects = [...directObjects, ...taskObjects];
    }
    return this._objects;
  }

  // ===========================================================================
  // Actions
  // ===========================================================================

  async release(): Promise<ReleaseResult> {
    try {
      await getService(this.ctx).release(this.number);
      (this.itemData as { status?: string; status_text?: string }).status = 'R';
      (this.itemData as { status?: string; status_text?: string }).status_text = 'Released';
      return { success: true };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  async releaseAll(): Promise<ReleaseResult> {
    for (const task of this.tasks) {
      if (task.status !== 'R') {
        const result = await task.release();
        if (!result.success) {
          return { success: false, message: `Failed to release task ${task.number}: ${result.message}` };
        }
      }
    }
    return this.release();
  }

  // ===========================================================================
  // CRUD Operations (request only)
  // ===========================================================================

  @requiresLock()
  async update(changes: TransportUpdateOptions): Promise<void> {
    await getService(this.ctx).update(this.number, {
      desc: changes.description ?? this.description,
      target: changes.target ?? this.target,
    });
    
    if (changes.description !== undefined) {
      (this.itemData as { desc?: string }).desc = changes.description;
    }
    if (changes.target !== undefined) {
      (this.itemData as { target?: string }).target = changes.target;
    }
  }

  async delete(): Promise<void> {
    await getService(this.ctx).delete(this.number);
  }

  // ===========================================================================
  // Static Factory
  // ===========================================================================

  static async create(ctx: AdkContext, options: TransportCreateOptions): Promise<AdkTransportRequest> {
    const response = await getService(ctx).create({
      description: options.description,
      type: options.type as 'K' | 'W' | undefined,
      target: options.target,
      project: options.project,
      owner: options.owner,
    });
    
    const number = (response as { request?: { number?: string } })?.request?.number;
    if (!number) throw new Error('Failed to create transport - no number returned');
    
    return AdkTransportRequest.get(ctx, number);
  }

  static async get(ctx: AdkContext, number: string): Promise<AdkTransportRequest> {
    const response = await getService(ctx).get(number);
    // Return task or request based on object_type
    if (response.object_type === 'T') {
      return new AdkTransportTask(ctx, response);
    }
    return new AdkTransportRequest(ctx, response);
  }
}

// =============================================================================
// AdkTransportTask
// =============================================================================

/**
 * Transport Task - child of a transport request
 * 
 * Minimal overrides:
 * - itemData: from response.task instead of response.request
 * - objects: direct from task, not aggregated
 * - request: parent reference
 * - No tasks, no CRUD
 */
export class AdkTransportTask extends AdkTransportRequest {
  private _parentRequest?: AdkTransportRequest;
  private readonly parentRef?: AdkTransportRequest;

  constructor(ctx: AdkContext, dataOrNumber: TransportData | string, parentRef?: AdkTransportRequest) {
    super(ctx, dataOrNumber);
    this.parentRef = parentRef;
  }

  // ===========================================================================
  // Override: itemData from task element
  // ===========================================================================

  protected override get itemData(): TransportRequestData {
    const rootTask = this.response.task;
    if (rootTask) {
      const taskArr = Array.isArray(rootTask) ? rootTask : [rootTask];
      const found = taskArr.find(t => t.number === this.name) || taskArr[0];
      if (found) return found as unknown as TransportRequestData;
    }
    return this.response.request || {} as TransportRequestData;
  }

  // ===========================================================================
  // Override: No tasks
  // ===========================================================================

  override get tasks(): AdkTransportTask[] {
    return []; // Tasks don't have sub-tasks
  }

  // ===========================================================================
  // Override: Direct objects (not aggregated)
  // ===========================================================================

  override get objects(): AdkTransportObject[] {
    if (!this._objects) {
      const taskData = this.itemData as unknown as TransportTaskData;
      this._objects = asArray(taskData?.abap_object).map(o => new AdkTransportObject(o));
    }
    return this._objects;
  }

  // ===========================================================================
  // Task-specific: Parent reference
  // ===========================================================================

  /** Parent transport request */
  get request(): AdkTransportRequest {
    if (this.parentRef) return this.parentRef;
    
    if (!this._parentRequest) {
      // Parent request number comes from response.request.number or task's parent attribute
      const parentNumber = this.response.request?.number || this.parent;
      this._parentRequest = new AdkTransportRequest(this.ctx, {
        ...this.response,
        name: parentNumber,
        object_type: 'K',
      });
    }
    return this._parentRequest;
  }

  // ===========================================================================
  // Static Factory
  // ===========================================================================

  static override async get(ctx: AdkContext, number: string): Promise<AdkTransportTask> {
    const response = await getService(ctx).get(number);
    return new AdkTransportTask(ctx, response);
  }
}
