import type { AdtObject, ObjectMetadata } from '../../types/core';
import type {
  SearchOptions,
  SearchResultDetailed,
  ADTObjectInfo,
} from './search-service';

export enum AdtSessionType {
  STATEFUL = 'stateful',
  STATELESS = 'stateless',
  KEEP = '',
}

// Repository-specific types
export interface ObjectOutline {
  [key: string]: any;
}

export interface CreateResult {
  success: boolean;
  objectKey?: string;
  messages?: string[];
}

export interface UpdateResult {
  success: boolean;
  messages?: string[];
}

export interface SetSourceOptions {
  lockTimeout?: number;
  forceUnlock?: boolean;
  compareSource?: boolean; // Skip if source is identical
  createIfNotExists?: boolean;
}

export interface SetSourceResult {
  action: 'created' | 'updated' | 'skipped' | 'failed';
  messages?: string[];
  lockHandle?: string;
  sourceChanged?: boolean;
  error?: string;
}

export interface SearchResult {
  objects: ADTObjectInfo[];
  totalCount: number;
}

export interface PackageContent {
  objects: ADTObjectInfo[];
  subpackages: string[];
}

export interface ObjectTypeInfo {
  type: string;
  description: string;
  supported: boolean;
}

export interface ObjectInfo {
  objectType: string;
  objectName: string;
  description: string;
  responsible: string;
  changedBy: string;
  changedOn: string;
}

export interface RepositoryOperations {
  // Object operations (generic for all object types)
  getObject(objectType: string, objectName: string): Promise<AdtObject>;
  getObjectSource(
    objectType: string,
    objectName: string,
    include?: string
  ): Promise<string>;
  getObjectMetadata(
    objectType: string,
    objectName: string
  ): Promise<ObjectMetadata>;
  getObjectOutline(
    objectType: string,
    objectName: string
  ): Promise<ObjectOutline>;
  createObject(
    objectType: string,
    objectName: string,
    content: string
  ): Promise<CreateResult>;
  updateObject(
    objectType: string,
    objectName: string,
    content: string
  ): Promise<UpdateResult>;

  // Search operations
  searchObjects(query: string, options?: SearchOptions): Promise<SearchResult>;
  searchObjectsDetailed(options: SearchOptions): Promise<SearchResultDetailed>;
  getPackageContents(packageName: string): Promise<PackageContent>;
  getSupportedObjectTypes(): Promise<ObjectTypeInfo[]>;

  // Object locking operations
  lockObject(objectUri: string): Promise<string>; // Returns lock handle
  unlockObject(objectUri: string, lockHandle?: string): Promise<void>;

  // Source management operations
  setSource(
    objectUri: string,
    sourcePath: string,
    sourceContent: string,
    options?: SetSourceOptions
  ): Promise<SetSourceResult>;

  // Session configuration
  setSessionType(sessionType: AdtSessionType): void;
}
