import { BaseObject } from '../base/base-object';
import { ClassData } from './types';

export class ClasObject extends BaseObject<ClassData> {
  async read(name: string): Promise<ClassData> {
    // Reading is silent - only show in debug mode if needed

    try {
      // Classes use: /sap/bc/adt/oo/classes/{name}/source/main
      const sourceUri = `/sap/bc/adt/oo/classes/${name.toLowerCase()}/source/main`;
      const source = await this.fetchFromAdt(sourceUri);

      // TODO: Fetch metadata from main object URI if needed
      // const metadataUri = `/sap/bc/adt/oo/classes/${name.toLowerCase()}`;

      return {
        name,
        description: `Class ${name}`, // Will be populated from search result
        source: source.trim(),
        package: '', // Will be populated from search result
        metadata: {
          type: 'CLAS',
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to read class ${name}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  override async getAdtXml(name: string): Promise<string> {
    try {
      // Try to fetch ADT XML from the source endpoint with XML Accept header
      const sourceUri = `/sap/bc/adt/oo/classes/${name.toLowerCase()}/source/main`;

      // Try with XML Accept header to get ADT XML format
      try {
        const adtXml = await this.fetchFromAdt(sourceUri, 'application/xml');
        return adtXml;
      } catch (error) {
        // If that fails, try the default text/plain to at least get something
        console.log(`⚠️ XML fetch failed, falling back to text format...`);
        const sourceText = await this.fetchFromAdt(sourceUri, 'text/plain');
        // Wrap the source code in a simple XML structure
        return `<?xml version="1.0" encoding="UTF-8"?>
<class name="${name}">
  <source><![CDATA[${sourceText}]]></source>
</class>`;
      }
    } catch (error) {
      throw new Error(
        `Failed to fetch ADT XML for class ${name}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
