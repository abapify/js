import {
  BaseObjectHandler,
  ObjectOutlineElement,
  ObjectProperties,
} from './base-object-handler.js';
import { AdtObject, ObjectMetadata } from '../types/objects.js';
import { UpdateResult, CreateResult, DeleteResult } from '../types/client.js';
import { XmlParser } from '../utils/xml-parser.js';
import { ErrorHandler } from '../utils/error-handler.js';

export class PackageHandler extends BaseObjectHandler {
  constructor(connectionManager: any) {
    super(connectionManager, 'DEVC');
  }

  async getObject(objectName: string): Promise<AdtObject> {
    try {
      const metadata = await this.getObjectMetadata(objectName);
      const content: Record<string, string> = {};

      // Packages don't have source code in the traditional sense
      // But we can get the package structure/metadata
      content.main = await this.getPackageMetadataXml(objectName);

      return {
        objectType: this.objectType,
        objectName,
        metadata,
        content,
      };
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  async getObjectSource(objectName: string): Promise<string> {
    // Packages don't have "source" in the traditional sense
    // Return the package metadata XML instead
    return this.getPackageMetadataXml(objectName);
  }

  async getObjectMetadata(objectName: string): Promise<ObjectMetadata> {
    try {
      const url = this.buildPackageUrl(objectName);
      const response = await this.connectionManager.request(url, {
        headers: {
          Accept: 'application/vnd.sap.adt.packages.v1+xml'
        },
      });

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, {
          objectType: this.objectType,
          objectName,
        });
      }

      const xmlContent = await response.text();
      return XmlParser.parseObjectMetadata(xmlContent);
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  async createObject(
    objectName: string,
    content: string,
    metadata?: Partial<ObjectMetadata>
  ): Promise<CreateResult> {
    try {
      const url = this.buildPackageUrl(objectName);

      // Build package creation XML
      const packageXml = this.buildPackageCreationXml(objectName, metadata);

      const response = await this.connectionManager.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.sap.adt.packages.v1+xml',
          Accept: 'application/vnd.sap.adt.packages.v1+xml',
        },
        body: packageXml,
      });

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, {
          objectType: this.objectType,
          objectName,
        });
      }

      return {
        success: true,
        objectName,
        message: `Package ${objectName} created successfully`,
      };
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  async updateObject(
    objectName: string,
    content: string
  ): Promise<UpdateResult> {
    try {
      const url = this.buildPackageUrl(objectName);
      const response = await this.connectionManager.request(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/vnd.sap.adt.packages.v1+xml',
          Accept: 'application/vnd.sap.adt.packages.v1+xml',
        },
        body: content,
      });

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, {
          objectType: this.objectType,
          objectName,
        });
      }

      return {
        success: true,
        objectName,
        message: `Package ${objectName} updated successfully`,
      };
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  async deleteObject(objectName: string): Promise<DeleteResult> {
    try {
      const url = this.buildPackageUrl(objectName);
      const response = await this.connectionManager.request(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, {
          objectType: this.objectType,
          objectName,
        });
      }

      return {
        success: true,
        objectName,
        message: `Package ${objectName} deleted successfully`,
      };
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  async getObjectOutline(objectName: string): Promise<ObjectOutlineElement[]> {
    // Packages don't have a traditional outline structure like classes
    // We could potentially return the package contents as outline
    return [];
  }

  async getObjectProperties(objectName: string): Promise<ObjectProperties> {
    try {
      const metadata = await this.getObjectMetadata(objectName);

      // Get additional package-specific properties from the XML
      const url = this.buildPackageUrl(objectName);
      const response = await this.connectionManager.request(url, {
        headers: { Accept: 'application/vnd.sap.adt.packages.v1+xml' },
      });

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, {
          objectType: this.objectType,
          objectName,
        });
      }

      const xmlContent = await response.text();
      const packageProperties = this.parsePackageProperties(xmlContent);

      return {
        ...metadata,
        ...packageProperties,
      };
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  // Package-specific methods

  private async getPackageMetadataXml(objectName: string): Promise<string> {
    try {
      const url = this.buildPackageUrl(objectName);
      const response = await this.connectionManager.request(url, {
        headers: { Accept: 'application/vnd.sap.adt.packages.v1+xml' },
      });

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, {
          objectType: this.objectType,
          objectName,
        });
      }

      return await response.text();
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  protected buildPackageUrl(objectName: string): string {
    return `/sap/bc/adt/packages/${encodeURIComponent(objectName)}`;
  }

  protected buildObjectUrl(objectName: string, fragment?: string): string {
    const baseUrl = this.buildPackageUrl(objectName);
    return fragment ? `${baseUrl}/${fragment}` : baseUrl;
  }

  private parsePackageProperties(xmlContent: string): ObjectProperties {
    const properties: ObjectProperties = {};

    try {
      const parsed = XmlParser.parse(xmlContent);
      const packageElement = parsed['pak:package'] || parsed['package'];

      if (packageElement) {
        const core = packageElement['adtcore:packageRef'] || packageElement['packageRef'];
        if (core) {
          properties.packageType = core['@_type'];
        }
      }
    } catch (error) {
      // Return basic properties if parsing fails
    }

    return properties;
  }

  private buildPackageCreationXml(
    objectName: string,
    metadata?: Partial<ObjectMetadata>
  ): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<pak:package xmlns:pak="http://www.sap.com/adt/packages"
             xmlns:adtcore="http://www.sap.com/adt/core"
             adtcore:type="DEVC/K"
             adtcore:name="${objectName}"
             adtcore:description="${metadata?.description || ''}"
             adtcore:language="${metadata?.language || 'EN'}"
             adtcore:masterLanguage="${metadata?.masterLanguage || 'EN'}"
             adtcore:responsible="${metadata?.responsible || ''}">
  <adtcore:packageRef adtcore:name="${metadata?.packageName || '$TMP'}"/>
</pak:package>`;
  }
}
