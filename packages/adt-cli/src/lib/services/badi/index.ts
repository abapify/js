/**
 * BAdI services — ENHO metadata (enhoxhb) and unified read (classic vit/wb + ENHO).
 *
 * - `getBadiInfo` / `parseEnhancementImplementation` — ENHO/XHB metadata from
 *   `/sap/bc/adt/enhancements/enhoxhb/{name}` (used by `adt badi <name>`).
 * - `BadiService` — auto-detect kind and read classic SXSD/SXCI or ENHO/XHH.
 */
import type { AdtClient } from '@abapify/adt-client';
import type { AdtClientType } from '@abapify/adt-contracts';
import type { BasicObjectPropertiesResponse } from '@abapify/adt-contracts';
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

export type BadiKind = 'definition' | 'implementation' | 'enhancement';

export type BadiMetadata = {
  name: string;
  type: string;
  kind: BadiKind;
  description?: string;
  language?: string;
  version?: string;
  packageName?: string;
  packageUri?: string;
  responsible?: string;
  masterLanguage?: string;
  masterSystem?: string;
};

export type BadiReadResult = BadiMetadata & {
  /** ENHO/XHB metadata when kind is enhancement. */
  enhancement?: BadiInfo;
  source?: string;
  /** Present when `--implementations` is used on a classic definition. */
  implementations?: BadiMetadata[];
};

/** @deprecated Use BadiMetadata */
export type ClassicBadiMetadata = Omit<BadiMetadata, 'kind'>;

const BADI_REPOSITORY_TYPES = new Set([
  'SXSD/XD',
  'SXCI/XI',
  'ENHO/XHH',
  'ENHO/XHB',
]);

function isNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { status?: unknown }).status === 404
  );
}

function badiKindFromType(adtType: string): BadiKind {
  const type = adtType.toUpperCase();
  if (type === 'SXSD/XD') return 'definition';
  if (type === 'SXCI/XI') return 'implementation';
  return 'enhancement';
}

function extractSearchObjects(results: unknown): Array<{
  name?: string;
  type?: string;
}> {
  const record = results as Record<string, unknown>;
  let raw:
    | Array<{ name?: string; type?: string }>
    | { name?: string; type?: string }
    | undefined;

  if (record.objectReferences && typeof record.objectReferences === 'object') {
    const refs = record.objectReferences as {
      objectReference?: typeof raw;
    };
    raw = refs.objectReference;
  } else if (record.objectReference) {
    raw = record.objectReference as typeof raw;
  } else if (record.mainObject && typeof record.mainObject === 'object') {
    const main = record.mainObject as { objectReference?: typeof raw };
    raw = main.objectReference;
  }

  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

export function normalizeClassicBadiMetadata(
  response: BasicObjectPropertiesResponse,
  kind: 'definition' | 'implementation',
): BadiMetadata {
  const main = response.mainObject;
  if (!main) {
    throw new Error('BAdI response missing mainObject');
  }
  return {
    kind,
    name: main.name.toUpperCase(),
    type: main.type,
    description: main.description,
    language: main.language,
    version: main.version,
    packageName: main.packageRef?.name,
    packageUri: main.packageRef?.uri,
    responsible: main.responsible,
    masterLanguage: main.masterLanguage,
    masterSystem: main.masterSystem,
  };
}

function searchQueriesForDefinition(definitionName: string): string[] {
  const normalized = definitionName.trim().toUpperCase();
  const queries = new Set<string>([
    `*${normalized}*`,
    `*${normalized.replace(/_/g, '*')}*`,
  ]);
  const parts = normalized.split('_').filter(Boolean);
  if (parts.length >= 2) {
    const tail2 = parts.slice(-2).join('_');
    if (tail2.length >= 10) {
      queries.add(`*${tail2}*`);
    }
  }
  return [...queries];
}

export class BadiService {
  constructor(private readonly client: AdtClientType) {}

  async resolveKind(name: string): Promise<BadiKind> {
    const normalized = name.trim().toUpperCase();

    const search =
      await this.client.adt.repository.informationsystem.search.quickSearch({
        query: normalized,
        maxResults: 20,
      });
    const matches = extractSearchObjects(search).filter(
      (obj) =>
        obj.name?.toUpperCase() === normalized &&
        obj.type &&
        BADI_REPOSITORY_TYPES.has(obj.type.toUpperCase()),
    );
    if (matches.length === 1) {
      return badiKindFromType(matches[0].type!);
    }
    if (matches.length > 1) {
      throw new Error(
        `Ambiguous BAdI name ${normalized}: ${matches.map((m) => m.type).join(', ')}`,
      );
    }

    const probes: Array<{
      kind: BadiKind;
      expectedType: string;
      run: () => Promise<BasicObjectPropertiesResponse>;
    }> = [
      {
        kind: 'definition',
        expectedType: 'SXSD/XD',
        run: () => this.client.adt.vit.wb.objectProperties.getDefinition(name),
      },
      {
        kind: 'implementation',
        expectedType: 'SXCI/XI',
        run: () =>
          this.client.adt.vit.wb.objectProperties.getImplementation(name),
      },
    ];

    for (const probe of probes) {
      try {
        const response = await probe.run();
        const main = response.mainObject;
        if (
          main?.type?.toUpperCase() === probe.expectedType &&
          main.name?.toUpperCase() === normalized
        ) {
          return probe.kind;
        }
      } catch (error) {
        if (!isNotFound(error)) throw error;
      }
    }

    try {
      await getBadiInfo(this.client as unknown as AdtClient, normalized);
      return 'enhancement';
    } catch (error) {
      if (!isNotFound(error)) throw error;
    }

    throw new Error(`BAdI object not found: ${normalized}`);
  }

  async get(
    name: string,
    options?: { includeSource?: boolean; includeImplementations?: boolean },
  ): Promise<BadiReadResult> {
    const kind = await this.resolveKind(name);
    switch (kind) {
      case 'definition': {
        const response =
          await this.client.adt.vit.wb.objectProperties.getDefinition(name);
        const definition = normalizeClassicBadiMetadata(response, 'definition');
        if (!options?.includeImplementations) {
          return definition;
        }
        const implementations = await this.listImplementations(name);
        return { ...definition, implementations };
      }
      case 'implementation': {
        const response =
          await this.client.adt.vit.wb.objectProperties.getImplementation(name);
        return normalizeClassicBadiMetadata(response, 'implementation');
      }
      case 'enhancement': {
        const normalized = name.trim().toUpperCase();
        const lower = normalized.toLowerCase();
        const info = await getBadiInfo(
          this.client as unknown as AdtClient,
          normalized,
        );
        const source = options?.includeSource
          ? String(
              await this.client.adt.enhancements.enhoxhh.source.main.get(lower),
            )
          : undefined;
        return {
          kind: 'enhancement',
          name: info.name.toUpperCase(),
          type: info.type,
          description: info.description,
          version: info.version,
          packageName: info.package,
          responsible: info.responsible,
          enhancement: info,
          source,
        };
      }
    }
  }

  async getDefinition(name: string): Promise<BadiMetadata> {
    const response =
      await this.client.adt.vit.wb.objectProperties.getDefinition(name);
    return normalizeClassicBadiMetadata(response, 'definition');
  }

  async getImplementation(name: string): Promise<BadiMetadata> {
    const response =
      await this.client.adt.vit.wb.objectProperties.getImplementation(name);
    return normalizeClassicBadiMetadata(response, 'implementation');
  }

  /**
   * List classic BAdI implementations (SXCI/XI) for a definition name.
   * Uses repository quick search heuristics — authoritative active/inactive
   * state requires SXC_ATTR (not exposed on all systems).
   */
  async listImplementations(definitionName: string): Promise<BadiMetadata[]> {
    const normalized = definitionName.trim().toUpperCase();
    await this.getDefinition(normalized);

    const queries = searchQueriesForDefinition(normalized);
    const seen = new Set<string>();
    const implementations: BadiMetadata[] = [];

    for (const query of queries) {
      for (const objectType of [undefined, 'SXCI'] as const) {
        const search =
          await this.client.adt.repository.informationsystem.search.quickSearch(
            {
              query,
              maxResults: 500,
              ...(objectType ? { objectType } : {}),
            },
          );
        for (const obj of extractSearchObjects(search)) {
          if (obj.type?.toUpperCase() !== 'SXCI/XI') continue;
          const implName = obj.name?.toUpperCase();
          if (!implName || implName === normalized || seen.has(implName)) {
            continue;
          }
          seen.add(implName);
          try {
            implementations.push(await this.getImplementation(implName));
          } catch {
            /* skip entries that cannot be read via vit/wb */
          }
        }
      }
    }

    return implementations.sort((a, b) => a.name.localeCompare(b.name));
  }
}

/** @deprecated Use BadiService */
export const ClassicBadiService = BadiService;
