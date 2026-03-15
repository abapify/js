/**
 * PROG - ABAP Program
 *
 * ADK object for ABAP programs (PROG).
 */

import { AdkMainObject } from '../../../base/model';
import { Program as ProgramKind } from '../../../base/kinds';
import { getGlobalContext } from '../../../base/global-context';
import type { AdkContext } from '../../../base/context';

// Import response type from ADT integration layer
import type { ProgramResponse } from '../../../base/adt';

/**
 * Program data type - unwrap from root element
 *
 * The schema wraps everything in an 'abapProgram' element, so we unwrap it here
 * to provide a flat structure for ADK consumers.
 */
export type ProgramXml = ProgramResponse['abapProgram'];

/**
 * ADK Program object
 *
 * Inherits from AdkMainObject which provides:
 * - AdkObject: name, type, description, version, language, changedBy/At, createdBy/At, links
 * - AdkMainObject: package, packageRef, responsible, masterLanguage, masterSystem, abapLanguageVersion
 *
 * Access program-specific properties via `data`:
 * - data.programType, data.sourceUri, data.fixPointArithmetic, data.activeUnicodeCheck
 */
export class AdkProgram extends AdkMainObject<typeof ProgramKind, ProgramXml> {
  static readonly kind = ProgramKind;
  readonly kind = AdkProgram.kind;

  // ADT object URI (computed - not in data)
  get objectUri(): string {
    return `/sap/bc/adt/programs/programs/${encodeURIComponent(this.name.toLowerCase())}`;
  }

  // Lazy segments - source code

  async getSource(): Promise<string> {
    return this.lazy('source', async () => {
      return this.ctx.client.adt.programs.programs.source.main.get(this.name);
    });
  }

  // ============================================
  // Source Code Save Methods
  // ============================================

  /**
   * Save main source code
   * Requires object to be locked first
   */
  async saveMainSource(
    source: string,
    options?: { lockHandle?: string; transport?: string },
  ): Promise<void> {
    const params = new URLSearchParams();
    if (options?.lockHandle) params.set('lockHandle', options.lockHandle);
    if (options?.transport) params.set('corrNr', options.transport);

    await this.ctx.client.fetch(
      `/sap/bc/adt/programs/programs/${this.name.toLowerCase()}/source/main${params.toString() ? '?' + params.toString() : ''}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'text/plain' },
        body: source,
      },
    );
  }

  // savePendingSources, checkPendingSourcesUnchanged, hasPendingSources
  // all handled by the base class via objectUri + /source/main

  // ============================================
  // CRUD contract config - enables save()
  // ============================================

  protected override get wrapperKey() {
    return 'abapProgram';
  }
  // Note: `any` return type is intentional here — this is an established pattern
  // in the ADK codebase (see intf.model.ts). The base class defines
  // crudContract as `any` to support different contract structures per object type.
  protected override get crudContract(): any {
    return this.ctx.client.adt.programs.programs;
  }

  // ============================================
  // Static Factory Method
  // ============================================

  static async get(name: string, ctx?: AdkContext): Promise<AdkProgram> {
    const context = ctx ?? getGlobalContext();
    return new AdkProgram(context, name).load();
  }
}

// Self-register with ADK registry
import { registerObjectType } from '../../../base/registry';
registerObjectType('PROG', ProgramKind, AdkProgram);
