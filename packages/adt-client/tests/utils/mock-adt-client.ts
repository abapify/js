import type { AdtClient } from '../../src/client/adt-client';
import type { AdtObject, ObjectMetadata } from '../../src/types/core';
import type {
  AdtConnectionConfig,
  AdtClientConfig,
  SearchQuery,
  UpdateResult,
  CreateResult,
  DeleteResult,
} from '../../src/types/client';
import type { AtcOptions, AtcResult } from '../../src/services/atc/types';
import type {
  TransportFilters,
  TransportList,
  TransportCreateOptions,
  TransportCreateResult,
} from '../../src/services/cts/types';
import type {
  SearchOptions,
  SearchResultDetailed,
} from '../../src/services/repository/search-service';
import type { ADTDiscoveryService } from '../../src/services/discovery/types';

/**
 * Mock implementation of AdtClient for testing purposes
 * Provides realistic mock data and configurable behavior
 */
export class MockAdtClient implements AdtClient {
  private _connected = false;
  private _mockObjects = new Map<string, AdtObject>();
  private _mockTransports = new Map<string, any>();
  private _mockAtcResults = new Map<string, AtcResult>();

  constructor(private config?: AdtClientConfig) {
    this.setupDefaultMockData();
  }

  // Connection management
  async connect(config: AdtConnectionConfig): Promise<void> {
    this._connected = true;
  }

  async disconnect(): Promise<void> {
    this._connected = false;
  }

  isConnected(): boolean {
    return this._connected;
  }

  // Service accessors
  get cts() {
    return {
      getTransports: async (
        filters?: TransportFilters
      ): Promise<TransportList> => {
        return {
          transports: Array.from(this._mockTransports.values()),
          totalCount: this._mockTransports.size,
        };
      },
      createTransport: async (
        options: TransportCreateOptions
      ): Promise<TransportCreateResult> => {
        const transport = {
          transportNumber: `T${Date.now()}`,
          description: options.description,
          owner: 'TESTUSER',
          status: 'modifiable',
        };
        this._mockTransports.set(transport.transportNumber, transport);
        return {
          success: true,
          transportNumber: transport.transportNumber,
        };
      },
      releaseTransport: async (
        transportNumber: string
      ): Promise<UpdateResult> => {
        const transport = this._mockTransports.get(transportNumber);
        if (transport) {
          transport.status = 'released';
          return { success: true };
        }
        return { success: false, messages: ['Transport not found'] };
      },
    };
  }

  get atc() {
    return {
      run: async (options: AtcOptions): Promise<AtcResult> => {
        const key = `${options.objectType}:${options.objectName}`;
        return (
          this._mockAtcResults.get(key) || {
            findings: [],
            summary: {
              total: 0,
              errors: 0,
              warnings: 0,
              infos: 0,
            },
          }
        );
      },
    };
  }

  get repository() {
    return {
      getObject: async (
        objectType: string,
        objectName: string
      ): Promise<AdtObject> => {
        const key = `${objectType}:${objectName}`;
        const mockObject = this._mockObjects.get(key);
        if (!mockObject) {
          throw new Error(`Object ${objectType} ${objectName} not found`);
        }
        return mockObject;
      },
      getObjectSource: async (
        objectType: string,
        objectName: string,
        include?: string
      ): Promise<string> => {
        return `* Mock source code for ${objectType} ${objectName}\nDATA: lv_test TYPE string.`;
      },
      getObjectMetadata: async (
        objectType: string,
        objectName: string
      ): Promise<ObjectMetadata> => {
        const key = `${objectType}:${objectName}`;
        const mockObject = this._mockObjects.get(key);
        return (
          mockObject?.metadata ||
          this.createMockMetadata(objectType, objectName)
        );
      },
      searchObjects: async (
        query: SearchQuery,
        options?: SearchOptions
      ): Promise<SearchResultDetailed> => {
        return {
          objects: [],
          totalCount: 0,
          hasMore: false,
        };
      },
      createObject: async (
        objectType: string,
        objectName: string,
        content: string
      ): Promise<CreateResult> => {
        const mockObject = this.createMockObject(objectType, objectName);
        this._mockObjects.set(`${objectType}:${objectName}`, mockObject);
        return { success: true };
      },
      updateObject: async (
        objectType: string,
        objectName: string,
        content: string
      ): Promise<UpdateResult> => {
        const key = `${objectType}:${objectName}`;
        if (this._mockObjects.has(key)) {
          return { success: true };
        }
        return { success: false, messages: ['Object not found'] };
      },
      deleteObject: async (
        objectType: string,
        objectName: string
      ): Promise<DeleteResult> => {
        const key = `${objectType}:${objectName}`;
        const deleted = this._mockObjects.delete(key);
        return { success: deleted };
      },
    };
  }

  get discovery() {
    return {
      getDiscovery: async (): Promise<ADTDiscoveryService> => {
        return {
          systemInfo: {
            systemId: 'TST',
            client: '100',
            release: '756',
            supportPackage: '0002',
            patchLevel: '0',
            adtVersion: '3.0.0',
            supportedFeatures: ['ATC', 'CTS', 'REPOSITORY'],
          },
          workspaces: [],
          collections: [],
        };
      },
    };
  }

  // Mock data management methods
  addMockObject(
    objectType: string,
    objectName: string,
    customData?: Partial<AdtObject>
  ): void {
    const mockObject = this.createMockObject(
      objectType,
      objectName,
      customData
    );
    this._mockObjects.set(`${objectType}:${objectName}`, mockObject);
  }

  addMockAtcResult(
    objectType: string,
    objectName: string,
    result: AtcResult
  ): void {
    const key = `${objectType}:${objectName}`;
    this._mockAtcResults.set(key, result);
  }

  clearMockData(): void {
    this._mockObjects.clear();
    this._mockTransports.clear();
    this._mockAtcResults.clear();
    this.setupDefaultMockData();
  }

  private setupDefaultMockData(): void {
    // Add some default mock objects
    this.addMockObject('CLAS', 'ZCL_TEST_CLASS');
    this.addMockObject('PROG', 'Z_TEST_PROGRAM');

    // Add default ATC results
    this.addMockAtcResult('CLAS', 'ZCL_TEST_CLASS', {
      findings: [
        {
          messageId: 'TEST001',
          messageText: 'Test finding',
          severity: 'warning',
          location: {
            uri: '/sap/bc/adt/oo/classes/zcl_test_class',
            line: 10,
            column: 5,
          },
        },
      ],
      summary: {
        total: 1,
        errors: 0,
        warnings: 1,
        infos: 0,
      },
    });
  }

  private createMockObject(
    objectType: string,
    objectName: string,
    customData?: Partial<AdtObject>
  ): AdtObject {
    const metadata = this.createMockMetadata(objectType, objectName);

    return {
      objectType,
      objectName,
      packageName: '$TMP',
      description: `Mock ${objectType} ${objectName}`,
      responsible: 'TESTUSER',
      createdBy: 'TESTUSER',
      createdOn: '2024-01-01T10:00:00Z',
      changedBy: 'TESTUSER',
      changedOn: '2024-01-01T10:00:00Z',
      version: '1',
      etag: 'mock-etag-123',
      content: {
        main: `* Mock content for ${objectType} ${objectName}`,
      },
      metadata,
      ...customData,
    };
  }

  private createMockMetadata(
    objectType: string,
    objectName: string
  ): ObjectMetadata {
    return {
      objectType,
      objectName,
      packageName: '$TMP',
      description: `Mock ${objectType} ${objectName}`,
      responsible: 'TESTUSER',
      masterLanguage: 'EN',
      abapLanguageVersion: 'standard',
      createdBy: 'TESTUSER',
      createdOn: '2024-01-01T10:00:00Z',
      changedBy: 'TESTUSER',
      changedOn: '2024-01-01T10:00:00Z',
      version: '1',
      etag: 'mock-etag-123',
      locked: false,
    };
  }
}

/**
 * Factory function to create a mock ADT client
 */
export function createMockAdtClient(config?: AdtClientConfig): MockAdtClient {
  return new MockAdtClient(config);
}
