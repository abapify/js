/**
 * SRVD - Service Definition (RAP)
 *
 * ADK object for ABAP RAP Service Definitions (SRVD).
 * Source-based objects (`.asrvd`) stored at:
 *   GET /sap/bc/adt/ddic/srvd/sources/<name>
 *   GET/PUT /sap/bc/adt/ddic/srvd/sources/<name>/source/main
 *
 * Lock/activate/create follow the same patterns as other source objects
 * (DDL, DCL, BDEF). Metadata envelope is the dedicated `srvd:source`
 * wrapper extending abapsource:AbapSourceMainObject (mirrors DDL).
 */

import { getGlobalContext } from '../../../base/global-context';
import type { AdkContext } from '../../../base/context';
import { ServiceDefinition } from '../../../base/kinds';
import { registerObjectType } from '../../../base/registry';
import type { AdkCrudSourceContract } from '../../cds/source-object';
import { AdkCrudSourceObject } from '../../cds/crud-source-object';

interface SrvdMetadata {
  srvdSource?: {
    description?: string;
    masterLanguage?: string;
    abapLanguageVersion?: string;
    packageRef?: { name?: string };
    sourceOrigin?: string;
    srvdSourceType?: string;
  };
}

export class AdkServiceDefinition extends AdkCrudSourceObject<SrvdMetadata> {
  /** Static ADK kind marker — used by abapGit handler registry if needed. */
  static readonly kind = ServiceDefinition;
  readonly kind = AdkServiceDefinition.kind;

  protected readonly objectType = 'SRVD';
  protected readonly endpoint = 'ddic/srvd/sources';

  private get contract(): AdkCrudSourceContract {
    return this.ctx.client.adt.ddic.srvd
      .sources as unknown as AdkCrudSourceContract;
  }

  protected getMetadataKey(): 'srvdSource' {
    return 'srvdSource';
  }

  get sourceOrigin(): string | undefined {
    return this.metadata?.srvdSource?.sourceOrigin;
  }

  get sourceType(): string | undefined {
    return this.metadata?.srvdSource?.srvdSourceType;
  }

  // ─── Static Factory Methods ─────────────────────────────────────────────────

  /**
   * Get a SRVD (validates it exists by fetching source).
   */
  static async get(
    name: string,
    ctx?: AdkContext,
  ): Promise<AdkServiceDefinition> {
    return AdkCrudSourceObject.getSourceObject.call(
      this,
      name,
      ctx,
    ) as Promise<AdkServiceDefinition>;
  }

  static async exists(name: string, ctx?: AdkContext): Promise<boolean> {
    return AdkCrudSourceObject.sourceObjectExists.call(this, name, ctx);
  }

  /**
   * Create a new SRVD on SAP.
   *
   * POST /sap/bc/adt/ddic/srvd/sources?corrNr=...
   * Body matches the `srvd:source` envelope (extends
   * abapsource:AbapSourceMainObject).
   */
  static async create(
    name: string,
    description: string,
    packageName: string,
    options?: { transport?: string },
    ctx?: AdkContext,
  ): Promise<AdkServiceDefinition> {
    const context = ctx ?? getGlobalContext();
    const nameU = name.toUpperCase();
    const pkgU = packageName.toUpperCase();

    await context.client.adt.ddic.srvd.sources.post(
      options?.transport ? { corrNr: options.transport } : {},
      {
        srvdSource: {
          name: nameU,
          type: 'SRVD/SRV',
          description,
          language: 'EN',
          masterLanguage: 'EN',
          responsible: pkgU,
          packageRef: {
            name: pkgU,
            type: 'DEVC/K',
            uri: `/sap/bc/adt/packages/${pkgU.toLowerCase()}`,
          },
        },
      } as never,
    );

    return new AdkServiceDefinition(context, nameU);
  }

  static async delete(
    name: string,
    options?: { transport?: string; lockHandle?: string },
    ctx?: AdkContext,
  ): Promise<void> {
    const context = ctx ?? getGlobalContext();
    await context.client.adt.ddic.srvd.sources.delete(name.toUpperCase(), {
      ...(options?.transport ? { corrNr: options.transport } : {}),
      ...(options?.lockHandle ? { lockHandle: options.lockHandle } : {}),
    });
  }
}

registerObjectType('SRVD', ServiceDefinition, AdkServiceDefinition, {
  endpoint: 'ddic/srvd/sources',
});
