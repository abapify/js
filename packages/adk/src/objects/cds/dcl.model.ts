/**
 * DCL - CDS Access Control Definition Language Source (DCLS)
 *
 * ADK object for ABAP CDS Access Control (DCL) sources.
 * These are source-based objects stored at:
 *   GET/PUT /sap/bc/adt/acm/dcl/sources/<name>/source/main
 *
 * The metadata document is at:
 *   GET /sap/bc/adt/acm/dcl/sources/<name>
 *
 * Lock/activate/create follow the same patterns as DDL sources.
 */

import { getGlobalContext } from '../../base/global-context';
import type { AdkContext } from '../../base/context';
import { DclSource } from '../../base/kinds';
import { registerObjectType } from '../../base/registry';
import type { AdkCrudSourceContract } from './source-object';
import { AdkCrudSourceObject } from './crud-source-object';

interface DclMetadata {
  dclSource?: {
    description?: string;
    masterLanguage?: string;
    packageRef?: { name?: string };
  };
}

export class AdkDclSource extends AdkCrudSourceObject<DclMetadata> {
  static readonly kind = DclSource;
  readonly kind = AdkDclSource.kind;

  protected readonly objectType = 'DCLS';
  protected readonly endpoint = 'acm/dcl/sources';

  private get contract(): AdkCrudSourceContract {
    return this.ctx.client.adt.ddic.dcl.sources as AdkCrudSourceContract;
  }

  protected getMetadataKey(): 'dclSource' {
    return 'dclSource';
  }

  // ─── Static Factory Methods ─────────────────────────────────────────────────

  static async get(name: string, ctx?: AdkContext): Promise<AdkDclSource> {
    const context = AdkCrudSourceObject.resolveContext(ctx);
    const obj = new AdkDclSource(context, name);
    await obj.getSource();
    return obj;
  }

  static async exists(name: string, ctx?: AdkContext): Promise<boolean> {
    try {
      await AdkDclSource.get(name, ctx);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create a new CDS DCL source on SAP
   */
  static async create(
    name: string,
    description: string,
    packageName: string,
    options?: { transport?: string },
    ctx?: AdkContext,
  ): Promise<AdkDclSource> {
    const context = ctx ?? getGlobalContext();
    const nameU = name.toUpperCase();
    const pkgU = packageName.toUpperCase();

    await context.client.adt.ddic.dcl.sources.post(
      options?.transport ? { corrNr: options.transport } : {},
      {
        source: {
          name: nameU,
          description,
          language: 'EN',
          masterLanguage: 'EN',
          responsible: '$TMP',
          packageRef: {
            name: pkgU,
            type: 'DEVC/K',
            uri: `/sap/bc/adt/packages/${pkgU.toLowerCase()}`,
          },
        },
      } as never,
    );

    return new AdkDclSource(context, nameU);
  }

  static async delete(
    name: string,
    options?: { transport?: string; lockHandle?: string },
    ctx?: AdkContext,
  ): Promise<void> {
    const context = ctx ?? getGlobalContext();
    await context.client.adt.ddic.dcl.sources.delete(name.toUpperCase(), {
      ...(options?.transport ? { corrNr: options.transport } : {}),
      ...(options?.lockHandle ? { lockHandle: options.lockHandle } : {}),
    });
  }
}

registerObjectType('DCLS', DclSource, AdkDclSource, {
  endpoint: 'acm/dcl/sources',
});
