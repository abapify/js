import { AdtClient } from '@abapify/adt-client';
import { AdkObjectBase, ObjectMetadata, objectRegistry } from './registry';

/**
 * Factory for creating intelligent ADK objects using registry pattern
 */
export class AdkObjectFactory {
  constructor(private adtClient: AdtClient) {}

  /**
   * Create an intelligent ADK object by fetching from SAP system
   */
  async create(
    objectType: string,
    objectName: string,
    packageName?: string
  ): Promise<AdkObjectBase> {
    // 1. Fetch object XML from ADT client
    const xml = await this.fetchObjectXml(objectType, objectName, packageName);

    // 2. Parse XML and extract metadata
    const metadata = await this.parseMetadata(
      xml,
      objectType,
      objectName,
      packageName
    );

    // 3. Create object using registry (no case statements)
    const obj = objectRegistry.create(objectType, metadata, xml);

    // 4. Set ADT client on the object if it supports it
    if ('setAdtClient' in obj && typeof obj.setAdtClient === 'function') {
      (obj as any).setAdtClient(this.adtClient);
    }

    return obj;
  }

  /**
   * Create multiple objects in batch
   */
  async createBatch(
    requests: Array<{
      objectType: string;
      objectName: string;
      packageName?: string;
    }>
  ): Promise<AdkObjectBase[]> {
    const promises = requests.map((req) =>
      this.create(req.objectType, req.objectName, req.packageName)
    );
    return Promise.all(promises);
  }

  /**
   * Get all supported object types
   */
  getSupportedTypes(): string[] {
    return objectRegistry.getSupportedTypes();
  }

  /**
   * Check if object type is supported
   */
  isSupported(objectType: string): boolean {
    return objectRegistry.isSupported(objectType);
  }

  /**
   * Fetch object XML from ADT client based on object type
   */
  private async fetchObjectXml(
    objectType: string,
    objectName: string,
    packageName?: string
  ): Promise<string> {
    try {
      // Use generic method - let ADT client handle object type specifics
      return await this.adtClient.getObjectDefinition(
        objectType,
        objectName,
        packageName
      );
    } catch (error) {
      throw new Error(
        `Failed to fetch ${objectType} '${objectName}': ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Parse metadata from XML and ADT client
   */
  private async parseMetadata(
    xml: string,
    objectType: string,
    objectName: string,
    packageName?: string
  ): Promise<ObjectMetadata> {
    // Basic metadata from XML parsing
    const basicMetadata = this.parseBasicMetadata(xml);

    // Enhanced metadata from ADT client if available
    let enhancedMetadata: Partial<ObjectMetadata> = {};
    try {
      enhancedMetadata = await this.fetchEnhancedMetadata(
        objectType,
        objectName,
        packageName
      );
    } catch {
      // Enhanced metadata is optional
    }

    return {
      name: objectName,
      description: basicMetadata.description || '',
      package: packageName || basicMetadata.package || '',
      ...enhancedMetadata,
    };
  }

  /**
   * Parse basic metadata from XML
   */
  private parseBasicMetadata(xml: string): Partial<ObjectMetadata> {
    const metadata: Partial<ObjectMetadata> = {};

    // Extract description
    const descMatch =
      xml.match(/<description[^>]*>([^<]*)<\/description>/i) ||
      xml.match(/description="([^"]*)"/) ||
      xml.match(/@description="([^"]*)"/);
    if (descMatch) {
      metadata.description = descMatch[1];
    }

    // Extract package
    const packageMatch =
      xml.match(/<package[^>]*>([^<]*)<\/package>/i) ||
      xml.match(/package="([^"]*)"/) ||
      xml.match(/@package="([^"]*)"/);
    if (packageMatch) {
      metadata.package = packageMatch[1];
    }

    // Extract author
    const authorMatch =
      xml.match(/<author[^>]*>([^<]*)<\/author>/i) ||
      xml.match(/author="([^"]*)"/) ||
      xml.match(/@author="([^"]*)"/);
    if (authorMatch) {
      metadata.author = authorMatch[1];
    }

    return metadata;
  }

  /**
   * Fetch enhanced metadata from ADT client
   */
  private async fetchEnhancedMetadata(
    objectType: string,
    objectName: string,
    packageName?: string
  ): Promise<Partial<ObjectMetadata>> {
    // This would use ADT client to fetch additional metadata like timestamps, transport info, etc.
    return {};
  }
}
