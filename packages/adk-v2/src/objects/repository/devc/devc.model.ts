/**
 * DEVC - ABAP Package Model
 * 
 * Internal implementation of AbapPackage interface.
 */

import { BaseModel } from '../../../base/model';
import type { AbapObject } from '../../../base/types';
import type { 
  AbapPackage, 
  PackageAttributes,
  ObjectReference,
  ApplicationComponent,
  TransportConfig,
} from './devc.types';

/**
 * Package data from ADT/schema
 * TODO: Replace with InferXsd<typeof PackageSchema> when contract ready
 */
interface PackageData {
  // adtcore:* attributes
  name: string;
  type: string;
  description: string;
  responsible: string;
  masterLanguage: string;
  language: string;
  version: string;
  createdAt: string;
  createdBy: string;
  changedAt: string;
  changedBy: string;
  
  // pak:* elements
  attributes: {
    packageType: string;
    isEncapsulated: boolean;
    isAddingObjectsAllowed: boolean;
    recordChanges: boolean;
    languageVersion: string;
  };
  superPackage?: {
    uri: string;
    type: string;
    name: string;
    description?: string;
  };
  applicationComponent?: {
    name: string;
    description: string;
  };
  transport?: {
    softwareComponent?: { name: string; description: string };
    transportLayer?: { name: string; description: string };
  };
}

/**
 * Internal implementation of AbapPackage
 */
export class AbapPackageModel extends BaseModel implements AbapPackage {
  readonly kind = 'Package' as const;
  
  constructor(
    ctx: import('../../../base/context').AdkContext,
    private readonly data: PackageData
  ) {
    super(ctx);
  }
  
  // AbapObject base properties
  get name(): string { return this.data.name; }
  get type(): string { return this.data.type; }
  get description(): string { return this.data.description; }
  get package(): string { return this.data.superPackage?.name ?? ''; }
  
  // adtcore:* attributes
  get responsible(): string { return this.data.responsible; }
  get masterLanguage(): string { return this.data.masterLanguage; }
  get language(): string { return this.data.language; }
  get version(): string { return this.data.version; }
  get createdAt(): Date { return new Date(this.data.createdAt); }
  get createdBy(): string { return this.data.createdBy; }
  get changedAt(): Date { return new Date(this.data.changedAt); }
  get changedBy(): string { return this.data.changedBy; }
  
  // pak:* elements
  get attributes(): PackageAttributes {
    return {
      packageType: this.data.attributes.packageType as PackageAttributes['packageType'],
      isEncapsulated: this.data.attributes.isEncapsulated,
      isAddingObjectsAllowed: this.data.attributes.isAddingObjectsAllowed,
      recordChanges: this.data.attributes.recordChanges,
      languageVersion: this.data.attributes.languageVersion,
    };
  }
  
  get superPackage(): ObjectReference | undefined {
    return this.data.superPackage;
  }
  
  get applicationComponent(): ApplicationComponent | undefined {
    return this.data.applicationComponent;
  }
  
  get transport(): TransportConfig | undefined {
    return this.data.transport;
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
}
