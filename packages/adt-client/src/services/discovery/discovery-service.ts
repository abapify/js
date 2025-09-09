import { ConnectionManager } from '../../client/connection-manager.js';
import { SystemInfo, ADTDiscoveryService } from './types.js';
import { XmlParser } from '../../utils/xml-parser.js';
import { ErrorHandler } from '../../utils/error-handler.js';

export class DiscoveryService {
  constructor(private connectionManager: ConnectionManager) {}

  async getDiscovery(): Promise<ADTDiscoveryService> {
    try {
      const url = '/sap/bc/adt/discovery';
      const response = await this.connectionManager.request(url);

      if (!response.ok) {
        throw await ErrorHandler.handleHttpError(response);
      }

      const xmlContent = await response.text();
      const parsed = XmlParser.parse(xmlContent);

      // Parse discovery information from ADT discovery endpoint
      const discoveryInfo = this.parseDiscoveryInfo(parsed);

      return discoveryInfo;
    } catch (error) {
      if (error instanceof Error && 'category' in error) {
        throw error;
      }
      throw ErrorHandler.handleNetworkError(error as Error);
    }
  }

  private parseDiscoveryInfo(parsed: any): SystemInfo {
    // Default system info structure
    const systemInfo: SystemInfo = {
      systemId: '',
      client: '',
      release: '',
      supportPackage: '',
      patchLevel: '',
      adtVersion: '',
      supportedFeatures: [],
    };

    // Navigate through the discovery XML to extract system information
    if (parsed['app:service']) {
      const service = parsed['app:service'];

      // Extract system ID from various possible locations
      systemInfo.systemId =
        XmlParser.extractAttribute(service, 'systemId') ||
        XmlParser.extractAttribute(service, 'id') ||
        'Unknown';

      // Extract version information
      systemInfo.adtVersion =
        XmlParser.extractAttribute(service, 'version') || '1.0';

      // Extract supported features from workspace elements
      if (service['app:workspace']) {
        const workspaces = Array.isArray(service['app:workspace'])
          ? service['app:workspace']
          : [service['app:workspace']];

        for (const workspace of workspaces) {
          const collection = workspace['app:collection'];
          if (collection) {
            const collections = Array.isArray(collection)
              ? collection
              : [collection];
            for (const coll of collections) {
              const href = XmlParser.extractAttribute(coll, 'href');
              if (href) {
                systemInfo.supportedFeatures.push(href);
              }
            }
          }
        }
      }
    }

    return systemInfo;
  }
}
