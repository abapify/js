import {
  objectRegistry,
  type AdkObject,
  type Class,
  type Interface,
} from '@abapify/adk';
import { ConnectionManager } from '../../client/connection-manager.js';
import { createLogger } from '../../utils/logger.js';

/**
 * ADK Facade for fetching objects from SAP system and creating typed ADK objects
 * Uses the ADK object registry to avoid hardcoded branching logic
 */
export class AdkFacade {
  private logger: any;

  constructor(private connectionManager: ConnectionManager, logger?: any) {
    this.logger = logger || createLogger('adk-facade');
  }

  /**
   * Get an object from SAP system and create a typed ADK object
   * Uses the object registry dynamically - no branching logic!
   */
  async getObject<T extends AdkObject>(
    objectType: string,
    objectName: string,
    packageName?: string
  ): Promise<T> {
    this.logger.debug(
      `🔍 Fetching ${objectType}: ${objectName} from SAP system`
    );

    // 1. Validate object type is supported by ADK registry
    if (!objectRegistry.isSupported(objectType)) {
      const supportedTypes = objectRegistry.getSupportedTypes();
      throw new Error(
        `Unsupported object type: ${objectType}. ` +
          `Supported types: ${supportedTypes.join(', ')}`
      );
    }

    try {
      // 2. Fetch XML from SAP system using appropriate endpoint
      const xml = await this.fetchObjectXml(
        objectType,
        objectName,
        packageName
      );

      // 3. Use ADK object registry to create typed object (no switch/case!)
      const adkObject = objectRegistry.createFromXml(objectType, xml) as T;

      this.logger.debug(
        `✅ Successfully created ${objectType} object: ${adkObject.name}`
      );
      return adkObject;
    } catch (error) {
      this.logger.error(
        `❌ Failed to fetch ${objectType} '${objectName}':`,
        error
      );
      throw new Error(
        `Failed to fetch ${objectType} '${objectName}': ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Convenience method for fetching Class objects
   */
  async getClass(name: string, packageName?: string): Promise<Class> {
    return this.getObject<Class>('CLAS', name, packageName);
  }

  /**
   * Convenience method for fetching Interface objects
   */
  async getInterface(name: string, packageName?: string): Promise<Interface> {
    return this.getObject<Interface>('INTF', name, packageName);
  }

  /**
   * Get multiple objects in batch
   */
  async getObjects(
    requests: Array<{
      objectType: string;
      objectName: string;
      packageName?: string;
    }>
  ): Promise<AdkObject[]> {
    this.logger.debug(`📦 Batch fetching ${requests.length} objects`);

    const promises = requests.map((req) =>
      this.getObject(req.objectType, req.objectName, req.packageName)
    );

    return Promise.all(promises);
  }

  /**
   * Get all supported object types from the ADK registry
   */
  getSupportedObjectTypes(): string[] {
    return objectRegistry.getSupportedTypes();
  }

  /**
   * Check if an object type is supported
   */
  isObjectTypeSupported(objectType: string): boolean {
    return objectRegistry.isSupported(objectType);
  }

  /**
   * Get registry information for debugging
   */
  getRegistryInfo(): Array<{ sapType: string; constructorName: string }> {
    return objectRegistry.getRegistrationInfo();
  }

  /**
   * Fetch object XML from SAP system based on object type
   * This method handles the SAP-specific API calls
   */
  private async fetchObjectXml(
    objectType: string,
    objectName: string,
    packageName?: string
  ): Promise<string> {
    const normalizedType = objectType.toUpperCase();

    try {
      switch (normalizedType) {
        case 'CLAS':
          return await this.fetchClassXml(objectName, packageName);
        case 'INTF':
          return await this.fetchInterfaceXml(objectName, packageName);
        default:
          // For now, use a generic approach for other object types
          // This can be expanded as more object types are added
          throw new Error(
            `XML fetching not yet implemented for object type: ${objectType}`
          );
      }
    } catch (error) {
      throw new Error(
        `Failed to fetch ${objectType} XML from SAP: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Fetch Class XML from SAP system
   */
  private async fetchClassXml(
    className: string,
    packageName?: string
  ): Promise<string> {
    const endpoint = packageName
      ? `/sap/bc/adt/oo/classes/${className}?package=${packageName}`
      : `/sap/bc/adt/oo/classes/${className}`;

    const response = await this.connectionManager.request(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.sap.adt.oo.classes.v2+xml',
      },
    });

    return await response.text();
  }

  /**
   * Fetch Interface XML from SAP system
   */
  private async fetchInterfaceXml(
    interfaceName: string,
    packageName?: string
  ): Promise<string> {
    const endpoint = packageName
      ? `/sap/bc/adt/oo/interfaces/${interfaceName}?package=${packageName}`
      : `/sap/bc/adt/oo/interfaces/${interfaceName}`;

    const response = await this.connectionManager.request(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.sap.adt.oo.interfaces.v2+xml',
      },
    });

    return await response.text();
  }
}
