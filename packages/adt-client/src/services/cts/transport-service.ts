import { ConnectionManager } from '../../client/connection-manager.js';
import { TransportObject } from './types.js';
import { AssignResult } from '../../types/client.js';
import { XmlParser } from '../../utils/xml-parser.js';
import { ErrorHandler } from '../../utils/error-handler.js';
import { createLogger } from '../../utils/logger.js';
import type {
  Transport,
  TransportFilters,
  TransportList,
  TransportGetOptions,
  TransportGetResult,
  TransportCreateOptions,
  TransportCreateResult,
} from './types.js';

export class TransportService {
  private logger: any;

  constructor(private connectionManager: ConnectionManager, logger?: any) {
    this.logger = logger || createLogger('cts');
  }

  async listTransports(filters: TransportFilters = {}): Promise<TransportList> {
    try {
      // Step 1: Get transport search configuration (like real ADT does)
      const configResponse = await this.getTransportSearchConfig(filters.debug);

      // Step 2: Use the configuration to get transport requests
      return await this.getTransportsWithConfig(configResponse, filters);
    } catch (error) {
      this.logger.debug(
        'Failed with ADT protocol, falling back to simple approach',
        {
          error: error instanceof Error ? error.message : String(error),
        }
      );

      // Fallback to simple approach if ADT protocol fails
      return await this.getTransportsSimple(filters);
    }
  }

  async getTransportObjects(transportId: string): Promise<TransportObject[]> {
    try {
      const url = this.buildTransportUrl(transportId, 'objects');
      const response = await this.connectionManager.request(url);

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, { transportId });
      }

      const xmlContent = await response.text();
      const objects = XmlParser.parseTransportObjects(xmlContent);

      return objects.map((obj: any) => ({
        objectType: XmlParser.extractAttribute(obj, 'adtcore:type') || '',
        objectName: XmlParser.extractAttribute(obj, 'adtcore:name') || '',
        description:
          XmlParser.extractAttribute(obj, 'adtcore:description') || '',
        packageName:
          XmlParser.extractAttribute(obj, 'adtcore:packageName') || '',
        operation: this.mapOperation(
          XmlParser.extractAttribute(obj, 'cts:operation')
        ),
        lockStatus: this.mapLockStatus(
          XmlParser.extractAttribute(obj, 'cts:lockStatus')
        ),
      }));
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error, { transportId });
    }
  }

  private async getTransportSearchConfig(debug = false): Promise<string> {
    // Try to get the search configuration with correct Accept headers
    const configEndpoints = [
      {
        url: '/sap/bc/adt/cts/transportrequests/searchconfiguration/configurations',
        accept: 'application/vnd.sap.adt.configurations.v1+xml',
      },
      {
        url: '/sap/bc/adt/cts/transportrequests/searchconfiguration/metadata',
        accept: 'application/vnd.sap.adt.configuration.metadata.v1+xml',
      },
    ];

    for (const endpoint of configEndpoints) {
      try {
        this.logger.debug('Getting search configuration', {
          url: endpoint.url,
        });

        const response = await this.connectionManager.request(endpoint.url, {
          headers: {
            Accept: endpoint.accept,
          },
        });

        if (!response.ok) {
          continue;
        }

        const xmlContent = await response.text();

        this.logger.trace('Config response received', {
          bytes: xmlContent.length,
          preview: xmlContent.substring(0, 300),
        });

        // Parse the configuration XML to extract the specific configuration ID
        const configId = this.extractConfigurationId(xmlContent);
        if (configId) {
          const fullConfigUri = `${endpoint.url}/${configId}`;
          this.logger.debug('Config ID extracted', {
            configId,
            fullConfigUri,
          });
          return fullConfigUri;
        }

        // Fallback to the generic endpoint if no specific ID found
        return endpoint.url;
      } catch (error) {
        this.logger.debug('Config endpoint failed', {
          url: endpoint.url,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    throw new Error('Could not get transport search configuration');
  }

  private extractConfigurationId(xmlContent: string): string | null {
    // Parse XML to find configuration ID
    try {
      const parsed = XmlParser.parse(xmlContent);
      // Look for configuration entries and extract ID
      if (parsed.configurations && parsed.configurations.configuration) {
        const configs = Array.isArray(parsed.configurations.configuration)
          ? parsed.configurations.configuration
          : [parsed.configurations.configuration];

        // Return the first configuration ID found
        for (const config of configs) {
          if (config['@id']) {
            return config['@id'];
          }
        }
      }
    } catch (error) {
      // Ignore parsing errors and return null
    }
    return null;
  }

  private async getTransportsWithConfig(
    configUri: string,
    filters: TransportFilters
  ): Promise<TransportList> {
    // Implementation for getting transports with configuration
    // This would use the configuration to build proper transport search requests
    return this.getTransportsSimple(filters);
  }

  private async getTransportsSimple(
    filters: TransportFilters
  ): Promise<TransportList> {
    try {
      const url = '/sap/bc/adt/cts/transportrequests';
      const response = await this.connectionManager.request(url);

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, { filters });
      }

      const xmlContent = await response.text();
      return this.parseTransportList(xmlContent);
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error, { filters });
    }
  }

  private parseTransportList(xmlContent: string): TransportList {
    const transportData = XmlParser.parseTransportList(xmlContent);
    const transports: Transport[] = transportData.map((item: any) => ({
      transportNumber: XmlParser.extractAttribute(item, 'number') || '',
      description: XmlParser.extractAttribute(item, 'description') || '',
      owner: XmlParser.extractAttribute(item, 'owner') || '',
      status: XmlParser.extractAttribute(item, 'status') || '',
      type: XmlParser.extractAttribute(item, 'type') || 'K',
      target: XmlParser.extractAttribute(item, 'target') || '',
      createdAt: XmlParser.extractAttribute(item, 'created') || '',
      lastChangedAt: XmlParser.extractAttribute(item, 'changed') || '',
      tasks: [], // Tasks would be parsed separately if needed
    }));

    return {
      transports,
      totalCount: transports.length,
    };
  }

  async assignToTransport(
    objectKey: string,
    transportId: string
  ): Promise<AssignResult> {
    try {
      const url = `/sap/bc/adt/cts/transports/${encodeURIComponent(
        transportId
      )}/objects`;

      // Parse object key (format: "OBJECTTYPE:OBJECTNAME")
      const [objectType, objectName] = objectKey.split(':');

      const assignmentXml = this.buildAssignmentXml(objectType, objectName);

      const response = await this.connectionManager.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
        },
        body: assignmentXml,
      });

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, {
          objectKey,
          transportId,
        });
      }

      return {
        success: true,
        transportId,
        objectKey,
      };
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error, {
        objectKey,
        transportId,
      });
    }
  }

  async createTransport(
    options: TransportCreateOptions
  ): Promise<TransportCreateResult> {
    try {
      const url = '/sap/bc/adt/cts/transportrequests';

      const xmlPayload = this.buildCreateTransportXml(options);

      const response = await this.connectionManager.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          Accept: 'application/vnd.sap.adt.transportorganizer.v1+xml',
          'x-sap-security-session': 'use',
          'sap-cancel-on-close': 'true',
        },
        body: xmlPayload,
      });

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, options);
      }

      const xmlContent = await response.text();
      const transport = XmlParser.parseTransportDetail(xmlContent);

      if (!transport) {
        throw new Error('Failed to parse created transport response');
      }

      // Create task info if not present
      let task = transport.tasks?.[0];
      if (!task) {
        task = {
          number: transport.number + '1',
          description: transport.description,
          status: transport.status,
          owner: transport.owner,
          created: transport.created,
          type: 'Development/Correction',
        };
      }

      return {
        transport,
        task,
      };
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error, options);
    }
  }

  private buildTransportUrl(transportId: string, operation: string): string {
    return `/sap/bc/adt/cts/transports/${encodeURIComponent(
      transportId
    )}/${operation}`;
  }

  async releaseTransport(
    transportId: string
  ): Promise<{ success: boolean; transportId: string }> {
    try {
      const url = `/sap/bc/adt/cts/transportrequests/${transportId}`;

      const response = await this.connectionManager.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          Accept: 'application/vnd.sap.adt.transportorganizer.v1+xml',
        },
        body: `<?xml version="1.0" encoding="UTF-8"?>
<cts:transport xmlns:cts="http://www.sap.com/cts" action="release"/>`,
      });

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, { transportId });
      }

      return {
        success: true,
        transportId,
      };
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error, { transportId });
    }
  }

  async addObjectToTransport(
    transportId: string,
    object: { objectType: string; objectName: string }
  ): Promise<{ success: boolean; transportId: string; objectKey: string }> {
    const objectKey = `${object.objectType}:${object.objectName}`;

    try {
      const url = `/sap/bc/adt/cts/transportrequests/${transportId}/objects`;
      const assignmentXml = this.buildAssignmentXml(
        object.objectType,
        object.objectName
      );

      const response = await this.connectionManager.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
        },
        body: assignmentXml,
      });

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response, {
          objectKey,
          transportId,
        });
      }

      return {
        success: true,
        transportId,
        objectKey,
      };
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error, {
        objectKey,
        transportId,
      });
    }
  }

  private buildAssignmentXml(objectType: string, objectName: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<cts:object xmlns:cts="http://www.sap.com/cts" 
            xmlns:adtcore="http://www.sap.com/adt/core">
  <adtcore:objectReference adtcore:uri="/sap/bc/adt/oo/classes/${objectName}" 
                          adtcore:type="${objectType}" 
                          adtcore:name="${objectName}"/>
</cts:object>`;
  }

  private buildCreateTransportXml(options: TransportCreateOptions): string {
    const type = options.type || 'K';
    const target = options.target || 'LOCAL';
    const project = options.project || '';
    const owner = options.owner || 'DEVELOPER';

    return `<?xml version="1.0" encoding="ASCII"?>
<tm:root xmlns:tm="http://www.sap.com/cts/adt/tm" tm:useraction="newrequest">
  <tm:request tm:desc="${this.escapeXml(
    options.description
  )}" tm:type="${type}" tm:target="${target}" tm:cts_project="${project}">
    <tm:task tm:owner="${owner}"/>
  </tm:request>
</tm:root>`;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private mapOperation(
    operation: string
  ): 'insert' | 'update' | 'delete' | 'unknown' {
    switch (operation?.toLowerCase()) {
      case 'i':
      case 'insert':
        return 'insert';
      case 'u':
      case 'update':
        return 'update';
      case 'd':
      case 'delete':
        return 'delete';
      default:
        return 'unknown';
    }
  }

  private mapLockStatus(status: string): 'locked' | 'unlocked' {
    return status?.toLowerCase() === 'locked' ? 'locked' : 'unlocked';
  }
}
