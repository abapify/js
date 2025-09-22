import { ConnectionManager } from '../../client/connection-manager';
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
import { AdtSessionType } from './types';

export class ObjectService {
  private sessionType: AdtSessionType = AdtSessionType.STATEFUL;

  constructor(private connectionManager: ConnectionManager) {}

  /**
   * Configure session type for lock/unlock operations
   * Default STATEFUL works best with SAP Cloud systems and modern on-premise (7.51+)
   * Use STATELESS only for older on-premise systems if needed
   */
  setSessionType(sessionType: AdtSessionType): void {
    this.sessionType = sessionType;
  }

  /**
   * Build headers for lock/unlock operations with configurable session type
   */
  private buildLockHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept:
        'application/vnd.sap.as+xml;charset=UTF-8;dataname=com.sap.adt.lock.result;q=0.9, application/vnd.sap.as+xml;charset=UTF-8;q=0.8',
      'Content-Type': 'application/xml',
      // 'X-sap-adt-profiling': 'server-time', // Test: performance monitoring - might not be needed
      // 'sap-adt-saplb': 'fetch', // Test: load balancing - might not be needed
      // 'saplb-options': 'REDISPATCH_ON_SHUTDOWN', // Test: load balancing options - might not be needed
    };

    // Only add session-related headers if not using default (empty) session type
    if (this.sessionType && this.sessionType !== AdtSessionType.KEEP) {
      headers['X-sap-adt-sessiontype'] = this.sessionType;
      if (this.sessionType === AdtSessionType.STATEFUL) {
        headers['x-sap-security-session'] = 'use';
      }
    }

    return headers;
  }

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

  /**
   * Lock a repository object and return the lock handle
   */
  async lockObject(objectUri: string): Promise<string> {
    const response = await this.connectionManager.request(
      `${objectUri}?_action=LOCK&accessMode=MODIFY`,
      {
        method: 'POST',
        headers: this.buildLockHeaders(),
      }
    );

    // Extract lock handle from response
    if (response.body) {
      const lockResponseText = await response.text();
      const lockHandleMatch = lockResponseText.match(
        /<LOCK_HANDLE>([^<]+)<\/LOCK_HANDLE>/
      );
      if (lockHandleMatch && lockHandleMatch[1]) {
        const extractedLockHandle = lockHandleMatch[1];
        return extractedLockHandle;
      }
    }

    throw new Error('Failed to extract lock handle from response');
  }

  /**
   * Unlock a repository object using its lock handle (optional for generic unlock)
   */
  async unlockObject(objectUri: string, lockHandle?: string): Promise<void> {
    const url = lockHandle
      ? `${objectUri}?_action=UNLOCK&lockHandle=${lockHandle}`
      : `${objectUri}?_action=UNLOCK`;

    await this.connectionManager.request(url, {
      method: 'POST',
      headers: this.buildLockHeaders(),
    });
  }
}
