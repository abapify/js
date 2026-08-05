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

export class AdkClassicBadiDefinition {
  static readonly kind = 'ClassicBadiDefinition' as const;
  readonly kind = AdkClassicBadiDefinition.kind;

  readonly name: string;
  protected readonly ctx: AdkContext;

  constructor(ctx: AdkContext, name: string) {
    this.ctx = ctx;
    this.name = name.toUpperCase();
  }

  get objectUri(): string {
    return `/sap/bc/adt/vit/wb/object_type/sxsdxd/object_name/${encodeURIComponent(this.name.toLowerCase())}`;
  }

  async getMetadata(): Promise<BasicObjectPropertiesResponse> {
    return await this.ctx.client.adt.vit.wb.objectProperties.getDefinition(
      this.name,
    );
  }

  static async get(
    name: string,
    ctx?: AdkContext,
  ): Promise<AdkClassicBadiDefinition> {
    const context = ctx ?? getGlobalContext();
    const obj = new AdkClassicBadiDefinition(context, name);
    await obj.getMetadata();
    return obj;
  }

  static async exists(name: string, ctx?: AdkContext): Promise<boolean> {
    try {
      await AdkClassicBadiDefinition.get(name, ctx);
      return true;
    } catch {
      return false;
    }
  }
}

export class AdkClassicBadiImplementation {
  static readonly kind = 'ClassicBadiImplementation' as const;
  readonly kind = AdkClassicBadiImplementation.kind;

  readonly name: string;
  protected readonly ctx: AdkContext;

  constructor(ctx: AdkContext, name: string) {
    this.ctx = ctx;
    this.name = name.toUpperCase();
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
    name: string,
    ctx?: AdkContext,
  ): Promise<AdkClassicBadiImplementation> {
    const context = ctx ?? getGlobalContext();
    const obj = new AdkClassicBadiImplementation(context, name);
    await obj.getMetadata();
    return obj;
  }

  static async exists(name: string, ctx?: AdkContext): Promise<boolean> {
    try {
      await AdkClassicBadiImplementation.get(name, ctx);
      return true;
    } catch {
      return false;
    }
  }
}
