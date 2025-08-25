import { ADTClient } from '../../adt-client';
import { XMLParser } from 'fast-xml-parser';

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

  // CLI options
  debug?: boolean;
}

export interface SearchResult {
  totalCount: number;
  objects: ADTObject[];
}

export interface ADTObject {
  name: string;
  type: string;
  description: string;
  packageName: string;
  uri: string;
  fullType: string; // e.g., "CLAS/OC"
}

export class SearchService {
  private xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@',
    parseAttributeValue: true,
    trimValues: true,
  });

  constructor(private adtClient: ADTClient) {}

  async searchObjects(options: SearchOptions): Promise<SearchResult> {
    if (options.debug) {
      this.adtClient.setDebugMode(true);
      console.log(
        `🔍 Searching objects with options:`,
        this.sanitizeOptions(options)
      );
    }

    try {
      const searchUrl = this.buildSearchUrl(options);
      console.log(`🌐 Search URL: ${searchUrl.substring(0, 100)}...`);

      const response = await this.adtClient.request(searchUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/xml',
        },
      });

      const xmlContent = await response.text();
      console.log(
        `📄 Search response (${
          xmlContent.length
        } chars): ${xmlContent.substring(0, 200)}...`
      );

      return this.parseSearchResults(xmlContent);
    } catch (error) {
      throw new Error(
        `Search failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  async searchByPackage(
    packageName: string,
    options: Partial<SearchOptions> = {}
  ): Promise<SearchResult> {
    return this.searchObjects({
      operation: 'quickSearch',
      packageName,
      maxResults: 1000,
      ...options,
    });
  }

  async searchByObjectType(
    objectType: string,
    options: Partial<SearchOptions> = {}
  ): Promise<SearchResult> {
    return this.searchObjects({
      operation: 'quickSearch',
      objectType,
      maxResults: 100,
      ...options,
    });
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

  private parseSearchResults(xmlContent: string): SearchResult {
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

    const objects: ADTObject[] = objectList.map((ref: any) => ({
      name: ref['@adtcore:name'] || ref['@name'] || '',
      type: this.extractObjectType(ref['@adtcore:type'] || ref['@type'] || ''),
      fullType: ref['@adtcore:type'] || ref['@type'] || '',
      description: ref['@adtcore:description'] || ref['@description'] || '',
      packageName: ref['@adtcore:packageName'] || ref['@packageName'] || '',
      uri: ref['@adtcore:uri'] || ref['@uri'] || '',
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

  private sanitizeOptions(options: SearchOptions): any {
    // Remove debug flag for clean logging
    const { debug, ...cleanOptions } = options;
    return cleanOptions;
  }
}
