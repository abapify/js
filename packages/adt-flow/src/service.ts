import { basename } from 'node:path';
import type { TransportSourceManifestEntry } from '@abapify/adk';
import type { SourceVersionRef } from '@abapify/adt-client';
import type { FormatPlugin, MaterializedFormatFile } from '@abapify/adt-plugin';
import { compareStrings, digest, sha256, stableJson } from './deterministic';
import {
  objectDescriptorPath,
  objectIdentity,
  transportDescriptorPath,
} from './identity';
import { repositoryType } from './adt-client-adapter';
import {
  applyRepositoryPlan,
  planRepositoryChanges,
  readText,
  verifyOwnedHashes,
  walkFiles,
  type DesiredFile,
} from './repository';
import {
  flowConfigSchema,
  objectDescriptorSchema,
  transportDescriptorSchema,
  type ObjectDescriptor,
  type OwnedFile,
  type TransportDescriptor,
} from './schemas';
import { FlowConfig } from '@abapify/adt-config';
import {
  AdtFlowError,
  type FlowCheckoutDependencies,
  type FlowCheckoutInput,
  type FlowCheckoutResult,
  type FlowObjectIdentity,
} from './types';

const TRANSPORT = /^[A-Z0-9]{10}$/;
const DEFAULT_METADATA_CONCURRENCY = 4;
const DEFAULT_SOURCE_CONCURRENCY = 4;
const DEFAULT_MAX_SOURCE_BYTES = 4 * 1024 * 1024;

class Limiter {
  private active = 0;
  private readonly waiting: Array<() => void> = [];

  constructor(private readonly maximum: number) {}

  async run<T>(operation: () => Promise<T>): Promise<T> {
    while (this.active >= this.maximum) {
      await new Promise<void>((resolve) => this.waiting.push(resolve));
    }
    this.active += 1;
    try {
      return await operation();
    } finally {
      this.active -= 1;
      this.waiting.shift()?.();
    }
  }
}

function normalizeTransports(values: readonly string[]): string[] {
  const normalized = [
    ...new Set(values.map((value) => value.trim().toUpperCase())),
  ]
    .filter(Boolean)
    .sort();
  if (
    normalized.length === 0 ||
    normalized.some((value) => !TRANSPORT.test(value))
  ) {
    throw new AdtFlowError(
      'configuration_invalid',
      'At least one ten-character transport number is required.',
    );
  }
  return normalized;
}

async function readDescriptor<T>(
  root: string,
  path: string,
  parser: { safeParse(value: unknown): { success: boolean; data?: T } },
): Promise<T | undefined> {
  const content = await readText(root, path);
  if (content === undefined) return undefined;
  let value: unknown;
  try {
    value = JSON.parse(content);
  } catch {
    throw new AdtFlowError(
      'configuration_invalid',
      'A flow descriptor is not valid JSON.',
      { path },
    );
  }
  const result = parser.safeParse(value);
  if (!result.success || result.data === undefined) {
    throw new AdtFlowError(
      'configuration_invalid',
      'A flow descriptor uses an unsupported or invalid schema.',
      { path },
    );
  }
  return result.data;
}

function packageMatches(
  packageName: string | undefined,
  configured: readonly string[] | undefined,
): boolean {
  if (!configured || configured.length === 0) return true;
  if (!packageName) return false;
  const candidate = packageName.toUpperCase();
  return configured.some((item) => {
    const root = item.trim().toUpperCase();
    return candidate === root || candidate.startsWith(`${root}_`);
  });
}

function applicationComponentMatches(
  component: string | undefined,
  configured: readonly string[] | undefined,
): boolean {
  if (!configured || configured.length === 0) return true;
  if (!component) return false;
  return configured.some(
    (item) => item.trim().toUpperCase() === component.toUpperCase(),
  );
}

function selectedVersion(
  entry: TransportSourceManifestEntry,
  mode: 'base' | 'head',
): SourceVersionRef | undefined {
  if (!entry.exact) {
    throw new AdtFlowError(
      'manifest_inexact',
      'Source history did not prove an exact transport boundary.',
      {
        object: `${entry.object.type}/${entry.object.name}`,
        component: entry.component.id,
        diagnostic: entry.diagnostic?.code,
      },
    );
  }
  if (mode === 'base') return entry.base;
  if (entry.changeKind === 'deleted') return undefined;
  return entry.head;
}

function groupEntries(entries: readonly TransportSourceManifestEntry[]): Array<{
  identity: FlowObjectIdentity;
  entries: TransportSourceManifestEntry[];
}> {
  const grouped = new Map<
    string,
    { identity: FlowObjectIdentity; entries: TransportSourceManifestEntry[] }
  >();
  for (const entry of entries) {
    const identity = objectIdentity(entry.object);
    const group = grouped.get(identity.canonical) ?? { identity, entries: [] };
    group.entries.push(entry);
    grouped.set(identity.canonical, group);
  }
  return [...grouped.values()]
    .map((group) => ({
      ...group,
      entries: group.entries.sort((left, right) =>
        compareStrings(left.component.id, right.component.id),
      ),
    }))
    .sort((left, right) =>
      compareStrings(left.identity.canonical, right.identity.canonical),
    );
}

function descriptorSelectionMatches(
  descriptor: ObjectDescriptor,
  component: string,
  version: SourceVersionRef,
): boolean {
  return descriptor.selections.some(
    (selection) =>
      selection.component === component &&
      selection.versionId === version.id &&
      selection.sourceUri === version.sourceUri,
  );
}

async function cachedSource(
  root: string,
  descriptor: ObjectDescriptor,
  component: string,
): Promise<string | undefined> {
  const owned = descriptor.ownedFiles.find(
    (file) => file.role === 'source' && file.sourceComponent === component,
  );
  if (!owned) return undefined;
  const content = await readText(root, owned.path);
  return content !== undefined && sha256(content) === owned.hash
    ? content
    : undefined;
}

function ownedFile(file: MaterializedFormatFile): OwnedFile {
  return {
    path: file.path,
    hash: sha256(file.content),
    role: file.role,
    ...(file.sourceComponent ? { sourceComponent: file.sourceComponent } : {}),
  };
}

async function exactHeadFastPath(
  root: string,
  transports: readonly string[],
  configDigest: string,
  formatDigest: string,
  format: FormatPlugin,
): Promise<
  | {
      descriptorPaths: string[];
      ownedPaths: string[];
      scopeTransports: string[];
    }
  | undefined
> {
  const transportPaths = transports.map(transportDescriptorPath);
  const descriptors = await Promise.all(
    transportPaths.map((path) =>
      readDescriptor(root, path, transportDescriptorSchema),
    ),
  );
  if (
    descriptors.some(
      (descriptor) =>
        !descriptor ||
        descriptor.configDigest !== configDigest ||
        descriptor.formatDigest !== formatDigest ||
        stableJson(descriptor.requestedTransports) !== stableJson(transports),
    )
  ) {
    return undefined;
  }

  const objectPaths = [...new Set(descriptors.flatMap((d) => d.objects))].sort(
    compareStrings,
  );
  const ownedPaths: string[] = [];
  for (const path of objectPaths) {
    const descriptor = await readDescriptor(root, path, objectDescriptorSchema);
    if (
      !descriptor ||
      descriptor.configDigest !== configDigest ||
      descriptor.formatDigest !== formatDigest
    ) {
      return undefined;
    }
    descriptor.ownedFiles = filterOwnedFiles(
      descriptor.ownedFiles,
      descriptor.identity,
      format,
    );
    if (!(await verifyOwnedHashes(root, descriptor.ownedFiles))) {
      return undefined;
    }
    ownedPaths.push(...descriptor.ownedFiles.map((file) => file.path));
  }
  return {
    descriptorPaths: [...transportPaths, ...objectPaths].sort(compareStrings),
    ownedPaths: ownedPaths.sort(compareStrings),
    scopeTransports: descriptors[0]?.scopeTransports ?? [...transports],
  };
}

function buildObjectFileIndex(
  files: string[],
  format: FormatPlugin,
): Map<string, string[]> {
  const index = new Map<string, string[]>();
  if (!format.parseFilename) return index;
  for (const path of files) {
    const parsed = format.parseFilename(basename(path));
    if (!parsed) continue;
    const key = `${parsed.type.toUpperCase()}/${parsed.name.toUpperCase()}`;
    const list = index.get(key);
    if (list) list.push(path);
    else index.set(key, [path]);
  }
  return index;
}

function filterOwnedFiles(
  files: readonly OwnedFile[],
  identity: FlowObjectIdentity,
  format: FormatPlugin,
): OwnedFile[] {
  if (!format.parseFilename) return [...files];
  const expectedType = repositoryType(
    identity.pgmid,
    identity.type,
  ).toUpperCase();
  const expectedName = identity.name.toUpperCase();
  return files.filter((file) => {
    const parsed = format.parseFilename(basename(file.path));
    return (
      parsed &&
      parsed.type.toUpperCase() === expectedType &&
      parsed.name.toUpperCase() === expectedName
    );
  });
}

function createTombstoneDescriptor(
  identity: FlowObjectIdentity,
  previous: ObjectDescriptor | undefined,
  configDigest: string,
  formatDigest: string,
): ObjectDescriptor {
  return {
    schemaVersion: 1,
    formatVersion: 1,
    identity: {
      canonical: identity.canonical,
      pgmid: identity.pgmid,
      type: identity.type,
      name: identity.name,
    },
    state: 'deleted',
    packagePath: previous?.packagePath ?? [],
    selections: [],
    ownedFiles: [],
    configDigest,
    formatDigest,
  };
}

async function reuseIndexedGroup(
  root: string,
  identity: FlowObjectIdentity,
  descriptorPath: string,
  previous: ObjectDescriptor,
): Promise<DesiredFile[]> {
  const desired: DesiredFile[] = [];
  for (const file of previous.ownedFiles) {
    const content = await readText(root, file.path);
    if (content === undefined) {
      throw new AdtFlowError(
        'working_tree_diverged',
        'An indexed file is missing from the working tree.',
        { object: identity.canonical, path: file.path },
      );
    }
    desired.push({
      path: file.path,
      content,
      role: file.role,
      ...(file.sourceComponent
        ? { sourceComponent: file.sourceComponent }
        : {}),
      owner: identity.canonical,
    });
  }
  desired.push({
    path: descriptorPath,
    content: stableJson(previous),
    role: 'metadata',
    owner: identity.canonical,
  });
  return desired;
}

interface ProcessGroupContext {
  root: string;
  group: {
    identity: FlowObjectIdentity;
    entries: TransportSourceManifestEntry[];
  };
  mode: 'base' | 'head';
  config: FlowConfig;
  configDigest: string;
  formatDigest: string;
  dependencies: FlowCheckoutDependencies;
  limiters: { metadata: Limiter; source: Limiter };
  maxSourceBytes: number;
  materialize: NonNullable<FormatPlugin['materialize']>;
  pending: { previous?: ObjectDescriptor; ownedPaths: string[] };
  hasApplicationComponentFilter: boolean;
  calls: { manifest: number; metadata: number; source: number };
}

interface GroupResult {
  desired: DesiredFile[];
  descriptorPaths: string[];
  ownedPaths: string[];
  reusedIndexedComponent: boolean;
}

async function processGroup(ctx: ProcessGroupContext): Promise<GroupResult> {
  const {
    root,
    group,
    mode,
    config,
    configDigest,
    formatDigest,
    dependencies,
    limiters,
    maxSourceBytes,
    materialize,
    pending,
    hasApplicationComponentFilter,
    calls,
  } = ctx;
  const { identity, entries } = group;
  const descriptorPath = objectDescriptorPath(identity);

  const previous = pending.previous;
  const selections = entries.map((entry) => ({
    entry,
    version: selectedVersion(entry, mode),
  }));
  const presentSelections = selections.filter(
    (
      selection,
    ): selection is {
      entry: TransportSourceManifestEntry;
      version: SourceVersionRef;
    } => selection.version !== undefined,
  );

  const previousDescriptor = previous;
  const exactIndexedSelection =
    previousDescriptor?.state === 'present' &&
    previousDescriptor.configDigest === configDigest &&
    previousDescriptor.formatDigest === formatDigest &&
    previousDescriptor.selections.length === presentSelections.length &&
    presentSelections.every(({ entry, version }) =>
      descriptorSelectionMatches(
        previousDescriptor,
        entry.component.id,
        version,
      ),
    );

  if (presentSelections.length === 0) {
    if (
      mode === 'head' &&
      entries.some((entry) => entry.changeKind === 'deleted')
    ) {
      const tombstone = createTombstoneDescriptor(
        identity,
        previous,
        configDigest,
        formatDigest,
      );
      return {
        desired: [
          {
            path: descriptorPath,
            content: stableJson(tombstone),
            role: 'metadata',
            owner: identity.canonical,
          },
        ],
        descriptorPaths: [descriptorPath],
        ownedPaths: pending.ownedPaths,
        reusedIndexedComponent: false,
      };
    }
    return {
      desired: [],
      descriptorPaths: [],
      ownedPaths: [],
      reusedIndexedComponent: false,
    };
  }

  // When no application-component filter is configured we can reuse the
  // indexed state without loading metadata.
  if (!hasApplicationComponentFilter && exactIndexedSelection && previous) {
    const desired = await reuseIndexedGroup(
      root,
      identity,
      descriptorPath,
      previous,
    );
    return {
      desired,
      descriptorPaths: [descriptorPath],
      ownedPaths: pending.ownedPaths,
      reusedIndexedComponent: true,
    };
  }

  calls.metadata += 1;
  const model = await limiters.metadata.run(() =>
    dependencies.loadObject(identity),
  );

  if (
    hasApplicationComponentFilter &&
    !applicationComponentMatches(
      model.applicationComponent,
      config.include?.applicationComponents,
    )
  ) {
    return {
      desired: [],
      descriptorPaths: [],
      ownedPaths: [],
      reusedIndexedComponent: false,
    };
  }

  // With a filter we loaded metadata first; now reuse the indexed state if it
  // still matches the requested boundary.
  if (exactIndexedSelection && previous) {
    const desired = await reuseIndexedGroup(
      root,
      identity,
      descriptorPath,
      previous,
    );
    return {
      desired,
      descriptorPaths: [descriptorPath],
      ownedPaths: pending.ownedPaths,
      reusedIndexedComponent: true,
    };
  }

  const sources: Record<string, string> = {};
  let reusedIndexedSource = false;
  await Promise.all(
    presentSelections.map(async ({ entry, version }) => {
      if (
        previous &&
        descriptorSelectionMatches(previous, entry.component.id, version)
      ) {
        const cached = await cachedSource(root, previous, entry.component.id);
        if (cached !== undefined) {
          sources[entry.component.id] = cached;
          reusedIndexedSource = true;
          return;
        }
      }
      calls.source += 1;
      sources[entry.component.id] = await limiters.source.run(() =>
        dependencies.readSource(version, maxSourceBytes),
      );
    }),
  );

  const materialized = await materialize({
    object: model.object,
    objectType: repositoryType(identity.pgmid, identity.type),
    packagePath: model.packagePath,
    sources,
    formatOptions: config.format.options,
  });
  const files = materialized.files.sort((left, right) =>
    compareStrings(left.path, right.path),
  );
  const desired: DesiredFile[] = files.map((file) => ({
    ...file,
    owner: identity.canonical,
  }));
  const ownedFiles = files
    .map(ownedFile)
    .sort((left, right) => compareStrings(left.path, right.path));
  const descriptor: ObjectDescriptor = {
    schemaVersion: 1,
    formatVersion: 1,
    identity: {
      canonical: identity.canonical,
      pgmid: identity.pgmid,
      type: identity.type,
      name: identity.name,
    },
    state: 'present',
    packagePath: model.packagePath,
    selections: presentSelections
      .map(({ entry, version }) => ({
        component: entry.component.id,
        versionId: version.id,
        sourceUri: version.sourceUri,
      }))
      .sort((left, right) => compareStrings(left.component, right.component)),
    ownedFiles,
    configDigest,
    formatDigest,
  };
  desired.push({
    path: descriptorPath,
    content: stableJson(descriptor),
    role: 'metadata',
    owner: identity.canonical,
  });
  return {
    desired,
    descriptorPaths: [descriptorPath],
    ownedPaths: pending.ownedPaths,
    reusedIndexedComponent: reusedIndexedSource,
  };
}

export interface AdtFlowService {
  checkout(input: FlowCheckoutInput): Promise<FlowCheckoutResult>;
}

export function createAdtFlowService(
  dependencies: FlowCheckoutDependencies,
): AdtFlowService {
  return {
    async checkout(input): Promise<FlowCheckoutResult> {
      const parsed = flowConfigSchema.safeParse(input.config);
      if (!parsed.success) {
        throw new AdtFlowError(
          'configuration_invalid',
          'adt.config.ts contains an invalid flow section.',
        );
      }
      const config = parsed.data;
      const materialize = dependencies.format.materialize?.bind(
        dependencies.format,
      );
      if (config.format.id !== dependencies.format.id || !materialize) {
        throw new AdtFlowError(
          'format_unsupported',
          'The selected format does not support flow materialization.',
        );
      }
      const root = input.root;
      const mode = input.mode ?? 'head';
      const requested = normalizeTransports(input.transports);
      const configDigest = digest(config);
      const formatDigest = digest({
        id: dependencies.format.id,
        options: config.format.options ?? {},
        supportedTypes: [...dependencies.format.supportedTypes].sort(),
      });
      const calls = { manifest: 0, metadata: 0, source: 0 };

      if (mode === 'head') {
        const fast = await exactHeadFastPath(
          root,
          requested,
          configDigest,
          formatDigest,
          dependencies.format,
        );
        if (fast) {
          return {
            mode,
            requestedTransports: requested,
            scopeTransports: fast.scopeTransports,
            changed: [],
            moved: [],
            removed: [],
            unchanged: fast.ownedPaths,
            descriptors: fast.descriptorPaths,
            sapCalls: calls,
            fastPath: 'exact-head',
          };
        }
      }

      calls.manifest += 1;
      const manifest = await dependencies.buildManifest(requested, {
        ...(config.include?.objectTypes?.length
          ? {
              objectTypes: config.include.objectTypes.map((type) =>
                type.toUpperCase(),
              ),
            }
          : {}),
        concurrency:
          config.concurrency?.metadata ?? DEFAULT_METADATA_CONCURRENCY,
      });
      const entries = manifest.entries.filter((entry) =>
        packageMatches(entry.object.packageName, config.include?.packages),
      );
      const metadataLimiter = new Limiter(
        config.concurrency?.metadata ?? DEFAULT_METADATA_CONCURRENCY,
      );
      const sourceLimiter = new Limiter(
        config.concurrency?.sources ?? DEFAULT_SOURCE_CONCURRENCY,
      );
      const maxSourceBytes = config.maxSourceBytes ?? DEFAULT_MAX_SOURCE_BYTES;
      const hasApplicationComponentFilter =
        (config.include?.applicationComponents?.length ?? 0) > 0;

      const allSrcFiles = await walkFiles(root, 'src');
      const srcFilesByObject = buildObjectFileIndex(
        allSrcFiles,
        dependencies.format,
      );

      const desired: DesiredFile[] = [];
      const ownedPaths = new Set<string>();
      const ownedOwners = new Map<string, string>();
      const descriptorPaths: string[] = [];
      const groups = groupEntries(entries);

      for (const group of groups) {
        for (const entry of group.entries) selectedVersion(entry, mode);
      }

      const pendingOwnership = new Map<
        string,
        { previous?: ObjectDescriptor; ownedPaths: string[] }
      >();
      await Promise.all(
        groups.map(async ({ identity }) => {
          const descriptorPath = objectDescriptorPath(identity);
          const previous = await readDescriptor(
            root,
            descriptorPath,
            objectDescriptorSchema,
          );
          const owned: string[] = [];
          if (previous) {
            previous.ownedFiles = filterOwnedFiles(
              previous.ownedFiles,
              identity,
              dependencies.format,
            );
            if (!(await verifyOwnedHashes(root, previous.ownedFiles))) {
              throw new AdtFlowError(
                'working_tree_diverged',
                'An indexed file differs from its recorded content hash.',
                { object: identity.canonical },
              );
            }
            for (const file of previous.ownedFiles) owned.push(file.path);
            owned.push(descriptorPath);
          } else {
            const key = `${repositoryType(identity.pgmid, identity.type)}/${identity.name}`;
            const files = srcFilesByObject.get(key) ?? [];
            for (const path of files) owned.push(path);
          }
          pendingOwnership.set(identity.canonical, {
            previous,
            ownedPaths: owned,
          });
        }),
      );

      let reusedIndexedComponent = false;
      await Promise.all(
        groups.map(async (group) => {
          const pending = pendingOwnership.get(group.identity.canonical);
          if (!pending) {
            throw new AdtFlowError(
              'configuration_invalid',
              'Object ownership state is missing for a group.',
              { object: group.identity.canonical },
            );
          }
          const result = await processGroup({
            root,
            group,
            mode,
            config,
            configDigest,
            formatDigest,
            dependencies,
            limiters: { metadata: metadataLimiter, source: sourceLimiter },
            maxSourceBytes,
            materialize,
            pending,
            hasApplicationComponentFilter,
            calls,
          });
          for (const file of result.desired) desired.push(file);
          for (const path of result.descriptorPaths) descriptorPaths.push(path);
          for (const path of result.ownedPaths) {
            ownedPaths.add(path);
            ownedOwners.set(path, group.identity.canonical);
          }
          if (result.reusedIndexedComponent) reusedIndexedComponent = true;
        }),
      );

      const relevantObjectDescriptors = [...new Set(descriptorPaths)].sort(
        compareStrings,
      );
      for (const transport of requested) {
        const path = transportDescriptorPath(transport);
        if ((await readText(root, path)) !== undefined) {
          ownedPaths.add(path);
          ownedOwners.set(path, 'flow-index');
        }
        if (mode === 'head') {
          const descriptor: TransportDescriptor = {
            schemaVersion: 1,
            requestedTransports: requested,
            scopeTransports: manifest.scopeTransports,
            objects: relevantObjectDescriptors,
            configDigest,
            formatDigest,
          };
          desired.push({
            path,
            content: stableJson(descriptor),
            role: 'metadata',
            owner: 'flow-index',
          });
          descriptorPaths.push(path);
        }
      }

      desired.sort((left, right) => compareStrings(left.path, right.path));

      const plan = await planRepositoryChanges(
        root,
        desired,
        ownedPaths,
        ownedOwners,
      );
      await applyRepositoryPlan(root, plan);
      const descriptorSet = new Set(descriptorPaths);
      const sourceMoves = plan.moved.filter(
        ({ from, to }) => !from.startsWith('.adt/') && !to.startsWith('.adt/'),
      );
      const movedFrom = new Set(sourceMoves.map(({ from }) => from));
      const movedTo = new Set(sourceMoves.map(({ to }) => to));
      return {
        mode,
        requestedTransports: manifest.requestedTransports,
        scopeTransports: manifest.scopeTransports,
        changed: [...plan.writes.keys()]
          .filter((path) => !descriptorSet.has(path) && !movedTo.has(path))
          .sort(),
        moved: sourceMoves,
        removed: plan.removes
          .filter((path) => !path.startsWith('.adt/') && !movedFrom.has(path))
          .sort(),
        unchanged: plan.unchanged.filter((path) => !descriptorSet.has(path)),
        descriptors: [...descriptorSet].sort(),
        sapCalls: calls,
        fastPath: reusedIndexedComponent ? 'indexed-components' : 'none',
      };
    },
  };
}
