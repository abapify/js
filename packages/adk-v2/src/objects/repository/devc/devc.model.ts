/**
 * DEVC - ABAP Package
 *
 * ADK object for ABAP packages (DEVC).
 */

import type { Package as PackageResponse } from '@abapify/adt-contracts';
import { AdkObject } from '../../../base/model';
import { Package as PackageKind } from '../../../base/kinds';
import { getGlobalContext } from '../../../base/global-context';
import type { AdkContext } from '../../../base/context';
import type { AbapObject } from '../../../base/types';
import type {
  AbapPackage,
  PackageAttributes,
  ObjectReference,
  ApplicationComponent,
  TransportConfig,
} from './devc.types';

/**
 * Package data type - inferred from packagesContract response
 * NonNullable ensures it satisfies AdkObjectData constraint (name & type required)
 * Re-exported for consumers who need the raw API response type
 */
export type PackageXml = NonNullable<PackageResponse>;

/**
 * ADK Package object
 */
export class AdkPackage extends AdkObject<typeof PackageKind, PackageXml> implements AbapPackage {
  readonly kind = PackageKind;
  
  // ADT object URI
  get objectUri(): string { return `/sap/bc/adt/packages/${encodeURIComponent(this.name)}`; }
  
  // Additional properties (name/type from base class)
  // Note: These use dataSync - require load() first or will throw
  get description(): string { return this.dataSync.description ?? ''; }
  get package(): string { return this.dataSync.superPackage?.name ?? ''; }
  
  // adtcore:* attributes
  get responsible(): string { return this.dataSync.responsible ?? ''; }
  get masterLanguage(): string { return this.dataSync.masterLanguage ?? ''; }
  get language(): string { return this.dataSync.language ?? ''; }
  get version(): string { return this.dataSync.version ?? ''; }
  get createdAt(): Date {
    const val = this.dataSync.createdAt;
    return val instanceof Date ? val : val ? new Date(val) : new Date(0);
  }
  get createdBy(): string { return this.dataSync.createdBy ?? ''; }
  get changedAt(): Date {
    const val = this.dataSync.changedAt;
    return val instanceof Date ? val : val ? new Date(val) : new Date(0);
  }
  get changedBy(): string { return this.dataSync.changedBy ?? ''; }
  
  // pak:* elements
  get attributes(): PackageAttributes {
    const attrs = this.dataSync.attributes;
    return {
      packageType: (attrs?.packageType ?? 'development') as PackageAttributes['packageType'],
      isEncapsulated: attrs?.isEncapsulated ?? false,
      isAddingObjectsAllowed: attrs?.isAddingObjectsAllowed ?? true,
      recordChanges: attrs?.recordChanges ?? false,
      languageVersion: attrs?.languageVersion ?? '',
    };
  }
  
  get superPackage(): ObjectReference | undefined {
    const sp = this.dataSync.superPackage;
    if (!sp?.name) return undefined;
    return {
      uri: sp.uri ?? '',
      type: sp.type ?? 'DEVC/K',
      name: sp.name,
      description: sp.description,
    };
  }
  
  get applicationComponent(): ApplicationComponent | undefined {
    const ac = this.dataSync.applicationComponent;
    if (!ac?.name) return undefined;
    return {
      name: ac.name,
      description: ac.description ?? '',
    };
  }
  
  get transport(): TransportConfig | undefined {
    const t = this.dataSync.transport;
    if (!t) return undefined;
    return {
      softwareComponent: t.softwareComponent?.name ? {
        name: t.softwareComponent.name,
        description: t.softwareComponent.description ?? '',
      } : undefined,
      transportLayer: t.transportLayer?.name ? {
        name: t.transportLayer.name,
        description: t.transportLayer.description ?? '',
      } : undefined,
    };
  }
  
  // Lazy segments
  
  async getSubpackages(): Promise<AbapPackage[]> {
    return this.lazy('subpackages', async () => {
      // TODO: Call client.repository.packages.children(this.name)
      return [];
    });
  }
  
  async getObjects(): Promise<AbapObject[]> {
    return this.lazy('objects', async () => {
      // TODO: Call client.repository.packages.objects(this.name)
      return [];
    });
  }
  
  async getAllObjects(): Promise<AbapObject[]> {
    return this.lazy('allObjects', async () => {
      const direct = await this.getObjects();
      const subpackages = await this.getSubpackages();
      
      const nested = await Promise.all(
        subpackages.map(pkg => pkg.getAllObjects())
      );
      
      return [...direct, ...nested.flat()];
    });
  }
  
  // ============================================
  // Deferred Loading (implements abstract from AdkObject)
  // ============================================
  
  async load(): Promise<this> {
    // Use packages service from context
    if (!this.ctx.services.packages) {
      throw new Error(
        'Package load requires packages service in context.\n' +
        'Ensure the ADT client provides services.packages when initializing ADK.'
      );
    }
    
    const data = await this.ctx.services.packages.get(this.name);
    if (!data) {
      throw new Error(`Package '${this.name}' not found or returned empty response`);
    }
    this.setData(data as PackageXml);
    return this;
  }
  
  // Lock/unlock inherited from AdkObject using generic lock service
  
  // ============================================
  // Static Factory Methods
  // ============================================
  
  /**
   * Get a package by name
   * 
   * @param name - Package name (e.g., '$TMP', 'ZPACKAGE')
   * @param ctx - Optional ADK context (uses global context if not provided)
   */
  static async get(name: string, ctx?: AdkContext): Promise<AdkPackage> {
    const context = ctx ?? getGlobalContext();
    const pkg = new AdkPackage(context, name);
    await pkg.load();
    return pkg;
  }
}

// Backward compatibility alias (deprecated)
/** @deprecated Use AdkPackage instead */
export const AbapPackageModel = AdkPackage;
