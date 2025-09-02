import { BaseObject } from '../base/base-object';
import { InterfaceData } from './types';

export class IntfObject extends BaseObject<InterfaceData> {
  async read(name: string): Promise<InterfaceData> {
    // Reading is silent - only show in debug mode if needed

    try {
      // Interfaces use: /sap/bc/adt/oo/interfaces/{name}/source/main
      const sourceUri = `/sap/bc/adt/oo/interfaces/${name.toLowerCase()}/source/main`;
      const source = await this.fetchFromAdt(sourceUri);

      return {
        name,
        description: `Interface ${name}`, // Will be populated from search result
        source: source.trim(),
        package: '', // Will be populated from search result
        metadata: {
          type: 'INTF',
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to read interface ${name}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  override async getAdtXml(name: string, uri?: string): Promise<string> {
    try {
      // Simply get the source code and wrap it in XML
      const sourceUri = `/sap/bc/adt/oo/interfaces/${name.toLowerCase()}/source/main`;
      const sourceText = await this.fetchFromAdt(sourceUri, 'text/plain');

      return `<?xml version="1.0" encoding="UTF-8"?>
<interface name="${name}">
  <source><![CDATA[${sourceText}]]></source>
</interface>`;
    } catch (error) {
      throw new Error(
        `Failed to fetch ADT XML for interface ${name}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
