/**
 * BDEF - Behavior Definition (RAP)
 *
 * ADK object for ABAP RAP Behavior Definitions (BDEF).
 * These are source-based objects (`.abdl`) stored at:
 *   GET /sap/bc/adt/bo/behaviordefinitions/<name>
 *   GET/PUT /sap/bc/adt/bo/behaviordefinitions/<name>/source/main
 *
 * Lock/activate/create follow the same patterns as other source objects
 * (DDL, DCL). The metadata document uses the shared `blue:blueSource`
 * wrapper — same envelope as TABL/STRUCT.
 *
 * This class intentionally mirrors `AdkDdlSource` (lightweight ADK object,
 * not a full AdkMainObject subclass) because BDEF metadata is source-driven
 * and the typical lifecycle is: create skeleton → PUT source → activate.
 */

import { getGlobalContext } from '../../../base/global-context';
import type { AdkContext } from '../../../base/context';
import { BehaviorDefinition } from '../../../base/kinds';
import { registerObjectType } from '../../../base/registry';
import type { AdkCrudSourceContract } from '../../cds/source-object';
import { AdkCrudSourceObject } from '../../cds/crud-source-object';

interface BdefMetadata {
  blueSource?: {
    description?: string;
    masterLanguage?: string;
    abapLanguageVersion?: string;
    packageRef?: { name?: string };
  };
}

export class AdkBehaviorDefinition extends AdkCrudSourceObject<BdefMetadata> {
  /** Static ADK kind marker — used by abapGit handler registry if needed. */
  static readonly kind = BehaviorDefinition;
  readonly kind = AdkBehaviorDefinition.kind;

  protected readonly objectType = 'BDEF';
  protected readonly endpoint = 'bo/behaviordefinitions';

  private get contract(): AdkCrudSourceContract {
    return this.ctx.client.adt.bo
      .behaviordefinitions as unknown as AdkCrudSourceContract;
  }

  protected getMetadataKey(): 'blueSource' {
    return 'blueSource';
  }

  // ─── Static Factory Methods ─────────────────────────────────────────────────

  /**
   * Get a BDEF (validates it exists by fetching source).
   */
  static async get(
    name: string,
    ctx?: AdkContext,
  ): Promise<AdkBehaviorDefinition> {
    const context = AdkCrudSourceObject.resolveContext(ctx);
    const obj = new AdkBehaviorDefinition(context, name);
    // Validate it exists by fetching source
    await obj.getSource();
    return obj;
  }

  static async exists(name: string, ctx?: AdkContext): Promise<boolean> {
    try {
      await AdkBehaviorDefinition.get(name, ctx);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create a new BDEF on SAP.
   *
   * POST /sap/bc/adt/bo/behaviordefinitions?corrNr=...
   * Body matches the `blue:blueSource` envelope (extends
   * abapsource:AbapSourceMainObject).
   */
  static async create(
    name: string,
    description: string,
    packageName: string,
    options?: { transport?: string },
    ctx?: AdkContext,
  ): Promise<AdkBehaviorDefinition> {
    const context = ctx ?? getGlobalContext();
    const nameU = name.toUpperCase();
    const pkgU = packageName.toUpperCase();

    await context.client.adt.bo.behaviordefinitions.post(
      options?.transport ? { corrNr: options.transport } : {},
      {
        blueSource: {
          name: nameU,
          type: 'BDEF/BDO',
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

    return new AdkBehaviorDefinition(context, nameU);
  }

  static async delete(
    name: string,
    options?: { transport?: string; lockHandle?: string },
    ctx?: AdkContext,
  ): Promise<void> {
    const context = ctx ?? getGlobalContext();
    await context.client.adt.bo.behaviordefinitions.delete(name.toUpperCase(), {
      ...(options?.transport ? { corrNr: options.transport } : {}),
      ...(options?.lockHandle ? { lockHandle: options.lockHandle } : {}),
    });
  }
}

registerObjectType('BDEF', BehaviorDefinition, AdkBehaviorDefinition, {
  endpoint: 'bo/behaviordefinitions',
});
