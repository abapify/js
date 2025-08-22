import { ADTClient } from '../../adt-client';
import { TransportParser } from './parser';
import {
  Transport,
  TransportFilters,
  TransportList,
  TransportGetOptions,
  TransportGetResult,
} from './types';

export class TransportService {
  private parser: TransportParser;

  constructor(private adtClient: ADTClient) {
    this.parser = new TransportParser();
  }

  async listTransports(filters: TransportFilters = {}): Promise<TransportList> {
    console.log(`🚚 Fetching transport requests...`);

    try {
      // Step 1: Get transport search configuration (like real ADT does)
      const configResponse = await this.getTransportSearchConfig(filters.debug);

      // Step 2: Use the configuration to get transport requests
      return await this.getTransportsWithConfig(configResponse, filters);
    } catch (error) {
      if (filters.debug) {
        console.log(
          'Failed with ADT protocol:',
          error instanceof Error ? error.message : String(error)
        );
        console.log('Falling back to simple approach...');
      }

      // Fallback to simple approach if ADT protocol fails
      return await this.getTransportsSimple(filters);
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
        if (debug) {
          console.log(`Getting search configuration from: ${endpoint.url}`);
        }

        const xmlContent = await this.adtClient.get(endpoint.url, {
          Accept: endpoint.accept,
        });

        if (debug) {
          console.log(
            `Config response (${xmlContent.length} bytes):`,
            xmlContent.substring(0, 300)
          );
        }

        // Parse the configuration XML to extract the specific configuration ID
        const configId = this.extractConfigurationId(xmlContent);
        if (configId) {
          const fullConfigUri = `${endpoint.url}/${configId}`;
          if (debug) {
            console.log(`Extracted config ID: ${configId}`);
            console.log(`Full config URI: ${fullConfigUri}`);
          }
          return fullConfigUri;
        }

        // Fallback to the generic endpoint if no specific ID found
        return endpoint.url;
      } catch (error) {
        if (debug) {
          console.log(
            `Config endpoint ${endpoint.url} failed:`,
            error instanceof Error ? error.message : String(error)
          );
        }
      }
    }

    throw new Error('Could not get transport search configuration');
  }

  private extractConfigurationId(xmlContent: string): string | null {
    try {
      // Look for configuration ID in the XML - could be in various attributes
      const patterns = [
        /id\s*=\s*"([^"]+)"/, // id="..."
        /adtcore:name\s*=\s*"([^"]+)"/, // adtcore:name="..."
        /name\s*=\s*"([^"]+)"/, // name="..."
        /href\s*=\s*"[^"]*\/([^\/\?"]+)"/, // Extract from href path
      ];

      for (const pattern of patterns) {
        const match = xmlContent.match(pattern);
        if (match && match[1]) {
          // Validate that it looks like a config ID (typically alphanumeric)
          if (/^[A-Fa-f0-9]+$/.test(match[1]) && match[1].length > 10) {
            return match[1];
          }
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  private async getTransportsWithConfig(
    configUri: string,
    filters: TransportFilters
  ): Promise<TransportList> {
    // Build query parameters like real ADT
    const params = new URLSearchParams();
    params.append('targets', 'true');
    params.append('configUri', configUri);

    if (filters.user) {
      params.append('user', filters.user);
    }

    if (filters.status) {
      params.append('status', filters.status);
    }

    if (filters.maxResults) {
      params.append('max-results', filters.maxResults.toString());
    }

    const endpoint = `/sap/bc/adt/cts/transportrequests?${params.toString()}`;

    if (filters.debug) {
      console.log(`Using ADT protocol endpoint: ${endpoint}`);
    }

    const xmlContent = await this.adtClient.get(endpoint, {
      Accept: 'application/vnd.sap.adt.transportorganizertree.v1+xml',
    });

    return this.parser.parseTransportList(xmlContent, filters.debug);
  }

  private async getTransportsSimple(
    filters: TransportFilters
  ): Promise<TransportList> {
    // Original simple approach as fallback
    const params = new URLSearchParams();

    if (filters.maxResults) {
      params.append('max-results', filters.maxResults.toString());
    }

    const endpoint = `/sap/bc/adt/cts/transportrequests${
      params.toString() ? `?${params.toString()}` : ''
    }`;

    if (filters.debug) {
      console.log(`Using simple fallback endpoint: ${endpoint}`);
    }

    const xmlContent = await this.adtClient.get(endpoint, {
      Accept: 'application/vnd.sap.adt.transportorganizertree.v1+xml',
    });

    return this.parser.parseTransportList(xmlContent, filters.debug);
  }

  async getTransport(
    trNumber: string,
    options: TransportGetOptions = {}
  ): Promise<TransportGetResult> {
    const endpoint = `/sap/bc/adt/cts/transportrequests/${trNumber}`;

    if (options.debug) {
      console.log(`Fetching specific transport: ${endpoint}`);
    }

    try {
      const xmlContent = await this.adtClient.get(endpoint, {
        Accept: 'application/vnd.sap.adt.transportorganizer.v1+xml',
      });

      if (options.debug) {
        console.log(
          `Received ${xmlContent.length} bytes for transport ${trNumber}`
        );
        console.log('First 300 chars:', xmlContent.substring(0, 300));
      }

      // Parse as single transport, not a list
      const transport = this.parser.parseTransportDetail(
        xmlContent,
        trNumber,
        options.debug
      );

      if (!transport) {
        throw new Error(`Transport request ${trNumber} not found`);
      }

      // Check if the requested number is a task
      const isTask = transport.number !== trNumber;
      const requestedTask = isTask
        ? transport.tasks?.find((t) => t.number === trNumber)
        : undefined;

      return {
        transport,
        requestedNumber: trNumber,
        isTask,
        requestedTask,
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch transport request ${trNumber}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
