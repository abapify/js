/**
 * ADK v2 - Base Model
 * 
 * Abstract base class providing lazy loading infrastructure.
 * Object models extend this.
 */

import type { AdkContext } from './context';

/**
 * Base model with lazy loading and caching infrastructure
 */
export abstract class BaseModel {
  protected cache = new Map<string, unknown>();
  protected dirty = new Set<string>();
  
  constructor(protected readonly ctx: AdkContext) {}
  
  /**
   * Lazy load a segment - fetches only once, then cached
   */
  protected async lazy<T>(key: string, loader: () => Promise<T>): Promise<T> {
    if (!this.cache.has(key)) {
      this.cache.set(key, await loader());
    }
    return this.cache.get(key) as T;
  }
  
  /**
   * Set a cached value directly (for local/generated data)
   */
  protected set<T>(key: string, value: T): void {
    this.cache.set(key, value);
  }
  
  /**
   * Mark a segment as dirty (modified locally)
   */
  protected markDirty(key: string): void {
    this.dirty.add(key);
  }
  
  /**
   * Check if any segment (or specific segment) is dirty
   */
  isDirty(segment?: string): boolean {
    return segment ? this.dirty.has(segment) : this.dirty.size > 0;
  }
  
  /**
   * Clear cache for a segment (force reload on next access)
   */
  protected invalidate(key: string): void {
    this.cache.delete(key);
    this.dirty.delete(key);
  }
}
