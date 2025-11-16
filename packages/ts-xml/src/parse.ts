import { DOMParser, Element } from "@xmldom/xmldom";
import type { ElementSchema, InferSchema } from "./types";
import { fromString } from "./utils";

/**
 * Parse XML string to JSON data using schema
 */
export function parse<S extends ElementSchema>(schema: S, xml: string): InferSchema<S> {
  const dom = new DOMParser().parseFromString(xml, "application/xml");
  return parseBySchema(dom.documentElement as Element, schema) as InferSchema<S>;
}

/**
 * Parse a DOM element using schema
 */
function parseBySchema(node: Element, schema: ElementSchema): any {
  const out: any = {};

  for (const [key, field] of Object.entries(schema.fields)) {
    if (field.kind === "attr") {
      const raw = node.getAttribute(field.name);
      if (raw != null) {
        out[key] = fromString(field.type, raw);
      }
    } else if (field.kind === "text") {
      const raw = node.textContent ?? "";
      out[key] = fromString(field.type, raw);
    } else if (field.kind === "elem") {
      const child = firstChild(node, field.name);
      if (child) {
        out[key] = parseBySchema(child, field.schema);
      }
    } else if (field.kind === "elems") {
      const children = allChildren(node, field.name);
      out[key] = children.map((c) => parseBySchema(c, field.schema));
    }
  }

  return out;
}

/**
 * Find first child element with given QName
 */
function firstChild(node: Element, qname: string): Element | undefined {
  const kids = node.childNodes;
  for (let i = 0; i < kids.length; i++) {
    const k = kids[i];
    if (k.nodeType === 1 && (k as Element).tagName === qname) {
      return k as Element;
    }
  }
  return undefined;
}

/**
 * Find all child elements with given QName
 */
function allChildren(node: Element, qname: string): Element[] {
  const res: Element[] = [];
  const kids = node.childNodes;
  for (let i = 0; i < kids.length; i++) {
    const k = kids[i];
    if (k.nodeType === 1 && (k as Element).tagName === qname) {
      res.push(k as Element);
    }
  }
  return res;
}
