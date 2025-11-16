import type { AdkObject, AdkObjectConstructor } from '../base/adk-object';
import { PackageAdtSchema, type PackagesType } from '@abapify/adt-schemas';
import { Kind } from '../registry/kinds';

/**
 * ABAP Package object
 *
 * OOP wrapper around adt-schemas PackagesType.
 * Delegates XML I/O to PackageAdtSchema.
 *
 * Adds hierarchical features:
 * - Child objects (classes, interfaces, domains)
 * - Subpackages
 * - Lazy loading support
 */
export class Package implements AdkObject {
  readonly kind = Kind.Package;

  private data: PackagesType;

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

  constructor(name: string, description?: string) {
    this.data = {
      name: name,
      type: 'DEVC/K',
      description: description,
    };
  }

  get name(): string {
    return this.data.name || '';
  }

  get type(): string {
    return this.data.type || 'DEVC/K';
  }

  get description(): string | undefined {
    return this.data.description;
  }

  /**
   * Get underlying data
   */
  getData(): PackagesType {
    return this.data;
  }

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
   * Serialize to ADT XML
   */
  toAdtXml(): string {
    return PackageAdtSchema.toAdtXml(this.data, { xmlDecl: true });
  }

  /**
   * Create instance from ADT XML
   */
  static fromAdtXml(xml: string): Package {
    const data = PackageAdtSchema.fromAdtXml(xml);
    const pkg = new Package(data.name || '', data.description);
    (pkg as any).data = data;
    return pkg;
  }
}

// Export constructor type for registry
export const PackageConstructor: AdkObjectConstructor<Package> = Package;
