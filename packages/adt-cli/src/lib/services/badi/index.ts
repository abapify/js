/**
 * BAdI / Enhancement Implementation metadata service.
 *
 * Reads ENHO metadata from `/sap/bc/adt/enhancements/enhoxhb/{name}`
 * (the ADT endpoint that exposes BAdI implementation details) and
 * returns a structured, UI-agnostic result. Used by both the CLI and MCP.
 *
 * Based on the ARC-1 / sapcli ENHO payload shape:
 *   - root element `enho:objectData`
 *   - `enho:contentCommon` for the tool type / switch flag
 *   - `enho:contentSpecific/enho:badiTechnology/enho:badiImplementations`
 */
import type { AdtClient } from '@abapify/adt-client';
import { DOMParser } from '@xmldom/xmldom';

const NS_ENHO = 'http://www.sap.com/adt/enhancements/enho';
const NS_ADTCORE = 'http://www.sap.com/adt/core';

type XmlElement = import('@xmldom/xmldom').Element;

export interface BadiImplementation {
  name: string;
  shortText: string;
  active: boolean;
  default: boolean;
  example: boolean;
  implementingClass: string;
  badiDefinition: string;
  enhancementSpot: string;
}

export interface BadiInfo {
  name: string;
  description: string;
  type: string;
  package: string;
  responsible: string;
  version: string;
  technology: string;
  switchSupported: boolean;
  badiImplementations: BadiImplementation[];
}

interface NamespaceAccessor {
  attr(el: XmlElement | null | undefined, local: string): string;
  bool(el: XmlElement | null | undefined, local: string): boolean;
  child(parent: XmlElement, local: string): XmlElement | null;
  children(parent: XmlElement, local: string): XmlElement[];
}

function namespaceAccessor(ns: string): NamespaceAccessor {
  return {
    attr(el, local) {
      return el?.getAttributeNS(ns, local) ?? '';
    },
    bool(el, local) {
      return this.attr(el, local).toLowerCase() === 'true';
    },
    child(parent, local) {
      const list = parent.getElementsByTagNameNS(ns, local);
      return (list.item(0) as XmlElement | null) ?? null;
    },
    children(parent, local) {
      const list = parent.getElementsByTagNameNS(ns, local);
      const result: XmlElement[] = [];
      for (let i = 0; i < list.length; i++) {
        const node = list.item(i) as XmlElement | null;
        if (node) result.push(node);
      }
      return result;
    },
  };
}

const enho = namespaceAccessor(NS_ENHO);
const adtcore = namespaceAccessor(NS_ADTCORE);

function rootAttr(root: XmlElement, local: string): string {
  return adtcore.attr(root, local) || root.getAttribute(local) || '';
}

function parseBadiImplementation(node: XmlElement): BadiImplementation {
  return {
    name: enho.attr(node, 'name'),
    shortText: enho.attr(node, 'shortText'),
    active: enho.bool(node, 'active'),
    default: enho.bool(node, 'default'),
    example: enho.bool(node, 'example'),
    implementingClass: adtcore.attr(
      enho.child(node, 'implementingClass'),
      'name',
    ),
    badiDefinition: adtcore.attr(enho.child(node, 'badiDefinition'), 'name'),
    enhancementSpot: adtcore.attr(enho.child(node, 'enhancementSpot'), 'name'),
  };
}

function parseBadiInfo(root: XmlElement): BadiInfo {
  const contentCommon = enho.child(root, 'contentCommon');

  return {
    name: rootAttr(root, 'name'),
    description: rootAttr(root, 'description'),
    type: rootAttr(root, 'type'),
    package: adtcore.attr(adtcore.child(root, 'packageRef'), 'name'),
    responsible: rootAttr(root, 'responsible'),
    version: rootAttr(root, 'version'),
    technology: enho.attr(contentCommon, 'toolType'),
    switchSupported: enho.bool(contentCommon, 'switchSupported'),
    badiImplementations: enho
      .children(root, 'badiImplementation')
      .map(parseBadiImplementation),
  };
}

/**
 * Parse an `enho:objectData` XML document into a `BadiInfo` structure.
 */
export function parseEnhancementImplementation(xml: string): BadiInfo {
  const doc = new DOMParser({
    onError: () => {
      /* swallow parse warnings; caller handles malformed XML via errors */
    },
  }).parseFromString(xml, 'text/xml');

  const root = doc.documentElement;
  if (!root) {
    throw new Error('Empty or malformed ENHO XML response');
  }

  return parseBadiInfo(root as XmlElement);
}

/**
 * Fetch ENHO metadata for a BAdI / enhancement implementation and parse
 * the BAdI implementation list.
 */
export async function getBadiInfo(
  client: AdtClient,
  name: string,
): Promise<BadiInfo> {
  const response = await client.fetch(
    `/sap/bc/adt/enhancements/enhoxhb/${encodeURIComponent(name.toLowerCase())}`,
    {
      headers: { Accept: 'application/vnd.sap.adt.enh.enhoxhb.v4+xml' },
    },
  );

  if (typeof response !== 'string') {
    throw new Error('Unexpected non-XML response from ENHO endpoint');
  }

  return parseEnhancementImplementation(response);
}
