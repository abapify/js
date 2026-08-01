import type { TransportSourceManifestEntry } from '@abapify/adk';
import type { SourceVersionRef } from '@abapify/adt-client';
import type { MaterializedFormatFile } from '@abapify/adt-plugin';
import { digest, sha256, stableJson } from './deterministic';
import {
  objectDescriptorPath,
  objectIdentity,
  transportDescriptorPath,
} from './identity';
import {
  applyRepositoryPlan,
  discoverObjectFiles,
  planRepositoryChanges,
  readText,
  verifyOwnedHashes,
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
    if (this.active >= this.maximum) {
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
        left.component.id.localeCompare(right.component.id),
      ),
    }))
    .sort((left, right) =>
      left.identity.canonical.localeCompare(right.identity.canonical),
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

  const objectPaths = [
    ...new Set(descriptors.flatMap((descriptor) => descriptor?.objects ?? [])),
  ].sort();
  const ownedPaths: string[] = [];
  for (const path of objectPaths) {
    const descriptor = await readDescriptor(root, path, objectDescriptorSchema);
    if (
      !descriptor ||
      descriptor.configDigest !== configDigest ||
      descriptor.formatDigest !== formatDigest ||
      !(await verifyOwnedHashes(root, descriptor.ownedFiles))
    ) {
      return undefined;
    }
    ownedPaths.push(...descriptor.ownedFiles.map((file) => file.path));
  }
  return {
    descriptorPaths: [...transportPaths, ...objectPaths].sort(),
    ownedPaths: ownedPaths.sort(),
    scopeTransports: descriptors[0]?.scopeTransports ?? [...transports],
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
      const desired: DesiredFile[] = [];
      const ownedPaths = new Set<string>();
      const descriptorPaths: string[] = [];
      let reusedIndexedComponent = false;
      const groups = groupEntries(entries);
      const previousByIdentity = new Map<string, ObjectDescriptor>();

      // Validate the complete metadata-only boundary before reading any source
      // body. A single ambiguous component invalidates the whole checkout.
      for (const group of groups) {
        for (const entry of group.entries) selectedVersion(entry, mode);
      }

      // Validate all indexed ownership before source reads as well. This keeps
      // a divergence in one object from wasting source calls for another.
      await Promise.all(
        groups.map(async ({ identity }) => {
          const descriptorPath = objectDescriptorPath(identity);
          const previous = await readDescriptor(
            root,
            descriptorPath,
            objectDescriptorSchema,
          );
          if (previous) {
            if (!(await verifyOwnedHashes(root, previous.ownedFiles))) {
              throw new AdtFlowError(
                'working_tree_diverged',
                'An indexed file differs from its recorded content hash.',
                { object: identity.canonical },
              );
            }
            previousByIdentity.set(identity.canonical, previous);
            for (const file of previous.ownedFiles) ownedPaths.add(file.path);
            ownedPaths.add(descriptorPath);
          } else {
            for (const path of await discoverObjectFiles(
              root,
              dependencies.format,
              identity,
            )) {
              ownedPaths.add(path);
            }
          }
        }),
      );

      await Promise.all(
        groups.map(async ({ identity, entries: objectEntries }) => {
          const descriptorPath = objectDescriptorPath(identity);
          const previous = previousByIdentity.get(identity.canonical);

          const selections = objectEntries.map((entry) => ({
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

          const exactIndexedSelection =
            previous?.state === 'present' &&
            previous.configDigest === configDigest &&
            previous.formatDigest === formatDigest &&
            previous.selections.length === presentSelections.length &&
            presentSelections.every(({ entry, version }) =>
              descriptorSelectionMatches(previous, entry.component.id, version),
            );

          if (exactIndexedSelection && previous) {
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
            descriptorPaths.push(descriptorPath);
            reusedIndexedComponent = true;
            return;
          }

          if (presentSelections.length === 0) {
            if (
              mode === 'head' &&
              objectEntries.some((entry) => entry.changeKind === 'deleted')
            ) {
              const tombstone: ObjectDescriptor = {
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
              desired.push({
                path: descriptorPath,
                content: stableJson(tombstone),
                role: 'metadata',
                owner: identity.canonical,
              });
              descriptorPaths.push(descriptorPath);
            }
            return;
          }

          calls.metadata += 1;
          const model = await metadataLimiter.run(() =>
            dependencies.loadObject(identity),
          );
          if (
            !applicationComponentMatches(
              model.applicationComponent,
              config.include?.applicationComponents,
            )
          ) {
            return;
          }
          const sources: Record<string, string> = {};
          await Promise.all(
            presentSelections.map(async ({ entry, version }) => {
              if (
                previous &&
                descriptorSelectionMatches(
                  previous,
                  entry.component.id,
                  version,
                )
              ) {
                const cached = await cachedSource(
                  root,
                  previous,
                  entry.component.id,
                );
                if (cached !== undefined) {
                  sources[entry.component.id] = cached;
                  reusedIndexedComponent = true;
                  return;
                }
              }
              calls.source += 1;
              sources[entry.component.id] = await sourceLimiter.run(() =>
                dependencies.readSource(version, maxSourceBytes),
              );
            }),
          );

          const materialized = await materialize({
            object: model.object,
            objectType: identity.type,
            packagePath: model.packagePath,
            sources,
            formatOptions: config.format.options,
          });
          const files = materialized.files.sort((left, right) =>
            left.path.localeCompare(right.path),
          );
          for (const file of files)
            desired.push({ ...file, owner: identity.canonical });
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
              .sort((left, right) =>
                left.component.localeCompare(right.component),
              ),
            ownedFiles: files
              .map(ownedFile)
              .sort((left, right) => left.path.localeCompare(right.path)),
            configDigest,
            formatDigest,
          };
          desired.push({
            path: descriptorPath,
            content: stableJson(descriptor),
            role: 'metadata',
            owner: identity.canonical,
          });
          descriptorPaths.push(descriptorPath);
        }),
      );

      const relevantObjectDescriptors = [...new Set(descriptorPaths)].sort();
      for (const transport of requested) {
        const path = transportDescriptorPath(transport);
        if ((await readText(root, path)) !== undefined) ownedPaths.add(path);
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

      const plan = await planRepositoryChanges(root, desired, ownedPaths);
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
