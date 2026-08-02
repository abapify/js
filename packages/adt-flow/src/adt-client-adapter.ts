import {
  buildTransportSourceManifest,
  createAdk,
  type AdkFactory,
  type TransportSourceManifest,
} from '@abapify/adk';
import type { AdtClient, SourceVersionRef } from '@abapify/adt-client';
import type { FormatPlugin } from '@abapify/adt-plugin';
import { AdtFlowError, type FlowCheckoutDependencies } from './types';

interface LoadableModel {
  load(): Promise<unknown>;
  package?: unknown;
}

interface PackageModel extends LoadableModel {
  superPackage?: { name?: unknown };
  applicationComponent?: { name?: unknown };
}

export interface AdtFlowAdapterOperations {
  buildManifest(
    transports: string[],
    options: { selector?: { type?: string[] }; concurrency: number },
    context: { client: AdtClient },
  ): Promise<TransportSourceManifest>;
  createFactory(client: AdtClient): AdkFactory;
}

const DEFAULT_OPERATIONS: AdtFlowAdapterOperations = {
  buildManifest: buildTransportSourceManifest,
  createFactory: createAdk,
};

function loadable(value: unknown): value is LoadableModel {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { load?: unknown }).load === 'function'
  );
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim()
    ? value.trim().toUpperCase()
    : undefined;
}

export function repositoryType(pgmid: string, type: string): string {
  return pgmid.toUpperCase() === 'LIMU' && type.toUpperCase() === 'REPS'
    ? 'PROG'
    : type;
}

interface PackageFields {
  superPackage?: string;
  applicationComponent?: string;
}

/** Bind the pure flow service ports to one authenticated ADT client. */
export function createAdtFlowDependencies(
  client: AdtClient,
  format: FormatPlugin,
  operations: AdtFlowAdapterOperations = DEFAULT_OPERATIONS,
): FlowCheckoutDependencies {
  const factory = operations.createFactory(client);
  const modelCache = new Map<string, Promise<PackageModel>>();

  async function loadPackageModel(
    name: string,
  ): Promise<{ model: PackageModel; calls: number }> {
    let promise = modelCache.get(name);
    if (promise) {
      const model = await promise;
      return { model, calls: 0 };
    }
    promise = (async () => {
      const model = factory.get(name, 'DEVC/K');
      if (!loadable(model)) {
        throw new AdtFlowError(
          'object_metadata_unavailable',
          'ADT returned an unsupported package metadata model.',
        );
      }
      try {
        await model.load();
      } catch {
        throw new AdtFlowError(
          'sap_operation_failed',
          'SAP ADT package metadata retrieval failed.',
        );
      }
      return model as PackageModel;
    })();
    modelCache.set(name, promise);
    const model = await promise;
    return { model, calls: 1 };
  }

  function packageFields(model: PackageModel): PackageFields {
    return {
      superPackage: text(model.superPackage?.name),
      applicationComponent: text(model.applicationComponent?.name),
    };
  }

  async function packageContext(
    leafPackage: string,
  ): Promise<{ path: string[]; applicationComponent?: string; calls: number }> {
    const path: string[] = [];
    const seen = new Set<string>();
    let current: string | undefined = leafPackage;
    let applicationComponent: string | undefined;
    let calls = 0;

    while (current) {
      if (seen.has(current) || path.length >= 64) {
        throw new AdtFlowError(
          'object_metadata_unavailable',
          'The ADT package hierarchy is cyclic or exceeds the supported depth.',
        );
      }
      seen.add(current);
      path.unshift(current);

      const { model, calls: loadCalls } = await loadPackageModel(current);
      calls += loadCalls;
      const fields = packageFields(model);
      applicationComponent ??= fields.applicationComponent;
      current = fields.superPackage;
    }

    return {
      path,
      ...(applicationComponent ? { applicationComponent } : {}),
      calls,
    };
  }

  return {
    format,
    async buildManifest(transports, options) {
      try {
        return await operations.buildManifest(
          transports,
          {
            ...(options.objectTypes?.length
              ? { selector: { type: options.objectTypes } }
              : {}),
            concurrency: options.concurrency,
          },
          { client },
        );
      } catch {
        throw new AdtFlowError(
          'sap_operation_failed',
          'SAP ADT transport source-manifest construction failed.',
        );
      }
    },
    async readSource(version: SourceVersionRef, maxBytes: number) {
      try {
        return await client.services.sourceHistory.readVersionSourceBounded(
          version.sourceUri,
          maxBytes,
        );
      } catch {
        throw new AdtFlowError(
          'sap_operation_failed',
          'SAP ADT immutable source retrieval failed.',
        );
      }
    },
    async loadObject(identity) {
      const model = factory.get(
        identity.name,
        repositoryType(identity.pgmid, identity.type),
      );
      if (!loadable(model)) {
        throw new AdtFlowError(
          'object_metadata_unavailable',
          'ADT returned an unsupported object metadata model.',
          { object: identity.canonical },
        );
      }
      try {
        await model.load();
      } catch {
        throw new AdtFlowError(
          'sap_operation_failed',
          'SAP ADT object metadata retrieval failed.',
          { object: identity.canonical },
        );
      }
      const packageName = text(model.package) ?? text(identity.packageName);
      if (!packageName) {
        throw new AdtFlowError(
          'object_metadata_unavailable',
          'The object has no usable package assignment.',
          { object: identity.canonical },
        );
      }
      const context = await packageContext(packageName);
      return {
        object: model,
        packagePath: context.path,
        metadataCalls: context.calls + 1,
        ...(context.applicationComponent
          ? { applicationComponent: context.applicationComponent }
          : {}),
      };
    },
  };
}
