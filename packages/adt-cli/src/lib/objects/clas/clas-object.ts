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

  override async getStructure(name: string): Promise<void> {
    try {
      const structureUri = `/sap/bc/adt/oo/classes/${name.toLowerCase()}/objectstructure?version=active&withShortDescriptions=true`;
      const structureXml = await this.fetchFromAdt(structureUri);

      const parser = new (await import('fast-xml-parser')).XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
      });
      const structureJson = parser.parse(structureXml);

      // Extract meaningful structure information
      const rootElement = structureJson['abapsource:objectStructureElement'];
      if (rootElement) {
        // Main class info
        console.log(
          `\t🏭 Class: ${
            rootElement['adtcore:name'] || rootElement.name || name
          } (${rootElement.visibility || 'PUBLIC'})`
        );
        if (rootElement.final === 'true') {
          console.log(`\t🔒 Final class`);
        }

        // Extract structure elements (interfaces, methods, etc.)
        const elements = rootElement['abapsource:objectStructureElement'];
        if (elements) {
          const elementArray = Array.isArray(elements) ? elements : [elements];

          // Group by type
          const interfaces = elementArray.filter(
            (el) => el['adtcore:type'] === 'CLAS/OR'
          );
          const methods = elementArray.filter(
            (el) => el['adtcore:type'] === 'CLAS/OM'
          );
          const textElements = elementArray.filter(
            (el) => el['adtcore:type'] === 'CLAS/OCX'
          );

          if (interfaces.length > 0) {
            console.log(
              `\n\t🔌 Implemented Interfaces (${interfaces.length}):`
            );
            interfaces.forEach((iface) => {
              console.log(`\t   ${iface['adtcore:name'] || iface.name}`);
            });
          }

          if (methods.length > 0) {
            console.log(`\n\t📋 Methods (${methods.length}):`);
            methods.slice(0, 10).forEach((method) => {
              const vis = method.visibility || 'PUBLIC';
              const level = method.level || 'instance';
              console.log(
                `\t   ${
                  method['adtcore:name'] || method.name
                } (${vis}, ${level})`
              );
            });
            if (methods.length > 10) {
              console.log(`\t   ... and ${methods.length - 10} more`);
            }
          }

          if (textElements.length > 0) {
            console.log(`\n\t📝 Additional Elements (${textElements.length}):`);
            textElements.forEach((elem) => {
              console.log(
                `\t   ${elem['adtcore:name'] || elem.name}${
                  elem.description ? ` - ${elem.description}` : ''
                }`
              );
            });
          }
        }
      }
    } catch (error) {
      throw new Error(
        `Failed to fetch structure for class ${name}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
