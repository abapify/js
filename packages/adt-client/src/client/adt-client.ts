import {
  AdtConnectionConfig,
  AdtClientConfig,
  RequestOptions,
  SearchQuery,
  UpdateResult,
  CreateResult,
  DeleteResult,
} from '../types/client.js';
import type { AdtObject, ObjectMetadata } from '../types/core.js';
import type {
  ADTDiscoveryService,
  ADTWorkspace,
  ADTCollection,
  ADTCategory,
  ADTTemplateLink,
  SystemInfo,
} from '../services/discovery/types.js';
import { ConnectionManager } from './connection-manager.js';
import { AuthManager } from './auth-manager.js';
import { TransportService } from '../services/cts/transport-service.js';
import { AtcService } from '../services/atc/atc-service.js';
import { RepositoryService } from '../services/repository/repository-service.js';
import { DiscoveryService } from '../services/discovery/discovery-service.js';
import { ObjectService } from '../services/repository/object-service.js';
import { SearchService } from '../services/repository/search-service.js';
import { TestService } from '../services/test/test-service.js';
import { createLogger } from '../utils/logger.js';
import { SessionManager } from './session-manager.js';
import { ErrorHandler } from '../utils/error-handler.js';
import { XmlParser } from '../utils/xml-parser.js';
import type { CtsOperations } from '../services/cts/types.js';
import type { AtcOperations } from '../services/atc/types.js';
import type { RepositoryOperations } from '../services/repository/types.js';
import type { DiscoveryOperations } from '../services/discovery/types.js';

export interface AdtClient {
  // Connection management
  connect(config: AdtConnectionConfig): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // ADT Services
  readonly cts: CtsOperations; // Change & Transport System
  readonly atc: AtcOperations; // ABAP Test Cockpit
  readonly repository: RepositoryOperations; // All object operations
  readonly discovery: DiscoveryOperations; // System discovery
  readonly test: TestService; // Test operations for debugging

  // Low-level access for advanced use cases
  request(endpoint: string, options?: RequestOptions): Promise<Response>;
}

export class AdtClientImpl implements AdtClient {
  private connectionManager: ConnectionManager;
  private sessionManager: SessionManager;
  private objectService: ObjectService;
  private searchService: SearchService;
  private transportService: TransportService;
  private discoveryService: DiscoveryService;
  private atcService: AtcService;
  private testService: TestService;
  private debugMode = false;
  private logger: any;

  // Service accessors
  readonly cts: CtsOperations;
  readonly atc: AtcOperations;
  readonly repository: RepositoryOperations;
  readonly discovery: DiscoveryOperations;
  readonly test: TestService;

  constructor(config: AdtClientConfig = {}) {
    // Initialize logger - use provided logger or create default
    this.logger = config.logger || createLogger('adt-client');

    this.connectionManager = new ConnectionManager(
      this.logger.child({ component: 'connection' })
    );
    this.sessionManager = new SessionManager();
    this.objectService = new ObjectService(this.connectionManager);
    this.searchService = new SearchService(this.connectionManager);
    this.transportService = new TransportService(
      this.connectionManager,
      this.logger.child({ component: 'cts' })
    );
    this.discoveryService = new DiscoveryService(this.connectionManager);
    this.atcService = new AtcService(
      this.connectionManager,
      this.logger.child({ component: 'atc' })
    );
    this.testService = new TestService(
      this.logger.child({ component: 'test' })
    );

    // Initialize service accessors
    this.cts = {
      createTransport: (options) =>
        this.transportService.createTransport(options),
      listTransports: (filters) =>
        this.transportService.listTransports(filters),
      getTransportObjects: (transportId) =>
        this.transportService.getTransportObjects(transportId),
      assignObject: (objectKey, transportId) =>
        this.transportService.assignToTransport(objectKey, transportId),
    };

    this.atc = {
      run: (options) => this.atcService.runAtcCheck(options),
      getResults: async (runId) => {
        // TODO: Implement getResults method in AtcService
        throw new Error('ATC getResults not yet implemented');
      },
    };

    this.repository = {
      getObject: (objectType, objectName) =>
        this.objectService.getObject(objectType, objectName),
      getObjectSource: (objectType, objectName, include) =>
        this.objectService.getObjectSource(objectType, objectName, include),
      getObjectMetadata: (objectType, objectName) =>
        this.objectService.getObjectMetadata(objectType, objectName),
      getObjectOutline: (objectType, objectName) =>
        this.objectService.getObjectOutline(objectType, objectName),
      createObject: (objectType, objectName, content) =>
        this.objectService.createObject(objectType, objectName, content),
      updateObject: (objectType, objectName, content) =>
        this.objectService.updateObject(objectType, objectName, content),
      searchObjects: (query, options) =>
        this.searchService.searchObjects(query, options),
      searchObjectsDetailed: (options) =>
        this.searchService.searchObjectsDetailed(options),
      getPackageContents: (packageName) =>
        this.searchService.getPackageContents(packageName),
    };

    this.discovery = {
      getSystemInfo: () => this.getSystemInfo(),
      getDiscovery: () => this.getDiscovery(),
    };

    // Expose test service directly
    this.test = this.testService;
  }

  async connect(config: AdtConnectionConfig): Promise<void> {
    await this.connectionManager.connect(config);
    await this.sessionManager.initialize(this.connectionManager);
  }

  async disconnect(): Promise<void> {
    await this.sessionManager.cleanup();
    await this.connectionManager.disconnect();
  }

  isConnected(): boolean {
    return (
      this.connectionManager.isConnected() && this.sessionManager.isValid()
    );
  }

  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    this.connectionManager.setDebugMode(enabled);
  }

  // Keep these methods for internal use by service accessors
  async getSystemInfo(): Promise<SystemInfo> {
    return await this.discoveryService.getSystemInfo();
  }

  async getDiscovery(): Promise<ADTDiscoveryService> {
    return await this.discoveryService.getDiscovery();
  }

  private parseDiscoveryXml(xmlContent: string): ADTDiscoveryService {
    const result = XmlParser.parse(xmlContent);
    const service = result['app:service'] || result.service;
    const workspaces = service['app:workspace'] || service.workspace;

    const parsedWorkspaces: ADTWorkspace[] = [];

    if (Array.isArray(workspaces)) {
      for (const workspace of workspaces) {
        parsedWorkspaces.push(this.parseWorkspace(workspace));
      }
    } else if (workspaces) {
      parsedWorkspaces.push(this.parseWorkspace(workspaces));
    }

    return {
      workspaces: parsedWorkspaces,
    };
  }

  private parseWorkspace(workspace: any): ADTWorkspace {
    const title = workspace['atom:title'] || workspace.title || 'Unknown';
    const collections =
      workspace['app:collection'] || workspace.collection || [];

    const parsedCollections: ADTCollection[] = [];

    if (Array.isArray(collections)) {
      for (const collection of collections) {
        parsedCollections.push(this.parseCollection(collection));
      }
    } else if (collections) {
      parsedCollections.push(this.parseCollection(collections));
    }

    return {
      title,
      collections: parsedCollections,
    };
  }

  private parseCollection(collection: any): ADTCollection {
    const title = collection['atom:title'] || collection.title || 'Unknown';
    const href = collection['@href'] || '';
    const accept = collection['app:accept'] || collection.accept;

    let category: ADTCategory | undefined;
    const categoryData = collection['atom:category'] || collection.category;
    if (categoryData) {
      category = {
        term: categoryData['@term'] || '',
        scheme: categoryData['@scheme'] || '',
      };
    }

    let templateLinks: ADTTemplateLink[] = [];
    const templateLinksData =
      collection['adtcomp:templateLinks'] || collection.templateLinks;
    if (templateLinksData) {
      const links =
        templateLinksData['adtcomp:templateLink'] ||
        templateLinksData.templateLink;
      if (Array.isArray(links)) {
        templateLinks = links.map((link) => ({
          rel: link['@rel'] || '',
          template: link['@template'] || '',
        }));
      } else if (links) {
        templateLinks = [
          {
            rel: links['@rel'] || '',
            template: links['@template'] || '',
          },
        ];
      }
    }

    return {
      title,
      href,
      accept,
      category,
      templateLinks: templateLinks.length > 0 ? templateLinks : undefined,
    };
  }

  async getSupportedObjectTypes(): Promise<ObjectTypeInfo[]> {
    return this.objectService.getSupportedObjectTypes();
  }

  async request(endpoint: string, options?: RequestOptions): Promise<Response> {
    return this.connectionManager.request(endpoint, options);
  }
}
