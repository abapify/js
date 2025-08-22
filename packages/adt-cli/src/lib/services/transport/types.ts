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
