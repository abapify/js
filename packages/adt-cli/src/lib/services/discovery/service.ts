import { ADTClient } from '../../adt-client';
import { parseDiscoveryXml } from './parser';
import { ADTDiscoveryService } from './types';

export class DiscoveryService {
  constructor(private adtClient: ADTClient) {}

  async getDiscovery(): Promise<ADTDiscoveryService> {
    const endpoint = '/sap/bc/adt/discovery';

    console.log(`🔍 Discovering ADT services from: ${endpoint}`);

    try {
      const xmlContent = await this.adtClient.get(endpoint, {
        Accept: 'application/atomsvc+xml',
      });

      console.log(
        `📄 Received ${xmlContent.length} bytes of ADT discovery XML`
      );
      console.log('✅ ADT discovery successful!');

      return parseDiscoveryXml(xmlContent);
    } catch (error) {
      throw new Error(
        `Discovery failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
