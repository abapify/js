import { ConnectionManager } from '../../client/connection-manager.js';
import { PackageContent } from './types.js';
import { SearchQuery } from '../../types/client.js';
import { RepositoryService } from './repository-service.js';
import { XmlParser } from '../../utils/xml-parser.js';
import { ErrorHandler } from '../../utils/error-handler.js';

export interface SearchOptions {
  // Core search parameters
  operation?: 'quickSearch' | 'search';
  query?: string;
  maxResults?: number;
  noDescription?: boolean;

  // Filter parameters
  packageName?: string;
  objectType?: string;
  group?: string;
  sourcetype?: string;
  state?: string;
  lifecycle?: string;
  rollout?: string;
  zone?: string;
  category?: string;
  appl?: string;
  userName?: string;
  releaseState?: string;
  language?: string;
  system?: string;
  version?: string;
  docu?: string;
  fav?: string;
  created?: string;
  month?: string;
  date?: string;
  comp?: string;
  abaplv?: string;
}

export interface SearchResultDetailed {
  totalCount: number;
  objects: ADTObjectInfo[];
}

export interface ADTObjectInfo {
  name: string;
  type: string;
  description: string;
  packageName: string;
  uri: string;
  fullType: string; // e.g., "CLAS/OC"
}

export class SearchService {
  private repositoryService: RepositoryService;
  private xmlParser = XmlParser;

  constructor(private connectionManager: ConnectionManager) {
    this.repositoryService = new RepositoryService(connectionManager);
  }

  async searchObjects(query: SearchQuery): Promise<SearchResult[]> {
    return this.repositoryService.searchObjects(query);
  }

  async searchObjectsDetailed(
    options: SearchOptions
  ): Promise<SearchResultDetailed> {
    try {
      const searchUrl = this.buildSearchUrl(options);
      const response = await this.connectionManager.request(searchUrl, {
        headers: {
          Accept: 'application/xml',
        },
      });

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, { options });
      }

      const xmlContent = await response.text();
      return this.parseSearchResults(xmlContent);
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error, { options });
    }
  }

  async searchByPackage(
    packageName: string,
    options: Partial<SearchOptions> = {}
  ): Promise<SearchResultDetailed> {
    return this.searchObjectsDetailed({
      operation: 'quickSearch',
      packageName,
      maxResults: 1000,
      ...options,
    });
  }

  async searchByObjectType(
    objectType: string,
    options: Partial<SearchOptions> = {}
  ): Promise<SearchResultDetailed> {
    return this.searchObjectsDetailed({
      operation: 'quickSearch',
      objectType,
      maxResults: 100,
      ...options,
    });
  }

  async getPackageContents(packageName: string): Promise<PackageContent> {
    return this.repositoryService.getPackageContents(packageName);
  }

  private buildSearchUrl(options: SearchOptions): string {
    const baseUrl = '/sap/bc/adt/repository/informationsystem/search';
    const params = new URLSearchParams();

    // Add core parameters
    if (options.operation) params.set('operation', options.operation);
    if (options.query) params.set('query', options.query);
    if (options.maxResults)
      params.set('maxResults', options.maxResults.toString());
    if (options.noDescription) params.set('noDescription', 'true');

    // Add filter parameters
    if (options.packageName) params.set('packageName', options.packageName);
    if (options.objectType) params.set('objectType', options.objectType);
    if (options.group) params.set('group', options.group);
    if (options.sourcetype) params.set('sourcetype', options.sourcetype);
    if (options.state) params.set('state', options.state);
    if (options.lifecycle) params.set('lifecycle', options.lifecycle);
    if (options.rollout) params.set('rollout', options.rollout);
    if (options.zone) params.set('zone', options.zone);
    if (options.category) params.set('category', options.category);
    if (options.appl) params.set('appl', options.appl);
    if (options.userName) params.set('userName', options.userName);
    if (options.releaseState) params.set('releaseState', options.releaseState);
    if (options.language) params.set('language', options.language);
    if (options.system) params.set('system', options.system);
    if (options.version) params.set('version', options.version);
    if (options.docu) params.set('docu', options.docu);
    if (options.fav) params.set('fav', options.fav);
    if (options.created) params.set('created', options.created);
    if (options.month) params.set('month', options.month);
    if (options.date) params.set('date', options.date);
    if (options.comp) params.set('comp', options.comp);
    if (options.abaplv) params.set('abaplv', options.abaplv);

    return `${baseUrl}?${params.toString()}`;
  }

  private parseSearchResults(xmlContent: string): SearchResultDetailed {
    const result = this.xmlParser.parse(xmlContent);

    const objectReferences =
      result['adtcore:objectReferences'] || result.objectReferences;
    if (!objectReferences) {
      return { totalCount: 0, objects: [] };
    }

    const references =
      objectReferences['adtcore:objectReference'] ||
      objectReferences.objectReference ||
      [];
    const objectList = Array.isArray(references) ? references : [references];

    const objects: ADTObjectInfo[] = objectList.map((ref: any) => ({
      name:
        ref['@_adtcore:name'] ||
        ref['@adtcore:name'] ||
        ref['@_name'] ||
        ref['@name'] ||
        '',
      type: this.extractObjectType(
        ref['@_adtcore:type'] ||
          ref['@adtcore:type'] ||
          ref['@_type'] ||
          ref['@type'] ||
          ''
      ),
      fullType:
        ref['@_adtcore:type'] ||
        ref['@adtcore:type'] ||
        ref['@_type'] ||
        ref['@type'] ||
        '',
      description:
        ref['@_adtcore:description'] ||
        ref['@adtcore:description'] ||
        ref['@_description'] ||
        ref['@description'] ||
        '',
      packageName:
        ref['@_adtcore:packageName'] ||
        ref['@adtcore:packageName'] ||
        ref['@_packageName'] ||
        ref['@packageName'] ||
        '',
      uri:
        ref['@_adtcore:uri'] ||
        ref['@adtcore:uri'] ||
        ref['@_uri'] ||
        ref['@uri'] ||
        '',
    }));

    return {
      totalCount: objects.length,
      objects,
    };
  }

  private extractObjectType(fullType: string): string {
    // Extract just the object type from "CLAS/OC" -> "CLAS"
    return fullType.split('/')[0] || fullType;
  }
}
