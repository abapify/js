import { BaseObject } from '../base/base-object';
import { ObjectData } from '../base/types';
import { Kind } from '@abapify/adk';
import type { AdtClient } from '@abapify/adt-client';

type Spec<T, K extends Kind = Kind> = {
  kind: K;
  metadata: {
    name: string;
    description?: string;
  };
  spec: T;
};

export class AdkObjectHandler extends BaseObject<ObjectData> {
  constructor(
    private parseXmlToSpec: (xml: string) => Spec<any, Kind>,
    private uriFactory: (name: string) => string,
    private adtClient: AdtClient
  ) {
    super();
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

  override async create(
    objectData: ObjectData,
    transportRequest?: string
  ): Promise<void> {
    const spec = this.objectDataToSpec(objectData);
    const xml = this.generateAdtXml(spec);
    const uri = this.uriFactory(objectData.name);
    const contentType = this.getContentTypeForObjectType(
      objectData.metadata?.type || 'UNKNOWN'
    );

    console.log('🔍 Generated XML:', xml);
    console.log('🔍 URI:', uri);
    console.log('🔍 Content-Type:', contentType);

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      Accept: 'application/xml',
    };

    if (transportRequest) {
      headers['sap-adt-corrnr'] = transportRequest;
    }

    try {
      // Try to create the object using the request method
      await this.adtClient.request(uri, {
        method: 'POST',
        body: xml,
        headers,
      });
      console.log('✅ Successfully created object:', objectData.name);
    } catch (error) {
      // If creation fails, check if object exists and try to update
      if (error instanceof Error && error.message.includes('403')) {
        console.log('🔄 Creation failed, checking if object exists...');
        try {
          // Try to get the object to see if it exists
          await this.adtClient.request(uri, { method: 'GET' });
          console.log('📝 Object exists, attempting update...');
          // Object exists, try to update it
          await this.adtClient.request(uri, {
            method: 'PUT',
            body: xml,
            headers,
          });
          console.log('✅ Successfully updated object:', objectData.name);
        } catch (getError) {
          console.log('❌ Object does not exist, rethrowing original error');
          throw error; // Rethrow original creation error
        }
      } else {
        throw error;
      }
    }
  }

  override async update(
    objectData: ObjectData,
    transportRequest?: string
  ): Promise<void> {
    const spec = this.objectDataToSpec(objectData);
    const xml = this.generateAdtXml(spec);

    const uri = this.uriFactory(objectData.name);
    const contentType = this.getContentTypeForObjectType(
      objectData.metadata?.type || 'UNKNOWN'
    );
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      Accept: 'application/xml',
    };

    if (transportRequest) {
      headers['sap-adt-corrnr'] = transportRequest;
    }

    await this.adtClient.request(uri, {
      method: 'PUT',
      body: xml,
      headers,
    });
  }

  private objectDataToSpec(objectData: ObjectData): Spec<any, Kind> {
    // Convert ObjectData back to ADK Spec format
    const kind = this.getKindFromAdtType(
      objectData.metadata?.type || 'UNKNOWN'
    );

    return {
      kind,
      metadata: {
        name: objectData.name,
        description: objectData.description,
      },
      spec: {
        // This would need to be populated based on the object type
        // For now, we'll use a basic structure
        source: objectData.source || '',
      },
      package: objectData.package,
    } as Spec<any, Kind>;
  }

  private generateAdtXml(spec: Spec<any, Kind>): string {
    // Generate proper SAP ADT XML format
    try {
      switch (spec.kind) {
        case Kind.Interface:
          return this.generateInterfaceXml(spec as any);
        case Kind.Class:
          // TODO: Implement ClassAdtAdapter when available
          throw new Error('Class ADT adapter not yet implemented');
        case Kind.Domain:
          // TODO: Implement DomainAdtAdapter when available
          throw new Error('Domain ADT adapter not yet implemented');
        default:
          throw new Error(
            `Unsupported object kind for XML generation: ${spec.kind}`
          );
      }
    } catch (error) {
      throw new Error(
        `Failed to generate ADT XML: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private generateInterfaceXml(spec: any): string {
    const name = spec.metadata?.name || 'UNNAMED';
    const description = spec.metadata?.description || '';
    const packageName = spec.package || 'ZPETSTORE';

    return `<?xml version="1.0" encoding="UTF-8"?>
<intf:abapInterface xmlns:intf="http://www.sap.com/adt/oo/interfaces" xmlns:adtcore="http://www.sap.com/adt/core" adtcore:type="INTF/OI" adtcore:description="${description}" adtcore:name="${name}">
  <adtcore:packageRef adtcore:name="${packageName}"/>
</intf:abapInterface>`;
  }

  private getKindFromAdtType(adtType: string): Kind {
    switch (adtType) {
      case 'CLAS':
        return Kind.Class;
      case 'INTF':
        return Kind.Interface;
      case 'DOMA':
        return Kind.Domain;
      default:
        throw new Error(`Unknown ADT type: ${adtType}`);
    }
  }

  private getContentTypeForObjectType(objectType: string): string {
    switch (objectType) {
      case 'CLAS':
        return 'application/vnd.sap.adt.oo.classes.v1+xml';
      case 'INTF':
        return 'application/vnd.sap.adt.oo.interfaces.v1+xml';
      case 'DOMA':
        return 'application/vnd.sap.adt.ddic.domains.v1+xml';
      default:
        return 'application/xml';
    }
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
        this.displayStructureElement(child, childIndent, name);
      });
    }
  }
}
