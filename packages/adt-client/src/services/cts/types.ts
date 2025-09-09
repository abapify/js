import type { AssignResult } from '../../types/client';

export interface Transport {
  number: string;
  description: string;
  status: 'modifiable' | 'released' | 'protected';
  owner: string;
  created: Date;
  target?: string;
  tasks?: Task[];
}

export interface Task {
  number: string;
  description: string;
  status: 'modifiable' | 'released' | 'protected';
  owner: string;
  created: Date;
  type: string;
}

export interface TransportFilters {
  user?: string;
  status?: string;
  maxResults?: number;
  skipCount?: number;
  debug?: boolean;
}

export interface TransportList {
  transports: Transport[];
  totalCount?: number;
}

export interface TransportGetOptions {
  includeObjects?: boolean;
  includeTasks?: boolean;
  debug?: boolean;
}

export interface TransportGetResult {
  transport: Transport;
  requestedNumber: string;
  isTask: boolean;
  requestedTask?: Task;
}

export interface TransportCreateOptions {
  description: string;
  type?: 'K' | 'W'; // K = Workbench, W = Customizing
  target?: string;
  project?: string;
  owner?: string;
  debug?: boolean;
}

export interface TransportCreateResult {
  transport: Transport;
  task: Task;
}

export interface TransportObject {
  name: string;
  type: string;
  description: string;
  packageName: string;
  uri: string;
  fullType: string; // e.g., "CLAS/OC"
}

export interface CtsOperations {
  createTransport(
    options: TransportCreateOptions
  ): Promise<TransportCreateResult>;
  listTransports(filters?: TransportFilters): Promise<TransportList>;
  getTransportObjects(transportId: string): Promise<TransportObject[]>;
  assignObject(objectKey: string, transportId: string): Promise<AssignResult>;
}
