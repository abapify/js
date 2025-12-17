/**
 * INTF - ABAP Interface
 *
 * ADK object for ABAP interfaces (INTF).
 */

import { AdkMainObject } from '../../../base/model';
import { Interface as InterfaceKind } from '../../../base/kinds';
import { getGlobalContext } from '../../../base/global-context';
import type { AdkContext } from '../../../base/context';
import type { AbapInterface } from './intf.types';

// Import response type from ADT integration layer
import type { InterfaceResponse } from '../../../base/adt';

/**
 * Interface data type - imported from contract
 * 
 * The schema wraps everything in an 'abapInterface' element, so we unwrap it here
 * to provide a flat structure for ADK consumers.
 */
export type InterfaceXml = InterfaceResponse['abapInterface'];

/**
 * ADK Interface object
 * 
 * Inherits from AdkMainObject which provides:
 * - AdkObject: name, type, description, version, language, changedBy/At, createdBy/At, links
 * - AdkMainObject: package, packageRef, responsible, masterLanguage, masterSystem, abapLanguageVersion
 */
export class AdkInterface extends AdkMainObject<typeof InterfaceKind, InterfaceXml> implements AbapInterface {
  static readonly kind = InterfaceKind;
  readonly kind = AdkInterface.kind;
  
  // ADT object URI
  get objectUri(): string { return `/sap/bc/adt/oo/interfaces/${encodeURIComponent(this.name.toLowerCase())}`; }
  
  // abapoo:* attributes (interface-specific)
  get modeled(): boolean { return this.dataSync.modeled ?? false; }
  
  // abapsource:* attributes
  get sourceUri(): string { return this.dataSync.sourceUri ?? 'source/main'; }
  get fixPointArithmetic(): boolean { return this.dataSync.fixPointArithmetic ?? false; }
  get activeUnicodeCheck(): boolean { return this.dataSync.activeUnicodeCheck ?? false; }
  
  // packageRef is inherited from AdkMainObject
  
  // Lazy segments - source code
  
  async getSource(): Promise<string> {
    return this.lazy('source', async () => {
      return this.ctx.client.adt.oo.interfaces.source.main.get(this.name);
    });
  }
  
  // ============================================
  // Deferred Loading (implements abstract from AdkObject)
  // ============================================
  
  async load(): Promise<this> {
    const response = await this.ctx.client.adt.oo.interfaces.get(this.name);
    if (!response?.abapInterface) {
      throw new Error(`Interface '${this.name}' not found or returned empty response`);
    }
    // Unwrap the abapInterface element from the response
    this.setData(response.abapInterface);
    return this;
  }
  
  // ============================================
  // Static Factory Methods
  // ============================================
  
  /**
   * Get an interface by name
   * 
   * @param name - Interface name (e.g., 'ZIF_MY_INTERFACE')
   * @param ctx - Optional ADK context (uses global context if not provided)
   */
  static async get(name: string, ctx?: AdkContext): Promise<AdkInterface> {
    const context = ctx ?? getGlobalContext();
    const intf = new AdkInterface(context, name);
    await intf.load();
    return intf;
  }
}

// Backward compatibility alias (deprecated)
/** @deprecated Use AdkInterface instead */
export const AbapInterfaceModel = AdkInterface;

// Self-register with ADK registry
import { registerObjectType } from '../../../base/registry';
registerObjectType('INTF', InterfaceKind, AdkInterface);
