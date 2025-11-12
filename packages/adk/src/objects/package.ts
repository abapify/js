import { AdkObject } from '../base/adk-object';
import { Kind } from '../kind';

/**
 * Package - Represents an ABAP package with hierarchical structure
 * 
 * Supports:
 * - Child objects (classes, interfaces, domains, etc.)
 * - Subpackages (child packages)
 * - Lazy loading of object content
 * - Package descriptions
 */
export class Package implements AdkObject {
  readonly kind = Kind.Package;
  readonly type = 'DEVC/K';
  
  public name: string;
  public description?: string;
  
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
    this.name = name;
    this.description = description;
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
      return; // Already loaded
    }

    if (this._loadCallback) {
      await this._loadCallback();
      this._isLoaded = true;
    } else {
      // No callback means content is already set
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
   * Serialize to ADT XML format
   */
  toAdtXml(): string {
    // Package XML structure
    return `<?xml version="1.0" encoding="UTF-8"?>
<asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
    <DEVC>
      <DEVCLASS>${this.name}</DEVCLASS>
      <CTEXT>${this.description || this.name}</CTEXT>
    </DEVC>
  </asx:values>
</asx:abap>`;
  }

  /**
   * Derive description from package name for child packages
   * 
   * Child packages follow naming convention: PARENT_SUFFIX
   * This derives a description from the suffix.
   * 
   * @param packageName - Full package name
   * @param rootPackage - Root package name
   * @returns Derived description or undefined if not a child package
   */
  static deriveChildDescription(packageName: string, rootPackage: string): string | undefined {
    const pkgUpper = packageName.toUpperCase();
    const rootUpper = rootPackage.toUpperCase();
    
    // Check if this is a child package
    if (pkgUpper !== rootUpper && pkgUpper.startsWith(rootUpper + '_')) {
      const parts = packageName.split('_');
      const suffix = parts[parts.length - 1];
      // Capitalize first letter, lowercase rest
      return suffix.charAt(0).toUpperCase() + suffix.slice(1).toLowerCase();
    }
    
    return undefined;
  }

  /**
   * Check if a package is a child of another package
   * 
   * @param packageName - Package to check
   * @param rootPackage - Potential parent package
   * @returns True if packageName is a child of rootPackage
   */
  static isChildPackage(packageName: string, rootPackage: string): boolean {
    const pkgUpper = packageName.toUpperCase();
    const rootUpper = rootPackage.toUpperCase();
    
    return pkgUpper !== rootUpper && pkgUpper.startsWith(rootUpper + '_');
  }

  /**
   * Create Package from ADT XML
   */
  static fromAdtXml(xml: string): Package {
    // Simple XML parsing for package
    const nameMatch = xml.match(/<DEVCLASS>(.*?)<\/DEVCLASS>/);
    const descMatch = xml.match(/<CTEXT>(.*?)<\/CTEXT>/);
    
    const name = nameMatch ? nameMatch[1] : '';
    const description = descMatch ? descMatch[1] : undefined;
    
    return new Package(name, description);
  }
}

/**
 * Constructor type for Package
 */
export const PackageConstructor = Package;
