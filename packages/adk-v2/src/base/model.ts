/**
 * ADK v2 - Base Object
 * 
 * Abstract base class for all ADK objects.
 * Supports two construction patterns:
 * 1. Full data: new AdkObject(ctx, data)
 * 2. Deferred load: new AdkObject(ctx, 'OBJECT_NAME').load()
 * 
 * Provides lazy loading, caching, and automatic lock/unlock.
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
 * Base data contract for all ADK objects
 * All ADT objects have name and type (adtcore:name, adtcore:type)
 */
export interface AdkObjectData {
  name: string;
  type: string;
}

/**
 * Base class for all ADK objects
 * 
 * All ADK objects (AdkPackage, AdkTransportRequest, etc.) extend this.
 * Supports deferred loading - create with just a name, then call load().
 * 
 * @typeParam K - The object kind (from AdkKind)
 * @typeParam D - The internal data type (must have name & type)
 */
export abstract class AdkObject<K extends AdkKind = AdkKind, D extends AdkObjectData = AdkObjectData> {
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
      this._name = dataOrName.name;
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
    return this._data!;
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
    this._name = data.name;
  }

  // ============================================
  // Core Properties
  // ============================================

  /** ADT object name - available even before load() */
  get name(): string { return this._name; }
  
  /** ADT object type (adtcore:type, e.g. 'RQRQ', 'DEVC/K') - requires load() */
  get type(): string { return this.dataSync.type; }
  
  /** Check if object is currently locked */
  get isLocked(): boolean { return !!this._lockHandle; }
  
  /** Get current lock handle */
  get lockHandle(): LockHandle | undefined {
    return this._lockHandle;
  }
  
  /** 
   * Lock the object for modification
   * Uses generic lock service via objectUri
   */
  async lock(): Promise<LockHandle> {
    if (this._lockHandle) return this._lockHandle;
    
    const lockService = this.ctx.services.locks;
    if (!lockService) {
      throw new Error('Lock service not available in context');
    }
    
    this._lockHandle = await lockService.lock(this.objectUri);
    return this._lockHandle;
  }
  
  /** 
   * Unlock the object 
   * Uses generic lock service via objectUri
   */
  async unlock(): Promise<void> {
    if (!this._lockHandle) return;
    
    const lockService = this.ctx.services.locks;
    if (!lockService) {
      throw new Error('Lock service not available in context');
    }
    
    await lockService.unlock(this.objectUri, this._lockHandle);
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
  
  /** Lazy load a segment - fetches only once, then cached */
  protected async lazy<T>(key: string, loader: () => Promise<T>): Promise<T> {
    if (!this.cache.has(key)) {
      this.cache.set(key, await loader());
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
