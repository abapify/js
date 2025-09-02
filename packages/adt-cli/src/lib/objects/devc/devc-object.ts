import { BaseObject } from '../base/base-object';
import { PackageData } from './types';

export class DevcObject extends BaseObject<PackageData> {
  async read(name: string): Promise<PackageData> {
    // Reading is silent - only show in debug mode if needed

    try {
      // Packages use: /sap/bc/adt/packages/{name}
      const sourceUri = `/sap/bc/adt/packages/${name}`;
      const xmlData = await this.fetchFromAdt(
        sourceUri,
        'application/vnd.sap.adt.packages.v2+xml'
      );

      return {
        name,
        description: `Package ${name}`, // Will be populated from search result
        source: xmlData.trim(), // For packages, we store the XML metadata
        package: '', // Packages belong to themselves, will be populated from search result
        metadata: {
          type: 'DEVC',
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to read package ${name}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  override async getAdtXml(name: string): Promise<string> {
    try {
      // Fetch ADT XML from package URI
      const packageUri = `/sap/bc/adt/packages/${name}`;
      const adtXml = await this.fetchFromAdt(
        packageUri,
        'application/vnd.sap.adt.packages.v2+xml'
      );

      return adtXml;
    } catch (error) {
      throw new Error(
        `Failed to fetch ADT XML for package ${name}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
