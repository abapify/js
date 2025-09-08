import { ADTClient } from '../../adt-client';
import { TransportParser } from './parser';
import {
  Transport,
  TransportFilters,
  TransportList,
  TransportGetOptions,
  TransportGetResult,
  TransportCreateOptions,
  TransportCreateResult,
  TransportObject,
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

  async createTransport(
    options: TransportCreateOptions
  ): Promise<TransportCreateResult> {
    const endpoint = '/sap/bc/adt/cts/transportrequests';

    if (options.debug) {
      this.adtClient.setDebugMode(true);
      console.log(`Creating transport request at: ${endpoint}`);
    }

    // Build XML payload based on the ADT trace
    const xmlPayload = await this.buildCreateTransportXml(options);

    if (options.debug) {
      console.log('Create transport XML payload:', xmlPayload);
    }

    try {
      const xmlContent = await this.adtClient.post(
        endpoint,
        xmlPayload,
        {
          'Content-Type': 'text/plain',
          Accept: 'application/vnd.sap.adt.transportorganizer.v1+xml',
          'x-sap-security-session': 'use',
          'sap-cancel-on-close': 'true',
        },
        options.debug
      );

      if (options.debug) {
        console.log(`Received ${xmlContent.length} bytes create response`);
        console.log('Create response:', xmlContent.substring(0, 500));
      }

      // Parse the created transport from the response
      const transport = this.parser.parseTransportDetail(
        xmlContent,
        '',
        options.debug
      );

      if (!transport) {
        throw new Error('Failed to parse created transport response');
      }

      // For create response, the task is typically created automatically
      // If no task in response, create a placeholder task with the transport info
      let task = transport.tasks?.[0];
      if (!task) {
        // Create a placeholder task based on typical SAP transport creation behavior
        task = {
          number: transport.number + '1', // Tasks usually are TR + 1 digit
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
      throw new Error(
        `Failed to create transport request: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async buildCreateTransportXml(
    options: TransportCreateOptions
  ): Promise<string> {
    const type = options.type || 'K'; // Default to Workbench
    const target = options.target || 'LOCAL';
    const project = options.project || '';

    // Get current user ID properly
    const owner = options.owner || (await this.adtClient.getCurrentUser());

    return `<?xml version="1.0" encoding="ASCII"?>
<tm:root xmlns:tm="http://www.sap.com/cts/adt/tm" tm:useraction="newrequest">
  <tm:request tm:desc="${this.escapeXml(
    options.description
  )}" tm:type="${type}" tm:target="${target}" tm:cts_project="${project}">
    <tm:task tm:owner="${owner}"/>
  </tm:request>
</tm:root>`;
  }

  async getTransportObjects(
    trNumber: string,
    options: { debug?: boolean } = {}
  ): Promise<TransportObject[]> {
    const endpoint = `/sap/bc/adt/cts/transportrequests/${trNumber}/objects`;

    if (options.debug) {
      console.log(`Fetching transport objects: ${endpoint}`);
    }

    try {
      const xmlContent = await this.adtClient.get(endpoint, {
        Accept: 'application/vnd.sap.adt.transportorganizer.v1+xml',
      });

      if (options.debug) {
        console.log(
          `Received ${xmlContent.length} bytes for transport objects ${trNumber}`
        );
        console.log('First 300 chars:', xmlContent.substring(0, 300));
      }

      // Parse transport objects from XML
      return this.parser.parseTransportObjects(xmlContent, options.debug);
    } catch (error) {
      if (options.debug) {
        console.log(
          `Transport objects endpoint failed, trying alternative approach...`
        );
      }

      // Fallback: try to extract objects from transport detail
      try {
        const transportDetail = await this.getTransport(trNumber, options);
        return this.extractObjectsFromTransportDetail(
          transportDetail.transport
        );
      } catch (fallbackError) {
        throw new Error(
          `Failed to fetch transport objects ${trNumber}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }
  }

  private extractObjectsFromTransportDetail(
    transport: Transport
  ): TransportObject[] {
    // This is a fallback method that extracts basic object info from transport metadata
    // In a real implementation, this would parse the transport XML structure for object entries
    // For now, return empty array as we need the proper ADT API endpoint
    console.log(
      `⚠️ Using fallback object extraction for transport ${transport.number}`
    );
    return [];
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
