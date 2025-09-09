import { XMLParser, XMLBuilder } from 'fast-xml-parser';

export class XmlParser {
  private static parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    parseAttributeValue: false,
    parseTagValue: false,
    trimValues: true,
  });

  private static builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    format: true,
    indentBy: '  ',
  });

  /**
   * Parse XML string to JavaScript object
   */
  static parse<T = any>(xmlString: string): T {
    try {
      return this.parser.parse(xmlString);
    } catch (error) {
      throw new Error(
        `Failed to parse XML: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Convert JavaScript object to XML string
   */
  static stringify(obj: any): string {
    try {
      return this.builder.build(obj);
    } catch (error) {
      throw new Error(
        `Failed to stringify to XML: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Extract text content from XML element
   */
  static extractText(element: any): string {
    if (typeof element === 'string') {
      return element;
    }
    if (element && typeof element === 'object' && element['#text']) {
      return element['#text'];
    }
    return '';
  }

  /**
   * Extract attribute value from XML element
   */
  static extractAttribute(
    element: any,
    attributeName: string
  ): string | undefined {
    if (element && typeof element === 'object') {
      return element[`@_${attributeName}`];
    }
    return undefined;
  }

  /**
   * Parse ADT object metadata from XML response
   */
  static parseObjectMetadata(xmlString: string): any {
    const parsed = this.parse(xmlString);

    // Handle different XML structures that ADT might return
    if (parsed['abapgit:abapGitObject']) {
      return parsed['abapgit:abapGitObject'];
    }
    if (parsed['adtcore:objectReference']) {
      return parsed['adtcore:objectReference'];
    }
    if (parsed['class:abapClass']) {
      return parsed['class:abapClass'];
    }
    if (parsed['intf:abapInterface']) {
      return parsed['intf:abapInterface'];
    }

    return parsed;
  }

  /**
   * Parse search results from ADT XML response
   */
  static parseSearchResults(xmlString: string): any[] {
    const parsed = this.parse(xmlString);

    if (parsed['adtcore:objectReferences']?.['adtcore:objectReference']) {
      const refs =
        parsed['adtcore:objectReferences']['adtcore:objectReference'];
      return Array.isArray(refs) ? refs : [refs];
    }

    return [];
  }

  /**
   * Parse transport objects from ADT XML response
   */
  static parseTransportObjects(xmlString: string): any[] {
    const parsed = this.parse(xmlString);

    if (parsed['cts:transport']?.['cts:objects']?.['cts:object']) {
      const objects = parsed['cts:transport']['cts:objects']['cts:object'];
      return Array.isArray(objects) ? objects : [objects];
    }

    return [];
  }

  /**
   * Parse transport detail from creation response
   */
  static parseTransportDetail(xmlString: string): any {
    const parsed = this.parse(xmlString);

    if (parsed['cts:transport']) {
      return {
        transportNumber: this.extractAttribute(
          parsed['cts:transport'],
          'number'
        ),
        description: this.extractAttribute(
          parsed['cts:transport'],
          'description'
        ),
        owner: this.extractAttribute(parsed['cts:transport'], 'owner'),
        status: this.extractAttribute(parsed['cts:transport'], 'status'),
        type: this.extractAttribute(parsed['cts:transport'], 'type'),
      };
    }

    return null;
  }

  /**
   * Parse transport list from ADT XML response
   */
  static parseTransportList(xmlString: string): any[] {
    const parsed = this.parse(xmlString);

    if (parsed['tm:root']?.['tm:transports']?.['tm:transport']) {
      const transports = parsed['tm:root']['tm:transports']['tm:transport'];
      return Array.isArray(transports) ? transports : [transports];
    }

    return [];
  }
}
