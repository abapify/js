/**
 * CLAS - ABAP Class
 *
 * ADK object for ABAP classes (CLAS).
 */

import { AdkMainObject } from '../../../base/model';
import { Class as ClassKind } from '../../../base/kinds';
import { getGlobalContext } from '../../../base/global-context';
import type { AdkContext } from '../../../base/context';
import type {
  AbapClass,
  ClassCategory,
  ClassVisibility,
  ClassInclude,
  ClassIncludeType,
  ObjectReference,
} from './clas.types';

// Import response type from ADT integration layer
import type { ClassResponse } from '../../../base/adt';

/**
 * Class data type - imported from contract
 * 
 * This ensures ADK always matches what the contract returns.
 * If contract changes schema (e.g., to extended version), ADK updates automatically.
 */
export type ClassXml = ClassResponse;

/**
 * ADK Class object
 * 
 * Inherits from AdkMainObject which provides:
 * - AdkObject: name, type, description, version, language, changedBy/At, createdBy/At, links
 * - AdkMainObject: package, packageRef, responsible, masterLanguage, masterSystem, abapLanguageVersion
 */
export class AdkClass extends AdkMainObject<typeof ClassKind, ClassXml> implements AbapClass {
  static readonly kind = ClassKind;
  readonly kind = AdkClass.kind;
  
  // ADT object URI
  get objectUri(): string { return `/sap/bc/adt/oo/classes/${encodeURIComponent(this.name.toLowerCase())}`; }
  
  // class:* attributes (class-specific, not inherited)
  get category(): ClassCategory { 
    return (this.dataSync.category ?? 'generalObjectType') as ClassCategory; 
  }
  get final(): boolean { return this.dataSync.final ?? false; }
  get abstract(): boolean { return this.dataSync.abstract ?? false; }
  get visibility(): ClassVisibility { 
    return (this.dataSync.visibility ?? 'public') as ClassVisibility; 
  }
  get sharedMemoryEnabled(): boolean { return this.dataSync.sharedMemoryEnabled ?? false; }
  
  // abapoo:* attributes
  get modeled(): boolean { return this.dataSync.modeled ?? false; }
  
  // abapsource:* attributes
  get fixPointArithmetic(): boolean { return this.dataSync.fixPointArithmetic ?? true; }
  get activeUnicodeCheck(): boolean { return this.dataSync.activeUnicodeCheck ?? true; }
  
  // References
  get superClassRef(): ObjectReference | undefined {
    const ref = this.dataSync.superClassRef;
    if (!ref?.name) return undefined;
    return {
      uri: ref.uri ?? '',
      type: ref.type ?? 'CLAS/OC',
      name: ref.name,
      description: ref.description,
    };
  }
  
  get messageClassRef(): ObjectReference | undefined {
    const ref = this.dataSync.messageClassRef;
    if (!ref?.name) return undefined;
    return {
      uri: ref.uri ?? '',
      type: ref.type ?? 'MSAG/N',
      name: ref.name,
      description: ref.description,
    };
  }
  
  override get packageRef(): ObjectReference | undefined {
    const ref = this.dataSync.packageRef;
    if (!ref?.name) return undefined;
    return {
      uri: ref.uri ?? '',
      type: ref.type ?? 'DEVC/K',
      name: ref.name,
      description: ref.description,
    };
  }
  
  // Includes
  get includes(): ClassInclude[] {
    const rawIncludes = this.dataSync.include ?? [];
    return rawIncludes.map(inc => ({
      includeType: (inc.includeType ?? 'main') as ClassIncludeType,
      sourceUri: inc.sourceUri ?? '',
      name: inc.name ?? '',
      type: inc.type ?? 'CLAS/I',
      version: inc.version ?? '',
      changedAt: inc.changedAt instanceof Date ? inc.changedAt : inc.changedAt ? new Date(inc.changedAt) : new Date(0),
      createdAt: inc.createdAt instanceof Date ? inc.createdAt : inc.createdAt ? new Date(inc.createdAt) : new Date(0),
      changedBy: inc.changedBy ?? '',
      createdBy: inc.createdBy ?? '',
    }));
  }
  
  // Lazy segments - source code
  
  async getMainSource(): Promise<string> {
    return this.lazy('source:main', async () => {
      return this.ctx.client.adt.oo.classes.source.main.get(this.name);
    });
  }
  
  async getIncludeSource(includeType: ClassIncludeType): Promise<string> {
    return this.lazy(`source:${includeType}`, async () => {
      switch (includeType) {
        case 'definitions':
          return this.ctx.client.adt.oo.classes.includes.definitions.get(this.name);
        case 'implementations':
          return this.ctx.client.adt.oo.classes.includes.implementations.get(this.name);
        case 'macros':
          return this.ctx.client.adt.oo.classes.includes.macros.get(this.name);
        default:
          return this.ctx.client.adt.oo.classes.includes.get(this.name, includeType);
      }
    });
  }
  
  async getDefinitions(): Promise<string> {
    return this.getIncludeSource('definitions');
  }
  
  async getImplementations(): Promise<string> {
    return this.getIncludeSource('implementations');
  }
  
  async getTestClasses(): Promise<string> {
    return this.getIncludeSource('testclasses');
  }
  
  // ============================================
  // Deferred Loading (implements abstract from AdkObject)
  // ============================================
  
  async load(): Promise<this> {
    const data = await this.ctx.client.adt.oo.classes.get(this.name);
    if (!data) {
      throw new Error(`Class '${this.name}' not found or returned empty response`);
    }
    this.setData(data as ClassXml);
    return this;
  }
  
  // ============================================
  // Static Factory Methods
  // ============================================
  
  /**
   * Get a class by name
   * 
   * @param name - Class name (e.g., 'ZCL_MY_CLASS')
   * @param ctx - Optional ADK context (uses global context if not provided)
   */
  static async get(name: string, ctx?: AdkContext): Promise<AdkClass> {
    const context = ctx ?? getGlobalContext();
    const cls = new AdkClass(context, name);
    await cls.load();
    return cls;
  }
}

// Backward compatibility alias (deprecated)
/** @deprecated Use AdkClass instead */
export const AbapClassModel = AdkClass;
