/**
 * DEVC - ABAP Package
 *
 * ADK object for ABAP packages (DEVC).
 */

import { AdkObject } from '../../../base/model';
import { Package as PackageKind } from '../../../base/kinds';
import type { AbapObject } from '../../../base/types';
import type {
  AbapPackage,
  PackageAttributes,
  ObjectReference,
  ApplicationComponent,
  TransportConfig,
} from './devc.types';
import type { InferXsd } from 'ts-xsd';
import { packagesV1 } from '@abapify/adt-schemas-xsd';

/**
 * Package data from ADT/schema
 * Uses XSD-generated schema types for type safety
 */
type PackageData = InferXsd<typeof packagesV1, 'Package'>;

/**
 * ADK Package object
 */
export class AdkPackage extends AdkObject<typeof PackageKind, PackageData> implements AbapPackage {
  readonly kind = PackageKind;
  
  // ADT object URI
  get objectUri(): string { return `/sap/bc/adt/packages/${encodeURIComponent(this.name)}`; }
  
  // Additional properties (name/type from base class)
  // Note: These use dataSync - require load() first or will throw
  get description(): string { return this.dataSync.description; }
  get package(): string { return this.dataSync.superPackage?.name ?? ''; }
  
  // adtcore:* attributes
  get responsible(): string { return this.dataSync.responsible; }
  get masterLanguage(): string { return this.dataSync.masterLanguage; }
  get language(): string { return this.dataSync.language; }
  get version(): string { return this.dataSync.version; }
  get createdAt(): Date { return new Date(this.dataSync.createdAt); }
  get createdBy(): string { return this.dataSync.createdBy; }
  get changedAt(): Date { return new Date(this.dataSync.changedAt); }
  get changedBy(): string { return this.dataSync.changedBy; }
  
  // pak:* elements
  get attributes(): PackageAttributes {
    return {
      packageType: this.dataSync.attributes.packageType as PackageAttributes['packageType'],
      isEncapsulated: this.dataSync.attributes.isEncapsulated,
      isAddingObjectsAllowed: this.dataSync.attributes.isAddingObjectsAllowed,
      recordChanges: this.dataSync.attributes.recordChanges,
      languageVersion: this.dataSync.attributes.languageVersion,
    };
  }
  
  get superPackage(): ObjectReference | undefined {
    return this.dataSync.superPackage;
  }
  
  get applicationComponent(): ApplicationComponent | undefined {
    return this.dataSync.applicationComponent;
  }
  
  get transport(): TransportConfig | undefined {
    return this.dataSync.transport;
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
    // TODO: Implement via package service when available
    // const data = await this.ctx.services.packages.get(this.name);
    // this.setData(data);
    throw new Error('Package load not yet implemented');
  }
  
  // Lock/unlock inherited from AdkObject using generic lock service
}

// Backward compatibility alias (deprecated)
/** @deprecated Use AdkPackage instead */
export const AbapPackageModel = AdkPackage;
