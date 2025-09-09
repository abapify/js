import { ConnectionManager } from '../../client/connection-manager.js';
import { XmlParser } from '../../utils/xml-parser.js';
import { ErrorHandler } from '../../utils/error-handler.js';
import { PackageContent, ObjectTypeInfo } from './types.js';
import { SearchQuery } from '../../types/client.js';

export class RepositoryService {
  constructor(private connectionManager: ConnectionManager) {}

  async getSupportedObjectTypes(): Promise<ObjectTypeInfo[]> {
    try {
      const url = '/sap/bc/adt/repository/typestructure';
      const response = await this.connectionManager.request(url);

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response);
      }

      const xmlContent = await response.text();
      const parsed = XmlParser.parse(xmlContent);

      // Parse supported object types from repository typestructure XML
      const objectTypes = this.parseObjectTypes(parsed);

      return objectTypes;
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  async searchObjects(query: SearchQuery): Promise<SearchResult[]> {
    try {
      const url = this.buildSearchUrl(
        query.pattern,
        query.objectTypes,
        query.packages,
        query.maxResults
      );
      const response = await this.connectionManager.request(url);

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, { query });
      }

      const xmlContent = await response.text();
      const results = XmlParser.parseSearchResults(xmlContent);

      return results.map((result: any) => ({
        objectType: XmlParser.extractAttribute(result, 'adtcore:type') || '',
        objectName: XmlParser.extractAttribute(result, 'adtcore:name') || '',
        packageName:
          XmlParser.extractAttribute(result, 'adtcore:packageName') || '',
        description:
          XmlParser.extractAttribute(result, 'adtcore:description') || '',
        uri: XmlParser.extractAttribute(result, 'adtcore:uri') || '',
        score: 1.0, // ADT doesn't provide relevance scores
      }));
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error, { query });
    }
  }

  async getPackageContents(packageName: string): Promise<PackageContent> {
    try {
      const url = this.buildPackageUrl(packageName);
      const response = await this.connectionManager.request(url);

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, { packageName });
      }

      const xmlContent = await response.text();
      const parsed = XmlParser.parse(xmlContent);

      // Parse package structure from XML
      const objects = this.parsePackageObjects(parsed);
      const subpackages = this.parseSubpackages(parsed);

      return {
        packageName,
        objects,
        subpackages,
      };
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error, { packageName });
    }
  }

  private buildSearchUrl(
    pattern: string,
    objectTypes?: string[],
    packages?: string[],
    maxResults?: number
  ): string {
    const url = new URL(
      '/sap/bc/adt/repository/informationsystem/search',
      'http://dummy'
    );

    url.searchParams.set('operation', 'quickSearch');
    url.searchParams.set('query', pattern);

    if (objectTypes && objectTypes.length > 0) {
      url.searchParams.set('objectType', objectTypes.join(','));
    }

    if (packages && packages.length > 0) {
      url.searchParams.set('packageName', packages.join(','));
    }

    if (maxResults) {
      url.searchParams.set('maxResults', maxResults.toString());
    }

    return url.pathname + url.search;
  }

  private buildPackageUrl(packageName: string): string {
    return `/sap/bc/adt/repository/informationsystem/packages/${encodeURIComponent(
      packageName
    )}/objectstructure`;
  }

  private parseObjectTypes(parsed: any): ObjectTypeInfo[] {
    // Implementation to parse object types from XML
    // This would extract the supported ABAP object types from the repository structure
    const objectTypes: ObjectTypeInfo[] = [];

    // Parse the XML structure to extract object type information
    // Example structure might include classes, programs, function groups, etc.
    if (parsed && parsed.typeStructure && parsed.typeStructure.objectTypes) {
      const types = Array.isArray(parsed.typeStructure.objectTypes)
        ? parsed.typeStructure.objectTypes
        : [parsed.typeStructure.objectTypes];

      for (const type of types) {
        objectTypes.push({
          type: type.type || '',
          name: type.name || '',
          description: type.description || '',
          category: type.category || 'unknown',
          supportedOperations: type.operations || [],
        });
      }
    }

    return objectTypes;
  }

  private parsePackageObjects(parsed: any): any[] {
    const objects: any[] = [];

    // Navigate through the XML structure to find objects
    if (parsed['adtcore:objectReferences']?.['adtcore:objectReference']) {
      const refs =
        parsed['adtcore:objectReferences']['adtcore:objectReference'];
      const objectRefs = Array.isArray(refs) ? refs : [refs];

      for (const ref of objectRefs) {
        objects.push({
          objectType: XmlParser.extractAttribute(ref, 'adtcore:type') || '',
          objectName: XmlParser.extractAttribute(ref, 'adtcore:name') || '',
          description:
            XmlParser.extractAttribute(ref, 'adtcore:description') || '',
          responsible:
            XmlParser.extractAttribute(ref, 'adtcore:responsible') || '',
          changedBy: XmlParser.extractAttribute(ref, 'adtcore:changedBy') || '',
          changedOn: XmlParser.extractAttribute(ref, 'adtcore:changedAt') || '',
        });
      }
    }

    return objects;
  }

  private parseSubpackages(parsed: any): string[] {
    const subpackages: string[] = [];

    // Navigate through the XML structure to find subpackages
    if (parsed['adtcore:packageReferences']?.['adtcore:packageReference']) {
      const refs =
        parsed['adtcore:packageReferences']['adtcore:packageReference'];
      const packageRefs = Array.isArray(refs) ? refs : [refs];

      for (const ref of packageRefs) {
        const packageName = XmlParser.extractAttribute(ref, 'adtcore:name');
        if (packageName) {
          subpackages.push(packageName);
        }
      }
    }

    return subpackages;
  }
}
