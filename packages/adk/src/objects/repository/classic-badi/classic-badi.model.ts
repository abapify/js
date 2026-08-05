/**
 * Classic BAdI — read-only ADK models for SXSD/XD and SXCI/XI metadata.
 *
 * Served via vit/wb Basic Object Properties:
 *   GET /sap/bc/adt/vit/wb/object_type/sxsdxd/object_name/{name}
 *   GET /sap/bc/adt/vit/wb/object_type/sxcixi/object_name/{name}
 */

import { getGlobalContext } from '../../../base/global-context';
import type { AdkContext } from '../../../base/context';
import type { BasicObjectPropertiesResponse } from '@abapify/adt-contracts';

interface ClassicBadiInput {
  name: string;
  ctx?: AdkContext;
}

function isNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { status?: unknown }).status === 404
  );
}

export class AdkClassicBadiDefinition {
  static readonly kind = 'ClassicBadiDefinition' as const;
  readonly kind = AdkClassicBadiDefinition.kind;

  readonly name: string;
  protected readonly ctx: AdkContext;

  constructor(input: { ctx: AdkContext; name: string }) {
    this.ctx = input.ctx;
    this.name = input.name.toUpperCase();
  }

  get objectUri(): string {
    return `/sap/bc/adt/vit/wb/object_type/sxsdxd/object_name/${encodeURIComponent(this.name.toLowerCase())}`;
  }

  async getMetadata(): Promise<BasicObjectPropertiesResponse> {
    return await this.ctx.client.adt.vit.wb.objectProperties.getDefinition(
      this.name,
    );
  }

  static async get(input: ClassicBadiInput): Promise<AdkClassicBadiDefinition> {
    const context = input.ctx ?? getGlobalContext();
    const obj = new AdkClassicBadiDefinition({
      ctx: context,
      name: input.name,
    });
    await obj.getMetadata();
    return obj;
  }

  static async exists(input: ClassicBadiInput): Promise<boolean> {
    try {
      await AdkClassicBadiDefinition.get(input);
      return true;
    } catch (error) {
      if (!isNotFound(error)) throw error;
      return false;
    }
  }
}

export class AdkClassicBadiImplementation {
  static readonly kind = 'ClassicBadiImplementation' as const;
  readonly kind = AdkClassicBadiImplementation.kind;

  readonly name: string;
  protected readonly ctx: AdkContext;

  constructor(input: { ctx: AdkContext; name: string }) {
    this.ctx = input.ctx;
    this.name = input.name.toUpperCase();
  }

  get objectUri(): string {
    return `/sap/bc/adt/vit/wb/object_type/sxcixi/object_name/${encodeURIComponent(this.name.toLowerCase())}`;
  }

  async getMetadata(): Promise<BasicObjectPropertiesResponse> {
    return await this.ctx.client.adt.vit.wb.objectProperties.getImplementation(
      this.name,
    );
  }

  static async get(
    input: ClassicBadiInput,
  ): Promise<AdkClassicBadiImplementation> {
    const context = input.ctx ?? getGlobalContext();
    const obj = new AdkClassicBadiImplementation({
      ctx: context,
      name: input.name,
    });
    await obj.getMetadata();
    return obj;
  }

  static async exists(input: ClassicBadiInput): Promise<boolean> {
    try {
      await AdkClassicBadiImplementation.get(input);
      return true;
    } catch (error) {
      if (!isNotFound(error)) throw error;
      return false;
    }
  }
}
