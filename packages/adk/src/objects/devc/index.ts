import { PackageAdtSchema } from '@abapify/adt-schemas';
import type { PackagesType } from '@abapify/adt-schemas';

import type { AdkObject, AdkObjectConstructor } from '../../base/adk-object';
import { createAdkObject } from '../../base/class-factory';
import { Kind } from '../../registry';

/**
 * Base Package class from factory
 */
const BasePackage = createAdkObject(Kind.Package, PackageAdtSchema);

/**
 * ABAP Package object
 *
 * Extends base implementation with hierarchical features:
 * - Child objects (classes, interfaces, domains)
 * - Subpackages
 * - Lazy loading support
 */
export class Package extends BasePackage {
  /**
   * Child objects in this package
   */
  public children: AdkObject[] = [];

  /**
   * Subpackages (child packages)
   */
  public subpackages: Package[] = [];

  /**
   * Whether the package content has been loaded
   */
  private _isLoaded = false;

  /**
   * Lazy loading callback to fetch package content
   */
  private _loadCallback?: () => Promise<void>;

  /**
   * Check if package content is loaded
   */
  get isLoaded(): boolean {
    return this._isLoaded;
  }

  /**
   * Set lazy loading callback
   */
  setLoadCallback(callback: () => Promise<void>): void {
    this._loadCallback = callback;
  }

  /**
   * Load package content (triggers lazy loading)
   */
  async load(): Promise<void> {
    if (this._isLoaded) {
      return;
    }

    if (this._loadCallback) {
      await this._loadCallback();
      this._isLoaded = true;
    } else {
      this._isLoaded = true;
    }
  }

  /**
   * Add a child object to this package
   */
  addChild(object: AdkObject): void {
    this.children.push(object);
  }

  /**
   * Add a subpackage to this package
   */
  addSubpackage(subpackage: Package): void {
    this.subpackages.push(subpackage);
  }

  /**
   * Get package data with proper typing
   * Overrides base implementation to return PackagesType instead of unknown
   */
  override getData(): PackagesType {
    return super.getData() as PackagesType;
  }

  /**
   * Create Package instance from ADT XML
   * Overrides base implementation to return proper Package type with hierarchical features
   */
  static override fromAdtXml(xml: string): Package {
    const base = BasePackage.fromAdtXml(xml);
    const pkg = Object.create(Package.prototype);
    Object.assign(pkg, base);
    pkg.children = [];
    pkg.subpackages = [];
    return pkg;
  }
}

// Export constructor type for registry
export const PackageConstructor: AdkObjectConstructor<Package> = Package;
