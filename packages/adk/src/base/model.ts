/**
 * ADK v2 - Base Object
 * 
 * Abstract base class for all ADK objects.
 * Supports two construction patterns:
 * 1. Full data: new AdkObject(ctx, data)
 * 2. Deferred load: new AdkObject(ctx, 'OBJECT_NAME').load()
 * 
 * Provides lazy loading, caching, and automatic lock/unlock.
 * 
 * Hierarchy (mirrors XSD):
 * - AdkObject (AdtObject) - base with name, type, links, description, version, etc.
 * - AdkMainObject (AdtMainObject) - adds packageRef, responsible, masterLanguage
 */

import type { AdkContext } from './context';
import type { AdkKind } from './kinds';

/**
 * Lock handle returned by lock operations
 */
export interface LockHandle {
  handle: string;
  correlationNumber?: string;
  correlationUser?: string;
}

/**
 * Atom link (from atom:link element)
 * Used for HATEOAS-style navigation in ADT responses
 */
export interface AtomLink {
  href: string;
  rel?: string;
  type?: string;
  title?: string;
  etag?: string;
}

/**
 * ADT object reference (adtcore:objectReference)
 */
export interface AdtObjectReference {
  uri?: string;
  name?: string;
  type?: string;
  description?: string;
  packageName?: string;
}

/**
 * Base data contract for all ADK objects
 * Matches XSD AdtObject type attributes and elements
 */
export interface AdkObjectData {
  // Required attributes
  name: string;
  type: string;
  // Optional AdtObject attributes
  description?: string;
  changedBy?: string;
  changedAt?: string | Date;
  createdBy?: string;
  createdAt?: string | Date;
  version?: string;
  language?: string;
  descriptionTextLimit?: number;
  // Optional AdtObject elements
  links?: AtomLink[];
  containerRef?: AdtObjectReference;
}

/**
 * Main object data contract (extends AdtObject)
 * Matches XSD AdtMainObject type
 */
export interface AdkMainObjectData extends AdkObjectData {
  packageRef?: AdtObjectReference;
  masterSystem?: string;
  masterLanguage?: string;
  responsible?: string;
  abapLanguageVersion?: string;
}

/**
 * Base class for all ADK objects
 * 
 * All ADK objects (AdkPackage, AdkTransportRequest, etc.) extend this.
 * Supports deferred loading - create with just a name, then call load().
 * 
 * Note: Uses loose type constraint for D to allow schema-inferred types
 * from contracts which may have different shapes. The getters safely
 * handle missing properties with defaults.
 * 
 * @typeParam K - The object kind (from AdkKind)
 * @typeParam D - The internal data type (typically schema-inferred from contract)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export abstract class AdkObject<K extends AdkKind = AdkKind, D = any> {
  /** Object kind identifier */
  abstract readonly kind: K;
  
  /** 
   * ADT object URI - base path for all operations.
   * Example: `/sap/bc/adt/cts/transportrequests/TRKORR`
   */
  abstract get objectUri(): string;
  
  protected readonly ctx: AdkContext;
  protected _data?: D;
  protected _name: string;
  protected cache = new Map<string, unknown>();
  protected dirty = new Set<string>();
  protected _lockHandle?: LockHandle;
  
  /**
   * Create ADK object
   * @param ctx - ADK context
   * @param dataOrName - Full data object OR just the object name for deferred loading
   */
  constructor(ctx: AdkContext, dataOrName: D | string) {
    this.ctx = ctx;
    if (typeof dataOrName === 'string') {
      // Deferred load - just store the name
      this._name = dataOrName;
    } else {
      // Full data provided
      this._data = dataOrName;
      // Cast to access name property which may exist on schema-inferred types
      this._name = (dataOrName as AdkObjectData).name;
    }
  }

  // ============================================
  // Deferred Loading Support
  // ============================================

  /**
   * Load data from SAP (for deferred loading pattern)
   * Subclasses must implement this to fetch their specific data
   * @returns this (for chaining)
   */
  abstract load(): Promise<this>;

  /** Whether data has been loaded */
  get isLoaded(): boolean {
    return !!this._data;
  }

  /** 
   * Get data - auto-loads if not already loaded
   * @returns Promise that resolves to the data
   */
  async data(): Promise<D> {
    if (!this._data) {
      await this.load();
    }
    // After load(), _data is guaranteed to be set
    return this._data as D;
  }

  /** 
   * Get data synchronously - throws if not loaded
   * Use when you know data is already loaded
   */
  get dataSync(): D {
    if (!this._data) {
      throw new Error(`${this.kind} '${this._name}' not loaded. Call load() or use data() instead.`);
    }
    return this._data;
  }

  /** Set data (for subclasses to use after loading) */
  protected setData(data: D): void {
    this._data = data;
    // Cast to access name property which may exist on schema-inferred types
    this._name = (data as AdkObjectData).name;
  }
  
  /** Helper to access data with AdkObjectData properties */
  private get coreData(): AdkObjectData {
    return this.dataSync as unknown as AdkObjectData;
  }

  // ============================================
  // Core Properties (adtcore:* attributes)
  // ============================================

  /** ADT object name (adtcore:name) - available even before load() */
  get name(): string { return this._name; }
  
  /** ADT object type (adtcore:type, e.g. 'RQRQ', 'DEVC/K') - requires load() */
  get type(): string { return this.coreData.type; }
  
  /** Description text (adtcore:description) */
  get description(): string { return this.coreData.description ?? ''; }
  
  /** Version state (adtcore:version) - active, inactive, etc. */
  get version(): string { return this.coreData.version ?? ''; }
  
  /** Current language (adtcore:language) */
  get language(): string { return this.coreData.language ?? ''; }
  
  /** User who last modified (adtcore:changedBy) */
  get changedBy(): string { return this.coreData.changedBy ?? ''; }
  
  /** Last modification timestamp (adtcore:changedAt) */
  get changedAt(): Date {
    const val = this.coreData.changedAt;
    return val instanceof Date ? val : val ? new Date(val) : new Date(0);
  }
  
  /** User who created (adtcore:createdBy) */
  get createdBy(): string { return this.coreData.createdBy ?? ''; }
  
  /** Creation timestamp (adtcore:createdAt) */
  get createdAt(): Date {
    const val = this.coreData.createdAt;
    return val instanceof Date ? val : val ? new Date(val) : new Date(0);
  }
  
  // ============================================
  // Links (atom:link elements)
  // ============================================
  
  /** All atom:link elements */
  get links(): AtomLink[] { return this.coreData.links ?? []; }
  
  /** Find link by rel attribute */
  getLink(rel: string): AtomLink | undefined {
    return this.links.find(l => l.rel === rel);
  }
  
  /** Get link href by rel, or undefined */
  getLinkHref(rel: string): string | undefined {
    return this.getLink(rel)?.href;
  }
  
  /** Container reference (adtcore:containerRef) */
  get containerRef(): AdtObjectReference | undefined {
    return this.coreData.containerRef;
  }
  
  // ============================================
  // Lock State
  // ============================================
  
  /** Check if object is currently locked */
  get isLocked(): boolean { return !!this._lockHandle; }
  
  /** Get current lock handle */
  get lockHandle(): LockHandle | undefined {
    return this._lockHandle;
  }
  
  /** 
   * Lock the object for modification
   * 
   * TODO: Implement via ADT lock API when contract is available
   * Uses: POST {objectUri}?_action=LOCK
   */
  async lock(): Promise<LockHandle> {
    if (this._lockHandle) return this._lockHandle;
    
    // TODO: Implement when lock contract is added to adt-client
    // For now, use client.fetch() as workaround
    const response = await this.ctx.client.fetch(`${this.objectUri}?_action=LOCK`, {
      method: 'POST',
      headers: { 'X-sap-adt-sessiontype': 'stateful' },
    });
    
    // Parse lock handle from response
    // Lock handle is typically in X-sap-adt-lock header or response body
    this._lockHandle = { handle: String(response) };
    return this._lockHandle;
  }
  
  /** 
   * Unlock the object 
   * 
   * TODO: Implement via ADT lock API when contract is available
   * Uses: POST {objectUri}?_action=UNLOCK
   */
  async unlock(): Promise<void> {
    if (!this._lockHandle) return;
    
    // TODO: Implement when lock contract is added to adt-client
    await this.ctx.client.fetch(`${this.objectUri}?_action=UNLOCK&lockHandle=${encodeURIComponent(this._lockHandle.handle)}`, {
      method: 'POST',
    });
    
    this._lockHandle = undefined;
  }
  
  /**
   * Set lock handle (for subclasses that need custom lock logic)
   */
  protected setLockHandle(handle: LockHandle | undefined): void {
    this._lockHandle = handle;
  }
  
  // ============================================
  // Caching Infrastructure
  // ============================================
  
  /** Lazy load a segment (async) - fetches only once, then cached */
  protected async lazy<T>(key: string, loader: () => Promise<T>): Promise<T> {
    if (!this.cache.has(key)) {
      this.cache.set(key, await loader());
    }
    return this.cache.get(key) as T;
  }
  
  /** Lazy compute a segment (sync) - computes only once, then cached */
  protected cached<T>(key: string, compute: () => T): T {
    if (!this.cache.has(key)) {
      this.cache.set(key, compute());
    }
    return this.cache.get(key) as T;
  }
  
  /** Set a cached value directly (for local/generated data) */
  protected set<T>(key: string, value: T): void {
    this.cache.set(key, value);
  }
  
  /** Mark a segment as dirty (modified locally) */
  protected markDirty(key: string): void {
    this.dirty.add(key);
  }
  
  /** Check if any segment (or specific segment) is dirty */
  isDirty(segment?: string): boolean {
    return segment ? this.dirty.has(segment) : this.dirty.size > 0;
  }
  
  /** Clear cache for a segment (force reload on next access) */
  protected invalidate(key: string): void {
    this.cache.delete(key);
    this.dirty.delete(key);
  }
}

// Re-export for backward compatibility (deprecated)
/** @deprecated Use AdkObject instead */
export const BaseModel = AdkObject;

/**
 * Base class for main development objects (AdtMainObject)
 * 
 * Extends AdkObject with package reference, responsible user, and master language.
 * Used for repository objects like classes, interfaces, packages, etc.
 * 
 * Note: Uses type assertions internally because schema-inferred types from
 * contracts may have different shapes than AdkMainObjectData. The getters
 * safely handle missing properties with defaults.
 * 
 * @typeParam K - The object kind (from AdkKind)
 * @typeParam D - The internal data type (typically schema-inferred from contract)
 */
export abstract class AdkMainObject<
  K extends AdkKind = AdkKind, 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  D = any
> extends AdkObject<K, D> {
  
  // Helper to access data with main object properties
  private get mainData(): AdkMainObjectData {
    return this.dataSync as unknown as AdkMainObjectData;
  }
  
  // ============================================
  // Main Object Properties (AdtMainObject additions)
  // ============================================
  
  /** Package reference (adtcore:packageRef) */
  get packageRef(): AdtObjectReference | undefined {
    return this.mainData.packageRef;
  }
  
  /** Package name (convenience getter) */
  get package(): string {
    return this.mainData.packageRef?.name ?? '';
  }
  
  /** Master system (adtcore:masterSystem) */
  get masterSystem(): string {
    return this.mainData.masterSystem ?? '';
  }
  
  /** Master language (adtcore:masterLanguage) */
  get masterLanguage(): string {
    return this.mainData.masterLanguage ?? '';
  }
  
  /** Responsible user (adtcore:responsible) */
  get responsible(): string {
    return this.mainData.responsible ?? '';
  }
  
  /** ABAP language version (adtcore:abapLanguageVersion) */
  get abapLanguageVersion(): string {
    return this.mainData.abapLanguageVersion ?? '';
  }
}
