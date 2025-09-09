import { ConnectionManager } from '../client/connection-manager.js';
import { AdtObject, ObjectMetadata } from '../types/objects.js';
import { UpdateResult, CreateResult, DeleteResult } from '../types/client.js';

export interface ObjectOutlineElement {
  name: string;
  type: string;
  visibility?: 'public' | 'protected' | 'private';
  description?: string;
  children?: ObjectOutlineElement[];
  position?: {
    line: number;
    column: number;
  };
}

export interface ObjectProperties {
  [key: string]: string | number | boolean | undefined;
  packageName?: string;
  description?: string;
  responsible?: string;
  createdBy?: string;
  createdOn?: string;
  changedBy?: string;
  changedOn?: string;
  version?: string;
  language?: string;
  masterLanguage?: string;
  abapLanguageVersion?: string;
}

export interface ObjectHandler {
  /**
   * Get object with all its content and metadata
   */
  getObject(objectName: string): Promise<AdtObject>;

  /**
   * Get only the main source content of the object
   */
  getObjectSource(objectName: string): Promise<string>;

  /**
   * Get object metadata without content
   */
  getObjectMetadata(objectName: string): Promise<ObjectMetadata>;

  /**
   * Get object outline/structure (methods, attributes, etc.)
   */
  getObjectOutline(objectName: string): Promise<ObjectOutlineElement[]>;

  /**
   * Get object properties (package, description, etc.)
   */
  getObjectProperties(objectName: string): Promise<ObjectProperties>;

  /**
   * Create a new object
   */
  createObject(
    objectName: string,
    content: string,
    metadata?: Partial<ObjectMetadata>
  ): Promise<CreateResult>;

  /**
   * Update existing object
   */
  updateObject(objectName: string, content: string): Promise<UpdateResult>;

  /**
   * Delete object
   */
  deleteObject(objectName: string): Promise<DeleteResult>;

  /**
   * Check if object exists
   */
  objectExists(objectName: string): Promise<boolean>;
}

export abstract class BaseObjectHandler implements ObjectHandler {
  constructor(
    protected connectionManager: ConnectionManager,
    protected objectType: string
  ) {}

  abstract getObject(objectName: string): Promise<AdtObject>;
  abstract getObjectSource(objectName: string): Promise<string>;
  abstract getObjectMetadata(objectName: string): Promise<ObjectMetadata>;
  abstract getObjectOutline(
    objectName: string
  ): Promise<ObjectOutlineElement[]>;
  abstract getObjectProperties(objectName: string): Promise<ObjectProperties>;
  abstract createObject(
    objectName: string,
    content: string,
    metadata?: Partial<ObjectMetadata>
  ): Promise<CreateResult>;
  abstract updateObject(
    objectName: string,
    content: string
  ): Promise<UpdateResult>;
  abstract deleteObject(objectName: string): Promise<DeleteResult>;

  async objectExists(objectName: string): Promise<boolean> {
    try {
      await this.getObjectMetadata(objectName);
      return true;
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'category' in error &&
        error.category === 'NOT_FOUND'
      ) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Build the base URL for this object type - must be implemented by each handler
   */
  protected abstract buildObjectUrl(
    objectName: string,
    fragment?: string
  ): string;
}
