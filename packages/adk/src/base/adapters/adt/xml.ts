import { XMLBuilder } from 'fast-xml-parser';

export function toXML(payload: unknown): string {
  const builder = new XMLBuilder({ ignoreAttributes: false, format: true });
  const xml = builder.build(payload);
  return xml;
}
