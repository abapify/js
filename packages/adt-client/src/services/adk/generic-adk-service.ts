import { ConnectionManager } from '../../client/connection-manager.js';
import { createLogger } from '../../utils/logger.js';
import {
  AdkObject,
  AdkClientInterface,
  ObjectOperationOptions,
  ObjectOperationResult,
} from '@abapify/adk';
import {
  AdtEndpointRegistry,
  DefaultEndpointRegistry,
} from './endpoint-registry.js';

/**
 * Generic ADK service that works with any ADK object type
 * Implements the client-agnostic CRUD interface
 */
export class GenericAdkService implements AdkClientInterface {
  private logger: any;
  private registry: AdtEndpointRegistry;

  constructor(
    private connectionManager: ConnectionManager,
    logger?: any,
    registry?: AdtEndpointRegistry
  ) {
    this.logger = logger || createLogger('adk');
    this.registry = registry || new DefaultEndpointRegistry();
  }

  async createObject<T extends AdkObject>(
    obj: T,
    options: ObjectOperationOptions = {}
  ): Promise<ObjectOperationResult> {
    this.logger.debug(`🚀 Creating ${obj.kind}: ${obj.name}`);

    try {
      const mapping = this.registry.getMapping(obj.kind);
      if (!mapping) {
        throw new Error(`Unsupported object kind: ${obj.kind}`);
      }

      // Get the XML payload from the ADK object
      const xmlPayload = obj.toAdtXml();
      this.logger.debug(`📦 XML payload:`, xmlPayload);

      let objectExists = false;
      try {
        const response = await this.connectionManager.request(
          mapping.baseEndpoint,
          {
            method: 'POST',
            headers: {
              'Content-Type': mapping.contentType,
              Accept: mapping.acceptType,
            },
            body: xmlPayload,
          }
        );

        this.logger.debug(
          `📡 Creation response: ${response.status} ${response.statusText}`
        );
        const responseText = await response.text();
        this.logger.debug(`📋 Response body:`, responseText);
      } catch (error: any) {
        // Check if object already exists
        if (
          error.context?.response?.includes('ExceptionResourceAlreadyExists')
        ) {
          this.logger.info(
            `📋 Object ${obj.name} already exists, will update source`
          );
          objectExists = true;
        } else {
          this.logger.error(`❌ Object creation failed: ${error.message}`);
          this.logger.error(`📦 Failed payload:`, xmlPayload);
          throw error;
        }
      }

      // Update source if the object supports it and has source content
      if (mapping.getSourceEndpoint && obj.getSourceMain) {
        const sourceCode = obj.getSourceMain();
        if (sourceCode) {
          try {
            await this.updateObjectSource(obj, mapping, sourceCode, options);
          } catch (error: any) {
            if (error.statusCode === 423) {
              this.logger.warn(
                `⚠️  Object ${obj.name} is locked, skipping source update`
              );
            } else {
              throw error;
            }
          }
        }
      }

      // Activate object if requested
      if (options.activate !== false && mapping.getActivationUri) {
        await this.activateObject(obj, mapping, options);
      }

      return {
        success: true,
        objectName: obj.name,
        objectType: obj.kind,
        transport: options.transport,
        messages: [
          objectExists
            ? `${obj.kind} ${obj.name} already exists, updated successfully`
            : `${obj.kind} ${obj.name} created successfully`,
        ],
      };
    } catch (error) {
      this.logger.error(`❌ Failed to create ${obj.name}:`);
      this.logger.error(`Full error details:`, error);

      return {
        success: false,
        objectName: obj.name,
        objectType: obj.kind,
        messages: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  async updateObject<T extends AdkObject>(
    obj: T,
    options: ObjectOperationOptions = {}
  ): Promise<ObjectOperationResult> {
    this.logger.debug(`🔄 Updating ${obj.kind}: ${obj.name}`);

    try {
      const mapping = this.registry.getMapping(obj.kind);
      if (!mapping) {
        throw new Error(`Unsupported object kind: ${obj.kind}`);
      }

      // For updates, we primarily update source code if supported
      if (mapping.getSourceEndpoint && obj.getSourceMain) {
        const sourceCode = obj.getSourceMain();
        if (sourceCode) {
          await this.updateObjectSource(obj, mapping, sourceCode, options);
        }
      }

      // Activate if requested
      if (options.activate !== false && mapping.getActivationUri) {
        await this.activateObject(obj, mapping, options);
      }

      return {
        success: true,
        objectName: obj.name,
        objectType: obj.kind,
        transport: options.transport,
        messages: [`${obj.kind} ${obj.name} updated successfully`],
      };
    } catch (error) {
      this.logger.error(`❌ Failed to update ${obj.name}:`);
      this.logger.error(`Full error details:`, error);

      return {
        success: false,
        objectName: obj.name,
        objectType: obj.kind,
        messages: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  async deleteObject<T extends AdkObject>(
    obj: T,
    options: ObjectOperationOptions = {}
  ): Promise<ObjectOperationResult> {
    this.logger.debug(`🗑️  Deleting ${obj.kind}: ${obj.name}`);

    try {
      const mapping = this.registry.getMapping(obj.kind);
      if (!mapping) {
        throw new Error(`Unsupported object kind: ${obj.kind}`);
      }

      // Delete the object via DELETE request to base endpoint with object name
      const endpoint = `${mapping.baseEndpoint}/${obj.name.toLowerCase()}`;

      const response = await this.connectionManager.request(endpoint, {
        method: 'DELETE',
        headers: {
          Accept: mapping.acceptType,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Delete failed: ${response.status} ${response.statusText}`
        );
      }

      return {
        success: true,
        objectName: obj.name,
        objectType: obj.kind,
        transport: options.transport,
        messages: [`${obj.kind} ${obj.name} deleted successfully`],
      };
    } catch (error) {
      this.logger.error(`❌ Failed to delete ${obj.name}:`);
      this.logger.error(`Full error details:`, error);

      return {
        success: false,
        objectName: obj.name,
        objectType: obj.kind,
        messages: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  private async updateObjectSource<T extends AdkObject>(
    obj: T,
    mapping: any,
    sourceCode: string,
    options: ObjectOperationOptions
  ): Promise<void> {
    this.logger.debug(`📝 Updating source code for ${obj.kind}: ${obj.name}`);

    if (!mapping.getSourceEndpoint) {
      throw new Error(`Source updates not supported for ${obj.kind}`);
    }

    // First, attempt to lock the object
    const lockHandle = await this.lockObject(obj, mapping);

    if (!lockHandle) {
      this.logger.warn(
        `⚠️ Cannot update source for ${obj.kind}: ${obj.name} - object is locked by another user`
      );
      return;
    }

    const endpoint = mapping.getSourceEndpoint(obj.name);

    try {
      // Build endpoint with lock handle if available
      let finalEndpoint = endpoint;
      if (lockHandle && lockHandle !== 'locked') {
        finalEndpoint = `${endpoint}?lockHandle=${encodeURIComponent(
          lockHandle
        )}`;
      }

      const response = await this.connectionManager.request(finalEndpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          Accept: 'text/plain',
        },
        body: sourceCode,
      });

      if (!response.ok) {
        throw new Error(
          `Source update failed: ${response.status} ${response.statusText}`
        );
      }

      this.logger.debug(
        `✅ Successfully updated source code for ${obj.kind}: ${obj.name}`
      );
    } finally {
      // Always attempt to unlock the object
      await this.unlockObject(obj, mapping, lockHandle);
    }
  }

  private async lockObject<T extends AdkObject>(
    obj: T,
    mapping: any
  ): Promise<string | null> {
    this.logger.debug(`🔒 Attempting to lock ${obj.kind}: ${obj.name}`);

    if (!mapping.getSourceEndpoint) {
      return null;
    }

    const baseEndpoint = mapping.getSourceEndpoint(obj.name);
    const endpoint = `${baseEndpoint}?_action=LOCK&accessMode=MODIFY`;

    try {
      const response = await this.connectionManager.request(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          Accept: 'text/plain',
        },
        body: '',
      });

      if (response.ok) {
        // Extract lock handle from response headers
        const lockHandle =
          response.headers.get('sap-adt-lock-handle') ||
          response.headers.get('lock-handle') ||
          response.headers.get('lockhandle');

        if (lockHandle) {
          this.logger.debug(
            `🔑 Successfully locked ${obj.kind}: ${obj.name} with handle: ${lockHandle}`
          );
          return lockHandle;
        } else {
          this.logger.warn(
            `⚠️ Lock successful but no lock handle received for ${obj.kind}: ${obj.name}`
          );
          return 'locked'; // Indicate locked but no handle
        }
      } else if (response.status === 403) {
        this.logger.warn(
          `🚫 Object ${obj.kind}: ${obj.name} is locked by another user`
        );
        return null;
      } else {
        this.logger.warn(
          `⚠️ Failed to lock ${obj.kind}: ${obj.name} - ${response.status} ${response.statusText}`
        );
        return null;
      }
    } catch (error) {
      this.logger.warn(
        `⚠️ Error attempting to lock ${obj.kind}: ${obj.name} - ${error}`
      );
      return null;
    }
  }

  private async unlockObject<T extends AdkObject>(
    obj: T,
    mapping: any,
    lockHandle?: string
  ): Promise<void> {
    if (!lockHandle || lockHandle === 'locked' || !mapping.getSourceEndpoint) {
      this.logger.debug(
        `🔓 Skipping unlock for ${obj.kind}: ${obj.name} (no valid lock handle or source endpoint)`
      );
      return;
    }

    this.logger.debug(
      `🔓 Unlocking ${obj.kind}: ${obj.name} with handle: ${lockHandle}`
    );

    const baseEndpoint = mapping.getSourceEndpoint(obj.name);
    const endpoint = `${baseEndpoint}?_action=UNLOCK&lockHandle=${encodeURIComponent(
      lockHandle
    )}`;

    try {
      const response = await this.connectionManager.request(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          Accept: 'text/plain',
        },
        body: '',
      });

      if (response.ok) {
        this.logger.debug(`✅ Successfully unlocked ${obj.kind}: ${obj.name}`);
      } else {
        this.logger.warn(
          `⚠️ Failed to unlock ${obj.kind}: ${obj.name} - ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      this.logger.warn(
        `⚠️ Error attempting to unlock ${obj.kind}: ${obj.name} - ${error}`
      );
    }
  }

  private async activateObject<T extends AdkObject>(
    obj: T,
    mapping: any,
    options: ObjectOperationOptions
  ): Promise<void> {
    this.logger.debug(`⚡ Activating ${obj.kind}: ${obj.name}`);

    if (!mapping.getActivationUri) {
      throw new Error(`Activation not supported for ${obj.kind}`);
    }

    // Build the correct URI path for the object type
    const objectUri = mapping.getActivationUri(obj.name);

    const activationPayload = `<?xml version="1.0" encoding="UTF-8"?><adtcore:objectReferences xmlns:adtcore="http://www.sap.com/adt/core">
  <adtcore:objectReference adtcore:uri="${objectUri}" adtcore:name="${obj.name}"/>
</adtcore:objectReferences>`;

    this.logger.debug(`📦 Activation payload: ${activationPayload}`);

    const response = await this.connectionManager.request(
      '/sap/bc/adt/activation?method=activate&preauditRequested=true',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.sap.adt.activation+xml',
          Accept: 'application/vnd.sap.adt.activation+xml',
        },
        body: activationPayload,
      }
    );

    if (!response.ok) {
      const responseText = await response.text();
      this.logger.error(
        `❌ Activation failed with ${response.status}: ${responseText}`
      );
      throw new Error(
        `Activation failed: ${response.status} ${response.statusText} - ${responseText}`
      );
    }

    this.logger.debug(`✅ Successfully activated ${obj.kind}: ${obj.name}`);
  }

  /**
   * Get the endpoint registry (useful for extending with new object types)
   */
  getRegistry(): AdtEndpointRegistry {
    return this.registry;
  }

  /**
   * Check if an object kind is supported
   */
  supports(kind: string): boolean {
    return this.registry.getMapping(kind as any) !== undefined;
  }

  /**
   * Get all supported object kinds
   */
  getSupportedKinds(): string[] {
    return this.registry.getSupportedKinds().map((k) => k.toString());
  }
}
