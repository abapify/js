import { XMLBuilder } from 'fast-xml-parser';

export function toXML(payload: unknown): string {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
    suppressEmptyNode: true,
    arrayNodeName: 'item',
  });
  const xml = builder.build(payload);
  return `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;
}
