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

  override async getAdtXml(name: string, uri?: string): Promise<string> {
    try {
      // Simply get the source code and wrap it in XML - this is what works
      const sourceUri = `/sap/bc/adt/oo/classes/${name.toLowerCase()}/source/main`;
      const sourceText = await this.fetchFromAdt(sourceUri, 'text/plain');

      return `<?xml version="1.0" encoding="UTF-8"?>
<class name="${name}">
  <source><![CDATA[${sourceText}]]></source>
</class>`;
    } catch (error) {
      throw new Error(
        `Failed to fetch ADT XML for class ${name}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
