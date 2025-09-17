import { Kind } from '../kind.js';

/**
 * Client-agnostic interface that any ADK object must implement
 * This allows ADT client to work with objects without knowing specific types
 */
export interface AdkObject {
  readonly kind: Kind;
  readonly name: string;
  readonly type: string;
  readonly description?: string;
  readonly package?: string;

  /**
   * Serialize to ADT XML format for API calls
   */
  toAdtXml(): string;
}

/**
 * Options for object operations
 */
export interface ObjectOperationOptions {
  transport?: string;
  package?: string;
  overwrite?: boolean;
  activate?: boolean;
}

/**
 * Result of an object operation
 */
export interface ObjectOperationResult {
  success: boolean;
  objectName: string;
  objectType: string;
  transport?: string;
  messages: string[];
}

/**
 * Generic CRUD interface that ADT clients should implement
 * Works with any ADK object that implements AdkObject interface
 */
export interface AdkClientInterface {
  /**
   * Create a new ABAP object in the remote system
   */
  createObject<T extends AdkObject>(
    obj: T,
    options?: ObjectOperationOptions
  ): Promise<ObjectOperationResult>;

  /**
   * Update an existing ABAP object in the remote system
   */
  updateObject<T extends AdkObject>(
    obj: T,
    options?: ObjectOperationOptions
  ): Promise<ObjectOperationResult>;

  /**
   * Delete an ABAP object from the remote system
   */
  deleteObject<T extends AdkObject>(
    obj: T,
    options?: ObjectOperationOptions
  ): Promise<ObjectOperationResult>;
}

// Endpoint mapping interfaces moved to ADT client package
// ADK should only handle object modeling, not HTTP/transport concerns
