import { assertAdtUri, type SourceVersionRef } from '@abapify/adt-client';
import type { AdkContext } from './base/context';
import { getGlobalContext } from './base/global-context';
import { normalizeObjectName } from './base/registry';
import { createAdkFactory } from './factory';
import {
  resolveTransportObjects,
  type ResolvedTransportObjects,
  type TransportObjectSelector,
} from './objects/cts';

export type TransportSourceChangeKind =
  | 'added'
  | 'modified'
  | 'deleted'
  | 'ambiguous'
  | 'unsupported'
  | 'failed';

export type SourceHistoryDiagnosticCode =
  | 'DELETED_SOURCE_BASE_UNAVAILABLE'
  | 'OBJECT_METADATA_LOAD_FAILED'
  | 'OBJECT_METADATA_UNAVAILABLE'
  | 'OBJECT_TYPE_UNSUPPORTED'
  | 'SOURCE_COMPONENT_NOT_FOUND'
  | 'SOURCE_COMPONENTS_UNAVAILABLE'
  | 'SOURCE_COMPONENT_URI_UNSAFE'
  | 'SOURCE_COMPONENT_VERSIONS_UNAVAILABLE'
  | 'SOURCE_HISTORY_INTERVENING_VERSION'
  | 'SOURCE_HISTORY_ORDER_INVALID'
  | 'SOURCE_HISTORY_PROVENANCE_MISSING'
  | 'SOURCE_HISTORY_RETRIEVAL_FAILED'
  | 'SOURCE_HISTORY_SCOPE_VERSION_MISSING';

export interface SourceHistoryDiagnostic {
  code: SourceHistoryDiagnosticCode;
  message: string;
}

export type TransportSourceDiagnostic = SourceHistoryDiagnostic;

export interface ObjectSourceHistoryIdentity {
  name: string;
  type: string;
  packageName?: string;
}

export interface ListObjectSourceVersionsOptions {
  component?: string;
}

export type ObjectSourceVersionsComponent =
  | (TransportSourceManifestComponent & {
      versions: SourceVersionRef[];
      diagnostic?: never;
    })
  | (TransportSourceManifestComponent & {
      versions?: never;
      diagnostic: SourceHistoryDiagnostic;
    });

export interface ObjectSourceVersionsResult {
  object: ObjectSourceHistoryIdentity;
  components: ObjectSourceVersionsComponent[];
}

export type ObjectSourceHistoryErrorCode =
  | 'OBJECT_METADATA_LOAD_FAILED'
  | 'OBJECT_METADATA_UNAVAILABLE'
  | 'OBJECT_TYPE_UNSUPPORTED'
  | 'SOURCE_COMPONENT_NOT_FOUND'
  | 'SOURCE_COMPONENTS_UNAVAILABLE';

/** Stable public failure for errors that occur before a component result exists. */
export class ObjectSourceHistoryError extends Error {
  override readonly name = 'ObjectSourceHistoryError';

  constructor(
    readonly code: ObjectSourceHistoryErrorCode,
    message: string,
    readonly object: ObjectSourceHistoryIdentity,
  ) {
    super(message);
  }
}

export interface TransportSourceVersionSelection {
  changeKind: TransportSourceChangeKind;
  exact: boolean;
  base?: SourceVersionRef;
  head?: SourceVersionRef;
  diagnostic?: TransportSourceDiagnostic;
}

export interface TransportSourceManifestObject {
  pgmid: string;
  type: string;
  name: string;
  packageName?: string;
}

export interface TransportSourceManifestComponent {
  id: string;
  sourceUri?: string;
  versionsUri?: string;
}

export interface TransportSourceManifestEntry extends TransportSourceVersionSelection {
  object: TransportSourceManifestObject;
  component: TransportSourceManifestComponent;
  sourceTransport: string;
}

export interface TransportSourceManifest {
  requestedTransports: string[];
  scopeTransports: string[];
  entries: TransportSourceManifestEntry[];
}

export interface BuildTransportSourceManifestOptions {
  selector?: TransportObjectSelector;
  concurrency?: number;
}

interface RuntimeLink {
  href?: unknown;
  rel?: unknown;
}

interface DiscoveredComponent extends TransportSourceManifestComponent {
  diagnostic?: TransportSourceDiagnostic;
}

const VERSIONS_RELATION = 'http://www.sap.com/adt/relations/versions';
const DEFAULT_CONCURRENCY = 4;
const MAX_CONCURRENCY = 32;
const RELATIVE_URI_TRAVERSAL = /(?:^|\/)(?:\.{1,2}|%2e(?:%2e)?)(?:\/|$)/i;

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : undefined;
}

function asArray(value: unknown): unknown[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function nonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function uniqueStable(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const normalized = value.trim().toUpperCase();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}

function compareText(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function resolveAdtRelativeUri(
  href: string,
  objectUri: string,
): string | undefined {
  try {
    const safeObjectUri = assertAdtUri(objectUri);
    if (href.startsWith('/')) return assertAdtUri(href);
    if (
      href.startsWith('//') ||
      href.includes('\\') ||
      href.includes(':') ||
      RELATIVE_URI_TRAVERSAL.test(href)
    ) {
      return undefined;
    }

    const directoryBase = safeObjectUri.endsWith('/')
      ? safeObjectUri
      : `${safeObjectUri}/`;
    const resolved = new URL(href, `https://adt.invalid${directoryBase}`);
    return assertAdtUri(
      `${resolved.pathname}${resolved.search}${resolved.hash}`,
    );
  } catch {
    return undefined;
  }
}

function runtimeLinks(value: Record<string, unknown>): RuntimeLink[] {
  return [...asArray(value['link']), ...asArray(value['links'])]
    .map(asRecord)
    .filter((link): link is Record<string, unknown> => Boolean(link));
}

function discoverComponent(
  value: Record<string, unknown>,
  id: string,
  objectUri: string,
): DiscoveredComponent | undefined {
  const sourceHref = nonEmptyString(value['sourceUri']);
  if (!sourceHref) return undefined;

  const sourceUri = resolveAdtRelativeUri(sourceHref, objectUri);
  const versionsHref = runtimeLinks(value)
    .filter((link) => link.rel === VERSIONS_RELATION)
    .map((link) => nonEmptyString(link.href))
    .find((href): href is string => Boolean(href));
  const versionsUri = versionsHref
    ? resolveAdtRelativeUri(versionsHref, objectUri)
    : undefined;

  if (!sourceUri || (versionsHref && !versionsUri)) {
    return {
      id,
      diagnostic: {
        code: 'SOURCE_COMPONENT_URI_UNSAFE',
        message: 'The source component exposes an unsafe ADT URI.',
      },
    };
  }

  return {
    id,
    sourceUri,
    ...(versionsUri ? { versionsUri } : {}),
  };
}

function discoverSourceComponents(
  metadata: Record<string, unknown>,
  objectUri: string,
): DiscoveredComponent[] {
  const candidates: DiscoveredComponent[] = [];
  const root = discoverComponent(metadata, 'main', objectUri);
  if (root) candidates.push(root);

  for (const [index, rawInclude] of asArray(metadata['include']).entries()) {
    const include = asRecord(rawInclude);
    if (!include) continue;
    const id =
      nonEmptyString(include['includeType']) ??
      nonEmptyString(include['name']) ??
      `include-${index + 1}`;
    const component = discoverComponent(include, id, objectUri);
    if (component) candidates.push(component);
  }

  candidates.sort(
    (left, right) =>
      compareText(left.id, right.id) ||
      compareText(left.sourceUri ?? '', right.sourceUri ?? '') ||
      compareText(left.versionsUri ?? '', right.versionsUri ?? ''),
  );

  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    const key = `${candidate.sourceUri ?? ''}\u0000${candidate.versionsUri ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function loadedMetadata(loaded: unknown): Record<string, unknown> | undefined {
  const object = asRecord(loaded);
  if (!object) return undefined;
  const dataSync = asRecord(object['dataSync']);
  if (dataSync) return dataSync;
  return asRecord(object['data']);
}

function packageNameFrom(
  metadata: Record<string, unknown>,
): string | undefined {
  const packageRef = asRecord(metadata['packageRef']);
  return (
    nonEmptyString(packageRef?.['name']) ??
    nonEmptyString(metadata['packageName'])
  );
}

function normalizeSourceHistoryIdentity(
  objectName: string,
  objectType: string,
): ObjectSourceHistoryIdentity {
  const type = objectType.trim().toUpperCase();
  const requestedName = objectName.trim().toUpperCase();
  const name = normalizeObjectName(requestedName, type)[0] ?? requestedName;
  return { name, type };
}

interface ObjectSourceDiscovery {
  object: ObjectSourceHistoryIdentity;
  components: DiscoveredComponent[];
}

async function discoverObjectSourceHistory(
  objectName: string,
  objectType: string,
  ctx: AdkContext,
  normalizeIdentity = true,
): Promise<ObjectSourceDiscovery> {
  const object = normalizeIdentity
    ? normalizeSourceHistoryIdentity(objectName, objectType)
    : { name: objectName, type: objectType };
  const model = createAdkFactory(ctx).get(object.name, object.type);
  const modelRecord = asRecord(model);
  const load = modelRecord?.['load'];

  if (typeof load !== 'function') {
    throw new ObjectSourceHistoryError(
      'OBJECT_TYPE_UNSUPPORTED',
      'The repository object type has no loadable ADK model.',
      object,
    );
  }

  try {
    await load.call(model);
  } catch {
    throw new ObjectSourceHistoryError(
      'OBJECT_METADATA_LOAD_FAILED',
      'SAP ADT rejected repository object metadata retrieval.',
      object,
    );
  }

  const metadata = loadedMetadata(model);
  const objectUri = nonEmptyString(modelRecord?.['objectUri']);
  if (!metadata || !objectUri || !resolveAdtRelativeUri('', objectUri)) {
    throw new ObjectSourceHistoryError(
      'OBJECT_METADATA_UNAVAILABLE',
      'The loaded object has no usable ADT metadata identity.',
      object,
    );
  }

  const packageName = packageNameFrom(metadata);
  const normalizedObject = {
    ...object,
    ...(packageName ? { packageName } : {}),
  };
  const components = discoverSourceComponents(metadata, objectUri);
  if (components.length === 0) {
    throw new ObjectSourceHistoryError(
      'SOURCE_COMPONENTS_UNAVAILABLE',
      'The object metadata exposes no source component.',
      normalizedObject,
    );
  }

  return { object: normalizedObject, components };
}

function normalizeConcurrency(value: number | undefined): number {
  if (value === undefined) return DEFAULT_CONCURRENCY;
  if (!Number.isFinite(value)) return DEFAULT_CONCURRENCY;
  return Math.max(1, Math.min(MAX_CONCURRENCY, Math.floor(value)));
}

async function mapOrdered<T, R>(
  values: readonly T[],
  concurrency: number,
  worker: (value: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(values.length);
  let nextIndex = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, values.length) },
    async () => {
      while (nextIndex < values.length) {
        const index = nextIndex;
        nextIndex += 1;
        const value = values[index];
        if (value !== undefined) results[index] = await worker(value);
      }
    },
  );
  await Promise.all(workers);
  return results;
}

function unavailableEntry(
  object: TransportSourceManifestObject,
  component: TransportSourceManifestComponent,
  sourceTransport: string,
  changeKind: 'unsupported' | 'failed',
  diagnostic: TransportSourceDiagnostic,
): TransportSourceManifestEntry {
  return {
    object,
    component,
    sourceTransport,
    changeKind,
    exact: false,
    diagnostic,
  };
}

function selectedRangeDiagnostic(
  ordered: readonly SourceVersionRef[],
  newestIndex: number,
  oldestIndex: number,
  scope: ReadonlySet<string>,
): TransportSourceDiagnostic | undefined {
  for (const candidate of ordered.slice(newestIndex, oldestIndex + 1)) {
    if (
      candidate.transports.some((transport) =>
        scope.has(transport.toUpperCase()),
      )
    ) {
      continue;
    }

    return candidate.transports.length === 0
      ? {
          code: 'SOURCE_HISTORY_PROVENANCE_MISSING',
          message:
            'A source version in the selected history range has no transport provenance.',
        }
      : {
          code: 'SOURCE_HISTORY_INTERVENING_VERSION',
          message:
            'An unrelated source version occurs between in-scope versions.',
        };
  }

  return undefined;
}

/**
 * Select immutable before/after references using SAP's observed feed ordinal.
 */
export function selectTransportSourceVersions( // NOSONAR - SAP feed-order selection is inherently branch-heavy; will be refactored in follow-up
  versions: readonly SourceVersionRef[],
  scopeTransportNumbers: readonly string[],
  deleted = false,
): TransportSourceVersionSelection {
  const scope = new Set(
    scopeTransportNumbers.map((transport) => transport.toUpperCase()),
  );
  const ordinals = versions.map((version) => version.ordinal);
  if (
    ordinals.some((ordinal) => !Number.isSafeInteger(ordinal) || ordinal < 0) ||
    new Set(ordinals).size !== ordinals.length
  ) {
    return {
      changeKind: 'ambiguous',
      exact: false,
      diagnostic: {
        code: 'SOURCE_HISTORY_ORDER_INVALID',
        message: 'Source version ordinals do not define a unique feed order.',
      },
    };
  }

  const ordered = [...versions].sort(
    (left, right) => left.ordinal - right.ordinal,
  );
  const inScope = ordered
    .map((candidate, index) => ({ candidate, index }))
    .filter(({ candidate }) =>
      candidate.transports.some((transport) =>
        scope.has(transport.toUpperCase()),
      ),
    );

  if (deleted) {
    if (ordered.length === 0) {
      return {
        changeKind: 'unsupported',
        exact: false,
        diagnostic: {
          code: 'DELETED_SOURCE_BASE_UNAVAILABLE',
          message:
            'The deleted component has no recoverable historical source.',
        },
      };
    }
    const oldestInScope = inScope.at(-1);
    if (!oldestInScope) {
      return {
        changeKind: 'ambiguous',
        exact: false,
        diagnostic: {
          code: 'SOURCE_HISTORY_SCOPE_VERSION_MISSING',
          message:
            'No source version is attributed to the requested transport scope.',
        },
      };
    }
    const base = ordered[oldestInScope.index + 1];
    const rangeDiagnostic = selectedRangeDiagnostic(
      ordered,
      inScope[0]!.index,
      oldestInScope.index,
      scope,
    );
    if (rangeDiagnostic) {
      return {
        changeKind: 'ambiguous',
        exact: false,
        ...(base ? { base } : {}),
        diagnostic: rangeDiagnostic,
      };
    }
    return base
      ? { changeKind: 'deleted', exact: true, base }
      : {
          changeKind: 'unsupported',
          exact: false,
          diagnostic: {
            code: 'DELETED_SOURCE_BASE_UNAVAILABLE',
            message:
              'The deleted component has no recoverable historical source.',
          },
        };
  }

  if (inScope.length === 0) {
    return {
      changeKind: 'ambiguous',
      exact: false,
      diagnostic: {
        code: 'SOURCE_HISTORY_SCOPE_VERSION_MISSING',
        message:
          'No source version is attributed to the requested transport scope.',
      },
    };
  }

  const newest = inScope[0];
  const oldest = inScope.at(-1);
  if (!newest || !oldest) {
    throw new Error('Unreachable source-history selection state.');
  }

  const head = newest.candidate;
  const base = ordered[oldest.index + 1];
  const rangeDiagnostic = selectedRangeDiagnostic(
    ordered,
    newest.index,
    oldest.index,
    scope,
  );
  if (rangeDiagnostic) {
    return {
      changeKind: 'ambiguous',
      exact: false,
      ...(base ? { base } : {}),
      head,
      diagnostic: rangeDiagnostic,
    };
  }

  return base
    ? { changeKind: 'modified', exact: true, base, head }
    : { changeKind: 'added', exact: true, head };
}

type TransportObjectReference = ResolvedTransportObjects['objects'][number];

/**
 * CTS exposes a program's main source as the LIMU/REPS sub-object, while ADT
 * exposes the same source history through the repository PROG resource. Keep
 * the CTS key in the public manifest, but use the ADT model identity for
 * metadata and immutable-version discovery.
 */
function sourceHistoryDiscoveryType(
  reference: TransportObjectReference,
): string {
  const pgmid = reference.pgmid.trim().toUpperCase();
  const type = reference.type.trim().toUpperCase().split('/')[0];
  return pgmid === 'LIMU' && type === 'REPS' ? 'PROG' : reference.type;
}

async function buildObjectEntries( // NOSONAR - SAP object manifest construction is branch-heavy; will be refactored in follow-up
  reference: TransportObjectReference,
  sourceTransport: string,
  scopeTransportNumbers: readonly string[],
  ctx: AdkContext,
): Promise<TransportSourceManifestEntry[]> {
  const baseIdentity: TransportSourceManifestObject = {
    pgmid: reference.pgmid,
    type: reference.type,
    name: reference.name,
  };
  let discovery: ObjectSourceDiscovery;
  try {
    discovery = await discoverObjectSourceHistory(
      reference.name,
      sourceHistoryDiscoveryType(reference),
      ctx,
      false,
    );
  } catch (error) {
    if (!(error instanceof ObjectSourceHistoryError)) throw error;
    const failureIdentity: TransportSourceManifestObject = {
      ...baseIdentity,
      ...(error.object.packageName
        ? { packageName: error.object.packageName }
        : {}),
    };
    return [
      unavailableEntry(
        failureIdentity,
        { id: 'object' },
        sourceTransport,
        error.code === 'OBJECT_METADATA_LOAD_FAILED' ? 'failed' : 'unsupported',
        {
          code: error.code,
          message: error.message,
        },
      ),
    ];
  }

  const identity: TransportSourceManifestObject = {
    ...baseIdentity,
    ...(discovery.object.packageName
      ? { packageName: discovery.object.packageName }
      : {}),
  };

  const entries: TransportSourceManifestEntry[] = [];
  for (const component of discovery.components) {
    const publicComponent: TransportSourceManifestComponent = {
      id: component.id,
      ...(component.sourceUri ? { sourceUri: component.sourceUri } : {}),
      ...(component.versionsUri ? { versionsUri: component.versionsUri } : {}),
    };

    if (component.diagnostic) {
      entries.push(
        unavailableEntry(
          identity,
          publicComponent,
          sourceTransport,
          'unsupported',
          component.diagnostic,
        ),
      );
      continue;
    }

    if (!component.versionsUri) {
      entries.push(
        unavailableEntry(
          identity,
          publicComponent,
          sourceTransport,
          'unsupported',
          {
            code: 'SOURCE_COMPONENT_VERSIONS_UNAVAILABLE',
            message: 'The source component has no exact versions relation.',
          },
        ),
      );
      continue;
    }

    let versions: SourceVersionRef[];
    try {
      versions = await ctx.client.services.sourceHistory.listVersions(
        component.versionsUri,
      );
    } catch {
      entries.push(
        unavailableEntry(identity, publicComponent, sourceTransport, 'failed', {
          code: 'SOURCE_HISTORY_RETRIEVAL_FAILED',
          message: 'SAP ADT rejected source-history metadata retrieval.',
        }),
      );
      continue;
    }

    const selection = selectTransportSourceVersions(
      versions,
      scopeTransportNumbers,
      reference.isDeleted,
    );
    entries.push({
      object: identity,
      component: publicComponent,
      sourceTransport,
      ...selection,
    });
  }

  return entries;
}

/**
 * List immutable source-version metadata for every discovered object component.
 * Source bodies remain lazy and are never read by this operation.
 */
export async function listObjectSourceVersions(
  objectName: string,
  objectType: string,
  options: ListObjectSourceVersionsOptions = {},
  ctx?: AdkContext,
): Promise<ObjectSourceVersionsResult> {
  const context = ctx ?? getGlobalContext();
  const discovery = await discoverObjectSourceHistory(
    objectName,
    objectType,
    context,
  );
  const requestedComponent = options.component?.trim().toUpperCase();
  const components =
    options.component !== undefined
      ? discovery.components.filter(
          (component) => component.id.toUpperCase() === requestedComponent,
        )
      : discovery.components;
  if (components.length === 0) {
    throw new ObjectSourceHistoryError(
      'SOURCE_COMPONENT_NOT_FOUND',
      'The requested source component was not exposed by object metadata.',
      discovery.object,
    );
  }

  const results: ObjectSourceVersionsComponent[] = [];
  for (const component of components) {
    const publicComponent: TransportSourceManifestComponent = {
      id: component.id,
      ...(component.sourceUri ? { sourceUri: component.sourceUri } : {}),
      ...(component.versionsUri ? { versionsUri: component.versionsUri } : {}),
    };
    if (component.diagnostic) {
      results.push({ ...publicComponent, diagnostic: component.diagnostic });
      continue;
    }
    if (!component.versionsUri) {
      results.push({
        ...publicComponent,
        diagnostic: {
          code: 'SOURCE_COMPONENT_VERSIONS_UNAVAILABLE',
          message: 'The source component has no exact versions relation.',
        },
      });
      continue;
    }
    try {
      const versions = await context.client.services.sourceHistory.listVersions(
        component.versionsUri,
      );
      results.push({ ...publicComponent, versions });
    } catch {
      results.push({
        ...publicComponent,
        diagnostic: {
          code: 'SOURCE_HISTORY_RETRIEVAL_FAILED',
          message: 'SAP ADT rejected source-history metadata retrieval.',
        },
      });
    }
  }

  return { object: discovery.object, components: results };
}

/**
 * Resolve transport objects and produce immutable source-history references.
 * Source bodies remain lazy and are never read while building the manifest.
 */
export async function buildTransportSourceManifest(
  requestedTransports: string[],
  options: BuildTransportSourceManifestOptions = {},
  ctx?: AdkContext,
): Promise<TransportSourceManifest> {
  const context = ctx ?? getGlobalContext();
  const requested = uniqueStable(requestedTransports);
  const resolved = await resolveTransportObjects(
    requested,
    options.selector ?? {},
    context,
  );
  const scopeTransports = uniqueStable([
    ...requested,
    ...resolved.scopeTransportNumbers,
  ]);
  const objects = [...resolved.objects].sort(
    (left, right) =>
      compareText(left.pgmid, right.pgmid) ||
      compareText(left.type, right.type) ||
      compareText(left.name, right.name),
  );

  const perObjectEntries = await mapOrdered(
    objects,
    normalizeConcurrency(options.concurrency),
    (reference) =>
      buildObjectEntries(
        reference,
        resolved.sourceTransportMap.get(reference.key) ?? '',
        scopeTransports,
        context,
      ),
  );

  return {
    requestedTransports: requested,
    scopeTransports,
    entries: perObjectEntries.flat(),
  };
}
