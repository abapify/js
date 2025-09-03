import { ADTClient } from '../../adt-client';
import { BaseObject } from '../base/base-object';
import { ObjectData } from '../base/types';
import { Spec, Kind } from '@abapify/adk';

export class AdkObjectHandler extends BaseObject<ObjectData> {
  constructor(
    adtClient: ADTClient,
    private parseXmlToSpec: (xml: string) => Spec<any, Kind>,
    private uriFactory: (name: string) => string
  ) {
    super(adtClient);
  }

  override async read(name: string): Promise<ObjectData> {
    const xml = await this.getAdtXml(name);
    const spec = this.parseXmlToSpec(xml);

    return this.specToObjectData(spec);
  }

  override async getAdtXml(name: string): Promise<string> {
    const uri = this.uriFactory(name);
    return this.fetchFromAdt(uri, 'application/xml');
  }

  override async getStructure(name: string): Promise<void> {
    try {
      const structureUri = `${this.uriFactory(
        name
      )}/objectstructure?version=active&withShortDescriptions=true`;
      const structureXml = await this.fetchFromAdt(
        structureUri,
        'application/xml'
      );

      const parser = new (await import('fast-xml-parser')).XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
      });
      const structureJson = parser.parse(structureXml);

      const rootElement = structureJson['abapsource:objectStructureElement'];
      if (rootElement) {
        console.log(
          `\t🏭 Object: ${rootElement['adtcore:name'] || name} (${
            rootElement.visibility || 'PUBLIC'
          })`
        );

        const elements = rootElement['abapsource:objectStructureElement'];
        if (elements) {
          const elementArray = Array.isArray(elements) ? elements : [elements];

          const methods = elementArray.filter(
            (el) => el['adtcore:type'] === 'CLAS/OM'
          );
          const interfaces = elementArray.filter(
            (el) => el['adtcore:type'] === 'CLAS/OR'
          );

          if (interfaces.length > 0) {
            console.log(`\n\t🔌 Interfaces (${interfaces.length}):`);
            interfaces.forEach((iface) => {
              console.log(`\t   ${iface['adtcore:name']}`);
            });
          }

          if (methods.length > 0) {
            console.log(`\n\t📋 Methods (${methods.length}):`);
            methods.slice(0, 10).forEach((method) => {
              console.log(
                `\t   ${method['adtcore:name']} (${
                  method.visibility || 'PUBLIC'
                })`
              );
            });
            if (methods.length > 10) {
              console.log(`\t   ... and ${methods.length - 10} more`);
            }
          }
        }
      }
    } catch (error) {
      throw new Error(
        `Failed to fetch structure: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private specToObjectData(spec: Spec<any, Kind>): ObjectData {
    return {
      name: spec.metadata.name,
      description: spec.metadata.description || '',
      source: (spec.spec as any).source || '',
      package: (spec as any).package || '$TMP',
      metadata: {
        type: this.getAdtTypeFromKind(spec.kind),
        kind: spec.kind,
      },
    };
  }

  private getAdtTypeFromKind(kind: Kind): string {
    switch (kind) {
      case Kind.Class:
        return 'CLAS';
      case Kind.Interface:
        return 'INTF';
      case Kind.Domain:
        return 'DOMA';
      default:
        return 'UNKNOWN';
    }
  }
}
