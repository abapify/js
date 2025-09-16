import { Kind, Spec } from '@abapify/adk';

interface AbapGitObject {
  type: string;
  name: string;
  xmlData: string;
  sourceCode?: string;
  metadata: any;
}

export class ADKObjectLoader {
  constructor(private client: any) {}

  async convertToAdkSpec(object: AbapGitObject): Promise<Spec<any>> {
    switch (object.type.toLowerCase()) {
      case 'intf':
        return this.convertInterface(object);
      case 'clas':
        return this.convertClass(object);
      case 'doma':
        return this.convertDomain(object);
      default:
        throw new Error(`Unsupported object type: ${object.type}`);
    }
  }

  private async convertInterface(
    object: AbapGitObject
  ): Promise<Spec<any, Kind.Interface>> {
    // Parse XML metadata to extract interface properties
    const { XMLParser } = await import('fast-xml-parser');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
    });

    const parsed = parser.parse(object.xmlData);
    const vseoInterf = parsed.abapGit['asx:abap']['asx:values'].VSEOINTERF;

    return {
      kind: Kind.Interface,
      metadata: {
        name: object.name,
        description: vseoInterf.DESCRIPT || object.name,
      },
      spec: {
        name: vseoInterf.CLSNAME,
        description: vseoInterf.DESCRIPT,
        language: vseoInterf.LANGU || 'E',
        exposure: vseoInterf.EXPOSURE,
        sourceCode: object.sourceCode || '',
        methods: this.parseInterfaceMethods(object.sourceCode || ''),
        types: this.parseInterfaceTypes(object.sourceCode || ''),
      },
    };
  }

  private async convertClass(
    object: AbapGitObject
  ): Promise<Spec<any, Kind.Class>> {
    const { XMLParser } = await import('fast-xml-parser');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
    });

    const parsed = parser.parse(object.xmlData);
    const vseoClass = parsed.abapGit['asx:abap']['asx:values'].VSEOCLASS;

    return {
      kind: Kind.Class,
      metadata: {
        name: object.name,
        description: vseoClass.DESCRIPT || object.name,
      },
      spec: {
        name: vseoClass.CLSNAME,
        description: vseoClass.DESCRIPT,
        language: vseoClass.LANGU || 'E',
        final: vseoClass.CLSFINAL === 'X',
        abstract: vseoClass.CLSABSTRCT === 'X',
        sourceCode: object.sourceCode || '',
        interfaces: this.parseClassInterfaces(object.sourceCode || ''),
        methods: this.parseClassMethods(object.sourceCode || ''),
        attributes: this.parseClassAttributes(object.sourceCode || ''),
      },
    };
  }

  private async convertDomain(
    object: AbapGitObject
  ): Promise<Spec<any, Kind.Domain>> {
    const { XMLParser } = await import('fast-xml-parser');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
    });

    const parsed = parser.parse(object.xmlData);
    const dd01v = parsed.abapGit['asx:abap']['asx:values'].DD01V;

    return {
      kind: Kind.Domain,
      metadata: {
        name: object.name,
        description: dd01v.DDTEXT || object.name,
      },
      spec: {
        name: dd01v.DOMNAME,
        description: dd01v.DDTEXT,
        dataType: dd01v.DATATYPE,
        length: dd01v.LENG,
        decimals: dd01v.DECIMALS,
        outputLength: dd01v.OUTPUTLEN,
        conversionExit: dd01v.CONVEXIT,
        domainValues: this.parseDomainValues(parsed),
      },
    };
  }

  private parseInterfaceMethods(sourceCode: string): any[] {
    const methods: any[] = [];
    const methodPattern = /methods?\s+(\w+)/gi;
    let match;

    while ((match = methodPattern.exec(sourceCode)) !== null) {
      methods.push({
        name: match[1].toLowerCase(),
        visibility: 'public', // Default for interface methods
        parameters: [], // Would need more sophisticated parsing
        returnType: null,
      });
    }

    return methods;
  }

  private parseInterfaceTypes(sourceCode: string): any[] {
    const types: any[] = [];
    const typePattern = /types?\s*:?\s+(\w+)/gi;
    let match;

    while ((match = typePattern.exec(sourceCode)) !== null) {
      types.push({
        name: match[1].toLowerCase(),
        definition: 'string', // Simplified - would need better parsing
      });
    }

    return types;
  }

  private parseClassInterfaces(sourceCode: string): string[] {
    const interfaces: string[] = [];
    const interfacePattern = /interfaces?\s+(\w+)/gi;
    let match;

    while ((match = interfacePattern.exec(sourceCode)) !== null) {
      interfaces.push(match[1]);
    }

    return interfaces;
  }

  private parseClassMethods(sourceCode: string): any[] {
    // Similar to interface methods but with visibility parsing
    return this.parseInterfaceMethods(sourceCode);
  }

  private parseClassAttributes(sourceCode: string): any[] {
    const attributes: any[] = [];
    const attrPattern = /data\s*:?\s+(\w+)/gi;
    let match;

    while ((match = attrPattern.exec(sourceCode)) !== null) {
      attributes.push({
        name: match[1].toLowerCase(),
        type: 'string', // Simplified
        visibility: 'private', // Default
      });
    }

    return attributes;
  }

  private parseDomainValues(parsed: any): any[] {
    const values: any[] = [];

    try {
      const dd07v = parsed.abapGit['asx:abap']['asx:values'].DD07V;
      if (dd07v && Array.isArray(dd07v)) {
        for (const value of dd07v) {
          values.push({
            low: value.DOMVALUE_L,
            high: value.DOMVALUE_H,
            description: value.DDTEXT,
          });
        }
      }
    } catch (error) {
      // No domain values defined
    }

    return values;
  }
}
