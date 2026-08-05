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

  const attr = (
    el:
      | {
          getAttributeNS(
            namespace: string | null,
            localName: string,
          ): string | null;
        }
      | null
      | undefined,
    ns: string,
    local: string,
  ): string => el?.getAttributeNS(ns, local) ?? '';

  const boolAttr = (
    el:
      | {
          getAttributeNS(
            namespace: string | null,
            localName: string,
          ): string | null;
        }
      | null
      | undefined,
    ns: string,
    local: string,
  ): boolean => attr(el, ns, local).toLowerCase() === 'true';

  const packageRef = root
    .getElementsByTagNameNS(NS_ADTCORE, 'packageRef')
    .item(0);

  const contentCommon = root
    .getElementsByTagNameNS(NS_ENHO, 'contentCommon')
    .item(0);

  const info: BadiInfo = {
    name: attr(root, NS_ADTCORE, 'name') || root.getAttribute('name') || '',
    description:
      attr(root, NS_ADTCORE, 'description') ||
      root.getAttribute('description') ||
      '',
    type: attr(root, NS_ADTCORE, 'type') || root.getAttribute('type') || '',
    package: attr(packageRef, NS_ADTCORE, 'name'),
    responsible:
      attr(root, NS_ADTCORE, 'responsible') ||
      root.getAttribute('responsible') ||
      '',
    version:
      attr(root, NS_ADTCORE, 'version') || root.getAttribute('version') || '',
    technology: attr(contentCommon, NS_ENHO, 'toolType'),
    switchSupported: boolAttr(contentCommon, NS_ENHO, 'switchSupported'),
    badiImplementations: [],
  };

  const implementations: BadiImplementation[] = [];
  const impls = root.getElementsByTagNameNS(NS_ENHO, 'badiImplementation');
  for (let i = 0; i < impls.length; i++) {
    const node = impls.item(i);
    if (!node) continue;

    const implementingClass = node
      .getElementsByTagNameNS(NS_ENHO, 'implementingClass')
      .item(0);
    const badiDefinition = node
      .getElementsByTagNameNS(NS_ENHO, 'badiDefinition')
      .item(0);
    const enhancementSpot = node
      .getElementsByTagNameNS(NS_ENHO, 'enhancementSpot')
      .item(0);

    implementations.push({
      name: attr(node, NS_ENHO, 'name'),
      shortText: attr(node, NS_ENHO, 'shortText'),
      active: boolAttr(node, NS_ENHO, 'active'),
      default: boolAttr(node, NS_ENHO, 'default'),
      example: boolAttr(node, NS_ENHO, 'example'),
      implementingClass: attr(implementingClass, NS_ADTCORE, 'name'),
      badiDefinition: attr(badiDefinition, NS_ADTCORE, 'name'),
      enhancementSpot: attr(enhancementSpot, NS_ADTCORE, 'name'),
    });
  }
  info.badiImplementations = implementations;

  return info;
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
