import type {
  TransportSourceManifest,
  TransportSourceManifestObject,
} from '@abapify/adk';
import type { SourceVersionRef } from '@abapify/adt-client';
import type { FlowConfig } from '@abapify/adt-config';
import type { FormatPlugin } from '@abapify/adt-plugin';

export type FlowCheckoutMode = 'base' | 'head';

export type FlowErrorCode =
  | 'configuration_invalid'
  | 'format_unsupported'
  | 'manifest_inexact'
  | 'object_metadata_unavailable'
  | 'path_invalid'
  | 'path_collision'
  | 'working_tree_diverged'
  | 'apply_failed';

export class AdtFlowError extends Error {
  override readonly name = 'AdtFlowError';

  constructor(
    readonly code: FlowErrorCode,
    message: string,
    readonly details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
  }
}

export interface FlowObjectIdentity extends TransportSourceManifestObject {
  canonical: string;
}

export interface FlowObjectModel {
  object: unknown;
  packagePath: string[];
  applicationComponent?: string;
}

export interface FlowCheckoutDependencies {
  format: FormatPlugin;
  buildManifest(
    transports: string[],
    options: { objectTypes?: string[]; concurrency: number },
  ): Promise<TransportSourceManifest>;
  readSource(version: SourceVersionRef, maxBytes: number): Promise<string>;
  loadObject(object: FlowObjectIdentity): Promise<FlowObjectModel>;
}

export interface FlowCheckoutInput {
  root: string;
  transports: string[];
  mode?: FlowCheckoutMode;
  config: FlowConfig;
}

export interface FlowCheckoutResult {
  mode: FlowCheckoutMode;
  requestedTransports: string[];
  scopeTransports: string[];
  changed: string[];
  moved: Array<{ from: string; to: string }>;
  removed: string[];
  unchanged: string[];
  descriptors: string[];
  sapCalls: { manifest: number; metadata: number; source: number };
  fastPath: 'exact-head' | 'indexed-components' | 'none';
}
