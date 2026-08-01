/**
 * Table/Structure serialization helpers for abapGit format.
 *
 * This file contains the source-to-XML conversion used by the TABL handler.
 * It is intentionally separate from the handler definition file, which keeps
 * the handler surface focused on schema mapping (`toAbapGit`/`fromAbapGit`).
 */

import {
  parse,
  type TableDefinition,
  type StructureDefinition,
} from '@abapify/acds';
import { tablesettings, type InferTypedSchema } from '@abapify/adt-schemas';
import type { FormatSerializeOptions } from '@abapify/adt-plugin';
import { AdkTable, AdkStructure } from '../adk';
import { tabl } from '../../../schemas/generated';
import { SerializedFile } from '../base';
import { isoToSapLang, sapLangToIso } from '../lang';
import { buildDD02V, buildDD03P } from '../cds-to-abapgit';
import type { TypeResolver, ResolvedType } from '../cds-to-abapgit';
import { formatAbapGitXml } from '../xml-format';

/**
 * Strip undefined/empty-string values from an object
 * to avoid emitting empty XML elements
 */
function stripEmpty<T extends object>(obj: T): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== '') {
      result[key] = value;
    }
  }
  return result as Partial<T>;
}

type TableSettings = Extract<
  InferTypedSchema<typeof tablesettings>,
  { tableSettings: unknown }
>['tableSettings'];

/**
 * Parse ADT table settings XML into DD09L data for abapGit serialization.
 */
function parseSettingsToDD09L(
  settingsXml: string,
  tableName: string,
): Record<string, string> | undefined {
  let settings: TableSettings;
  try {
    const parsed = tablesettings.parse(settingsXml);
    if (!('tableSettings' in parsed)) return undefined;
    settings = parsed.tableSettings;
  } catch {
    return undefined;
  }

  const dd09l: Record<string, string> = {};
  dd09l.TABNAME = tableName;
  dd09l.AS4LOCAL = 'A';
  if (settings.sizeCategory) dd09l.TABKAT = settings.sizeCategory;
  if (settings.dataClassCategory) dd09l.TABART = settings.dataClassCategory;
  if (settings.buffering?.allowed) dd09l.BUFALLOW = settings.buffering.allowed;

  const bufType = settings.buffering?.type as string | undefined;
  if (bufType) dd09l.PUFFERUNG = bufType;

  const areaKeyFields = settings.buffering?.areaKeyFields;
  if (areaKeyFields && areaKeyFields !== '0') dd09l.SCHFELDANZ = areaKeyFields;

  if (settings.loggingEnabled) dd09l.PROTOKOLL = 'X';

  return dd09l;
}

/**
 * Create a TypeResolver that resolves named types via ADT endpoints.
 */
function createAdtTypeResolver(obj: AdkTable | AdkStructure): TypeResolver {
  const cache = new Map<string, ResolvedType>();

  return {
    async resolve(name: string): Promise<ResolvedType> {
      const key = name.toLowerCase();
      if (cache.has(key)) return cache.get(key)!;

      const dtelXml = await obj.fetchText(
        `/sap/bc/adt/ddic/dataelements/${encodeURIComponent(key)}`,
      );
      if (dtelXml) {
        const result: ResolvedType = { comptype: 'E' };
        const searchHelpMatch = dtelXml.match(
          /<dtel:searchHelp>[^<]+<\/dtel:searchHelp>/,
        );
        if (searchHelpMatch) result.shlporigin = 'D';
        const descMatch = dtelXml.match(/adtcore:description="([^"]+)"/);
        if (descMatch) result.description = descMatch[1];
        cache.set(key, result);
        return result;
      }

      const structXml = await obj.fetchText(
        `/sap/bc/adt/ddic/structures/${encodeURIComponent(key)}`,
      );
      if (structXml) {
        const result: ResolvedType = { comptype: 'S' };
        const descMatch = structXml.match(/adtcore:description="([^"]+)"/);
        if (descMatch) result.description = descMatch[1];
        cache.set(key, result);
        return result;
      }

      const fallback: ResolvedType = { comptype: 'E' };
      cache.set(key, fallback);
      return fallback;
    },
  };
}

export async function serializeTabl<T extends AdkTable | AdkStructure>(
  obj: T,
  ctx: {
    getObjectName: (obj: T) => string;
    toAbapGitXml: (obj: T) => string;
    createFile: (path: string, content: string) => SerializedFile;
  },
  options?: FormatSerializeOptions,
): Promise<SerializedFile[]> {
  const objectName = ctx.getObjectName(obj);
  const lang = isoToSapLang(obj.language || undefined);

  // Use an explicit historical source when supplied; otherwise fall back to
  // the mutable object getter. A supplied source map is authoritative: an
  // empty map (or one without `main`) means emit metadata only.
  let cdsSource: string;
  if (options?.sources !== undefined) {
    cdsSource = options.sources.main ?? '';
  } else {
    try {
      cdsSource = await obj.getSource();
    } catch {
      const xmlContent = ctx.toAbapGitXml(obj);
      return [ctx.createFile(`${objectName}.tabl.xml`, xmlContent)];
    }
  }

  const { ast, errors } = parse(cdsSource);
  if (errors.length > 0 || ast.definitions.length === 0) {
    const xmlContent = ctx.toAbapGitXml(obj);
    return [ctx.createFile(`${objectName}.tabl.xml`, xmlContent)];
  }

  const def = ast.definitions[0] as TableDefinition | StructureDefinition;
  const dd02v = buildDD02V(def, lang, obj.description ?? '');
  const resolver = createAdtTypeResolver(obj);
  const dd03pEntries = await buildDD03P(
    def.members,
    def.name.toUpperCase(),
    resolver,
  );

  const values: Record<string, unknown> = { DD02V: stripEmpty(dd02v) };

  if ('getSettings' in obj && typeof obj.getSettings === 'function') {
    try {
      const settingsXml = await (obj as AdkTable).getSettings();
      if (settingsXml) {
        const dd09l = parseSettingsToDD09L(settingsXml, def.name.toUpperCase());
        if (dd09l) values.DD09L = stripEmpty(dd09l);
      }
    } catch {
      // Settings not available, skip DD09L
    }
  }

  if (dd03pEntries.length > 0) {
    values.DD03P_TABLE = {
      DD03P: dd03pEntries.map((entry) => stripEmpty(entry)),
    };
  }

  const fullPayload = {
    abap: { version: '1.0', values },
    version: 'v1.0.0',
    serializer: 'LCL_OBJECT_TABL',
    serializer_version: 'v1.0.0',
  };

  const xml = formatAbapGitXml(
    tabl.build(fullPayload as any, { pretty: true }),
  );

  return [ctx.createFile(`${objectName}.tabl.xml`, xml)];
}

export function fromAbapGitTabl({ DD02V }: any = {}) {
  return {
    name: (DD02V?.TABNAME ?? '').toUpperCase(),
    type: DD02V?.TABCLASS === 'INTTAB' ? 'TABL/DS' : 'TABL/DT',
    description: DD02V?.DDTEXT,
    language: sapLangToIso(DD02V?.DDLANGUAGE),
    masterLanguage: sapLangToIso(DD02V?.DDLANGUAGE),
  } as { name: string } & Record<string, unknown>;
}
