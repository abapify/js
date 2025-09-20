/**
 * SAP XML Plugin - Real XML generation for SAP ADT using fast-xml-parser
 * Now uses zero-dependency xmld transformation
 */

import { XMLBuilder } from 'fast-xml-parser';
import { toFastXMLObject } from 'xmld';
import type { SerializationPlugin, SerializationData } from 'xmld';

export class SAPXMLPlugin implements SerializationPlugin {
  private builder: XMLBuilder;

  constructor(options: any = {}) {
    this.builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      format: true,
      indentBy: '  ',
      xmlDeclaration: true,
      ...options,
    });
  }

  serialize(data: SerializationData): string {
    // Use zero-dependency xmld transformation
    const xmlObject = toFastXMLObject(data);

    // Debug: log the structure to understand what we're getting
    console.log('SerializationData:', JSON.stringify(data, null, 2));
    console.log('Converted XML Object:', JSON.stringify(xmlObject, null, 2));

    // Use real fast-xml-parser to generate XML
    const xml = this.builder.build(xmlObject);

    // Manually add XML declaration if not present (fast-xml-parser issue)
    if (!xml.startsWith('<?xml')) {
      return '<?xml version="1.0" encoding="UTF-8"?>\n' + xml;
    }

    return xml;
  }
}
