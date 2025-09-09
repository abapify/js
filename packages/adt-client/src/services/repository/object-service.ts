import { ConnectionManager } from '../../client/connection-manager.js';
import { AdtObject, ObjectMetadata } from '../../types/core.js';
import {
  UpdateResult,
  CreateResult,
  DeleteResult,
} from '../../types/client.js';
import { ObjectHandlerFactory } from '../../handlers/object-handler-factory.js';
import {
  ObjectOutlineElement,
  ObjectProperties,
} from '../../handlers/base-object-handler.js';
import { ErrorHandler } from '../../utils/error-handler.js';

export class ObjectService {
  constructor(private connectionManager: ConnectionManager) {}

  async getObject(objectType: string, objectName: string): Promise<AdtObject> {
    try {
      const handler = ObjectHandlerFactory.getHandler(
        objectType,
        this.connectionManager
      );
      return await handler.getObject(objectName);
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  async getObjectSource(
    objectType: string,
    objectName: string,
    include?: string
  ): Promise<string> {
    try {
      const handler = ObjectHandlerFactory.getHandler(
        objectType,
        this.connectionManager
      );
      return await handler.getObjectSource(objectName);
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  async getObjectMetadata(
    objectType: string,
    objectName: string
  ): Promise<ObjectMetadata> {
    try {
      const handler = ObjectHandlerFactory.getHandler(
        objectType,
        this.connectionManager
      );
      return await handler.getObjectMetadata(objectName);
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  async updateObject(
    objectType: string,
    objectName: string,
    content: string
  ): Promise<UpdateResult> {
    try {
      const handler = ObjectHandlerFactory.getHandler(
        objectType,
        this.connectionManager
      );
      return await handler.updateObject(objectName, content);
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  async createObject(
    objectType: string,
    objectName: string,
    content: string,
    metadata?: Partial<ObjectMetadata>
  ): Promise<CreateResult> {
    try {
      const handler = ObjectHandlerFactory.getHandler(
        objectType,
        this.connectionManager
      );
      return await handler.createObject(objectName, content, metadata);
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  async deleteObject(
    objectType: string,
    objectName: string
  ): Promise<DeleteResult> {
    try {
      const handler = ObjectHandlerFactory.getHandler(
        objectType,
        this.connectionManager
      );
      return await handler.deleteObject(objectName);
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  async objectExists(objectType: string, objectName: string): Promise<boolean> {
    try {
      const handler = ObjectHandlerFactory.getHandler(
        objectType,
        this.connectionManager
      );
      return await handler.objectExists(objectName);
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  async getObjectOutline(
    objectType: string,
    objectName: string
  ): Promise<ObjectOutlineElement[]> {
    try {
      const handler = ObjectHandlerFactory.getHandler(
        objectType,
        this.connectionManager
      );
      return await handler.getObjectOutline(objectName);
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  async getObjectProperties(
    objectType: string,
    objectName: string
  ): Promise<ObjectProperties> {
    try {
      const handler = ObjectHandlerFactory.getHandler(
        objectType,
        this.connectionManager
      );
      return await handler.getObjectProperties(objectName);
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  /**
   * Get supported object types that have registered handlers
   */
  getSupportedObjectTypes(): string[] {
    return ObjectHandlerFactory.getSupportedObjectTypes();
  }

  /**
   * Check if object type has a registered handler
   */
  hasHandlerForObjectType(objectType: string): boolean {
    return ObjectHandlerFactory.hasHandler(objectType);
  }
}
