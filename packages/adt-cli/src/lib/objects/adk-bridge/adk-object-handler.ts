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
        this.displayStructureElement(rootElement, '', name);
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

  private displayStructureElement(
    element: any,
    indent: string,
    name?: string
  ): void {
    const elementName = element['adtcore:name'] || name;
    const elementType = element['adtcore:type'];
    const visibility = element.visibility || 'public';
    const level = element.level;
    const description = element['adtcore:description'] || element.description;

    // Format the display based on element type and visibility
    let icon = '📁';
    let typeInfo = '';

    const isMethod =
      elementType?.includes('/OM') || elementType?.includes('/IO'); // class or interface methods
    const isAttribute = elementType?.includes('/OA'); // class attributes

    if (isMethod || isAttribute) {
      // For methods/attributes: colored shape = visibility + level
      if (level === 'static') {
        if (visibility === 'public')
          icon = '🟩'; // green square = public static
        else if (visibility === 'private')
          icon = '🟥'; // red square = private static
        else if (visibility === 'protected') icon = '🟨'; // yellow square = protected static
        typeInfo = `${visibility} static ${isMethod ? 'method' : 'attribute'}`;
      } else {
        // instance
        if (visibility === 'public')
          icon = '🟢'; // green circle = public instance
        else if (visibility === 'private')
          icon = '🔴'; // red circle = private instance
        else if (visibility === 'protected') icon = '🟡'; // yellow circle = protected instance
        typeInfo = `${visibility} ${isMethod ? 'method' : 'attribute'}`;
      }
    } else {
      // For other structural elements
      if (elementType === 'CLAS/OR') {
        icon = 'ℹ️'; // interface reference
        typeInfo = 'interface';
      } else if (elementType === 'CLAS/OC') {
        icon = '🏛️'; // class
        typeInfo = 'class';
      } else if (elementType === 'CLAS/OCX') {
        // Skip class implementation section - it's internal
        return;
      } else if (elementType?.includes('CLAS')) {
        icon = '🏛️'; // other class types
        typeInfo = 'class';
      } else if (elementType?.includes('INTF')) {
        icon = 'ℹ️'; // interface
        typeInfo = 'interface';
      }
    }

    // Build display string
    let displayStr = `${indent}${icon}  ${elementName}`;

    // Use description if available, otherwise fall back to typeInfo
    if (description) {
      displayStr += ` [${description}]`;
    } else if (typeInfo) {
      displayStr += ` [${typeInfo}]`;
    }
    // displayStr += ` {${elementType}}`; // temporary debug

    console.log(`\t${displayStr}`);

    // Recursively display children
    const children = element['abapsource:objectStructureElement'];
    if (children) {
      const childArray = Array.isArray(children) ? children : [children];
      childArray.forEach((child: any, index: number) => {
        const isLast = index === childArray.length - 1;
        const childIndent = indent + (isLast ? '└─ ' : '├─ ');
        const nextIndent = indent + (isLast ? '   ' : '│  ');
        this.displayStructureElement(child, childIndent, name);
      });
    }
  }
}
