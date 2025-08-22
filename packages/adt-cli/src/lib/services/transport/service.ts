import { ADTClient } from '../../adt-client';
import { TransportParser } from './parser';
import { Transport, TransportFilters, TransportList } from './types';

export class TransportService {
  private parser: TransportParser;

  constructor(private adtClient: ADTClient) {
    this.parser = new TransportParser();
  }

  async listTransports(filters: TransportFilters = {}): Promise<TransportList> {
    // Build query parameters
    const params = new URLSearchParams();

    if (filters.user) {
      params.append('user', filters.user);
    }

    if (filters.status) {
      params.append('status', filters.status);
    }

    if (filters.maxResults) {
      params.append('max-results', filters.maxResults.toString());
    }

    if (filters.skipCount) {
      params.append('skip-count', filters.skipCount.toString());
    }

    const queryString = params.toString();
    const endpoint = `/sap/bc/adt/cts/transportrequests${
      queryString ? `?${queryString}` : ''
    }`;

    console.log(`🚚 Fetching transport requests from: ${endpoint}`);

    try {
      const xmlContent = await this.adtClient.get(endpoint, {
        Accept: 'application/vnd.sap.adt.transportorganizertree.v1+xml',
      });
      console.log(`📄 Received ${xmlContent.length} bytes of transport XML`);

      // For debugging - let's see the structure first
      console.log('First 500 chars of XML:', xmlContent.substring(0, 500));

      return this.parser.parseTransportList(xmlContent);
    } catch (error) {
      console.error('Failed to fetch transport requests:', error);
      throw new Error(
        `Failed to fetch transport requests: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  async getTransport(trNumber: string): Promise<Transport> {
    const endpoint = `/sap/bc/adt/cts/transportrequests/${trNumber}`;

    console.log(`🚚 Fetching transport request: ${trNumber}`);

    try {
      const xmlContent = await this.adtClient.get(endpoint);
      const transportList = this.parser.parseTransportList(xmlContent);

      if (transportList.transports.length === 0) {
        throw new Error(`Transport request ${trNumber} not found`);
      }

      return transportList.transports[0];
    } catch (error) {
      throw new Error(
        `Failed to fetch transport request ${trNumber}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
