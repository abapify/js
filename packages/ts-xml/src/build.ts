import { DOMImplementation, XMLSerializer, Document, Element } from "@xmldom/xmldom";
import type { ElementSchema, InferSchema } from "./types";
import { toString } from "./utils";

export interface BuildOptions {
  /** Include XML declaration (default: true) */
  xmlDecl?: boolean;
  /** XML declaration encoding (default: "utf-8") */
  encoding?: string;
}

/**
 * Build XML string from JSON data using schema
 */
export function build<S extends ElementSchema>(
  schema: S,
  data: InferSchema<S>,
  opts?: BuildOptions
): string {
  const doc = new DOMImplementation().createDocument(null as any, null as any, null as any);
  const root = buildBySchema(schema, data as any, doc);
  doc.appendChild(root);

  const xml = new XMLSerializer().serializeToString(doc);

  const encoding = opts?.encoding ?? "utf-8";
  const xmlDecl = opts?.xmlDecl ?? true;

  return xmlDecl ? `<?xml version="1.0" encoding="${encoding}"?>\n${xml}` : xml;
}

/**
 * Build a DOM element from schema and JSON data
 */
function buildBySchema(schema: ElementSchema, json: any, doc: Document): Element {
  const el = doc.createElement(schema.tag);

  // Add namespace declarations
  if (schema.ns) {
    for (const [prefix, uri] of Object.entries(schema.ns)) {
      el.setAttribute(`xmlns:${prefix}`, uri);
    }
  }

  // Process fields
  for (const [key, field] of Object.entries(schema.fields)) {
    const val = json[key];
    if (val == null) continue;

    if (field.kind === "attr") {
      el.setAttribute(field.name, toString(field.type, val));
    } else if (field.kind === "text") {
      el.textContent = toString(field.type, val);
    } else if (field.kind === "elem") {
      const child = buildBySchema(field.schema, val, doc);
      el.appendChild(child);
    } else if (field.kind === "elems") {
      for (const item of val) {
        const child = buildBySchema(field.schema, item, doc);
        el.appendChild(child);
      }
    }
  }

  return el;
}
