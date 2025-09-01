import { XMLParser } from 'fast-xml-parser';

export function fromXML(xml: string): Record<string, unknown> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@',
    parseAttributeValue: true,
    trimValues: true,
    removeNSPrefix: false, // Keep namespace prefixes
    parseTagValue: true,
    processEntities: true,
  });

  // Remove XML declaration if present
  const cleanXml = xml.replace(/^<\?xml[^>]*\?>\s*/, '');

  return parser.parse(cleanXml);
}
