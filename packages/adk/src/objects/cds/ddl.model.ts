/**
 * DDL - CDS Data Definition Language Source (DDLS)
 *
 * ADK object for ABAP CDS Data Definition sources.
 * These are source-based objects stored at:
 *   GET/PUT /sap/bc/adt/ddic/ddl/sources/<name>/source/main
 *
 * The metadata document is at:
 *   GET /sap/bc/adt/ddic/ddl/sources/<name>
 *
 * Lock/activate/create follow the same patterns as other source objects.
 */

import { getGlobalContext } from '../../base/global-context';
import type { AdkContext } from '../../base/context';
import { DdlSource } from '../../base/kinds';
import { registerObjectType } from '../../base/registry';
import type { AdkCrudSourceContract } from './source-object';
import { AdkCrudSourceObject } from './crud-source-object';

interface DdlMetadata {
  ddlSource?: {
    description?: string;
    masterLanguage?: string;
    abapLanguageVersion?: string;
    packageRef?: { name?: string };
    source_origin?: string;
    source_type?: string;
  };
}

export class AdkDdlSource extends AdkCrudSourceObject<DdlMetadata> {
  static readonly kind = DdlSource;
  readonly kind = AdkDdlSource.kind;

  protected readonly objectType = 'DDLS';
  protected readonly endpoint = 'ddic/ddl/sources';

  private get contract(): AdkCrudSourceContract {
    return this.ctx.client.adt.ddic.ddl.sources as AdkCrudSourceContract;
  }

  protected getMetadataKey(): 'ddlSource' {
    return 'ddlSource';
  }

  get sourceOrigin(): string | undefined {
    return this.metadata?.ddlSource?.source_origin;
  }
  get sourceType(): string | undefined {
    return this.metadata?.ddlSource?.source_type;
  }

  // ─── Static Factory Methods ─────────────────────────────────────────────────

  /**
   * Get a DDL source (does not fetch metadata, just returns handle)
   */
  static async get(name: string, ctx?: AdkContext): Promise<AdkDdlSource> {
    return AdkCrudSourceObject.getSourceObject.call(
      this,
      name,
      ctx,
    ) as Promise<AdkDdlSource>;
  }

  static async exists(name: string, ctx?: AdkContext): Promise<boolean> {
    return AdkCrudSourceObject.sourceObjectExists.call(this, name, ctx);
  }

  /**
   * Create a new CDS DDL source on SAP
   *
   * POST /sap/bc/adt/ddic/ddl/sources?corrNr=...
   * Body matches the `ddl:source` schema (extends abapsource:AbapSourceMainObject).
   */
  static async create(
    name: string,
    description: string,
    packageName: string,
    options?: { transport?: string },
    ctx?: AdkContext,
  ): Promise<AdkDdlSource> {
    const context = ctx ?? getGlobalContext();
    const nameU = name.toUpperCase();
    const pkgU = packageName.toUpperCase();

    await context.client.adt.ddic.ddl.sources.post(
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

    return new AdkDdlSource(context, nameU);
  }

  static async delete(
    name: string,
    options?: { transport?: string; lockHandle?: string },
    ctx?: AdkContext,
  ): Promise<void> {
    const context = ctx ?? getGlobalContext();
    await context.client.adt.ddic.ddl.sources.delete(name.toUpperCase(), {
      ...(options?.transport ? { corrNr: options.transport } : {}),
      ...(options?.lockHandle ? { lockHandle: options.lockHandle } : {}),
    });
  }
}

registerObjectType('DDLS', DdlSource, AdkDdlSource, {
  endpoint: 'ddic/ddl/sources',
});
