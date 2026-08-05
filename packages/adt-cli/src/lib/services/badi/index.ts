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

function getAttr(
  el: XmlElement | null | undefined,
  ns: string,
  local: string,
): string {
  return el?.getAttributeNS(ns, local) ?? '';
}

function getBoolAttr(
  el: XmlElement | null | undefined,
  ns: string,
  local: string,
): boolean {
  return getAttr(el, ns, local).toLowerCase() === 'true';
}

function getChild(
  parent: XmlElement,
  ns: string,
  local: string,
): XmlElement | null {
  const list = parent.getElementsByTagNameNS(ns, local);
  return (list.item(0) as XmlElement | null) ?? null;
}

function getChildren(
  parent: XmlElement,
  ns: string,
  local: string,
): XmlElement[] {
  const list = parent.getElementsByTagNameNS(ns, local);
  const result: XmlElement[] = [];
  for (let i = 0; i < list.length; i++) {
    const node = list.item(i) as XmlElement | null;
    if (node) result.push(node);
  }
  return result;
}

function rootAttr(root: XmlElement, local: string): string {
  return getAttr(root, NS_ADTCORE, local) || root.getAttribute(local) || '';
}

function parseBadiImplementation(node: XmlElement): BadiImplementation {
  return {
    name: getAttr(node, NS_ENHO, 'name'),
    shortText: getAttr(node, NS_ENHO, 'shortText'),
    active: getBoolAttr(node, NS_ENHO, 'active'),
    default: getBoolAttr(node, NS_ENHO, 'default'),
    example: getBoolAttr(node, NS_ENHO, 'example'),
    implementingClass: getAttr(
      getChild(node, NS_ENHO, 'implementingClass'),
      NS_ADTCORE,
      'name',
    ),
    badiDefinition: getAttr(
      getChild(node, NS_ENHO, 'badiDefinition'),
      NS_ADTCORE,
      'name',
    ),
    enhancementSpot: getAttr(
      getChild(node, NS_ENHO, 'enhancementSpot'),
      NS_ADTCORE,
      'name',
    ),
  };
}

function parseBadiInfo(root: XmlElement): BadiInfo {
  const contentCommon = getChild(root, NS_ENHO, 'contentCommon');

  const info: BadiInfo = {
    name: rootAttr(root, 'name'),
    description: rootAttr(root, 'description'),
    type: rootAttr(root, 'type'),
    package: getAttr(
      getChild(root, NS_ADTCORE, 'packageRef'),
      NS_ADTCORE,
      'name',
    ),
    responsible: rootAttr(root, 'responsible'),
    version: rootAttr(root, 'version'),
    technology: getAttr(contentCommon, NS_ENHO, 'toolType'),
    switchSupported: getBoolAttr(contentCommon, NS_ENHO, 'switchSupported'),
    badiImplementations: getChildren(root, NS_ENHO, 'badiImplementation').map(
      parseBadiImplementation,
    ),
  };

  return info;
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
