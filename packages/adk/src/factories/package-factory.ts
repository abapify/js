import { Package } from '../objects/package';
import { AdkObject } from '../base/adk-object';

/**
 * Factory for creating ADK Package structures from ADT data
 * 
 * This factory builds hierarchical package structures with lazy loading,
 * converting flat ADT object lists into organized ADK models.
 */
export class AdkPackageFactory {
  /**
   * Create a package structure from ADT object list
   * 
   * @param objects - List of ADT objects with package information
   * @param rootPackageName - Root package name
   * @param rootDescription - Root package description (optional)
   * @returns Package with hierarchical structure
   */
  static async createPackageStructure(
    objects: Array<{ packageName: string; object: AdkObject }>,
    rootPackageName: string,
    rootDescription?: string
  ): Promise<Package> {
    const rootPackage = new Package(rootPackageName, rootDescription);
    
    // Group objects by package
    const packageMap = new Map<string, AdkObject[]>();
    const subpackageNames = new Set<string>();
    
    for (const { packageName, object } of objects) {
      const packageObjects = packageMap.get(packageName);
      if (packageObjects) {
        packageObjects.push(object);
      } else {
        packageMap.set(packageName, [object]);
      }
      
      // Track subpackages
      if (Package.isChildPackage(packageName, rootPackageName)) {
        subpackageNames.add(packageName);
      }
    }
    
    // Add objects to root package
    const rootObjects = packageMap.get(rootPackageName) || [];
    for (const obj of rootObjects) {
      rootPackage.addChild(obj);
    }
    
    // Create subpackages
    for (const subpackageName of subpackageNames) {
      const description = Package.deriveChildDescription(subpackageName, rootPackageName);
      const subpackage = new Package(subpackageName, description);
      
      // Add objects to subpackage
      const subpackageObjects = packageMap.get(subpackageName) || [];
      for (const obj of subpackageObjects) {
        subpackage.addChild(obj);
      }
      
      rootPackage.addSubpackage(subpackage);
    }
    
    // Mark as loaded
    await rootPackage.load();
    
    return rootPackage;
  }
  
  /**
   * Create a package with lazy loading callback
   * 
   * @param packageName - Package name
   * @param description - Package description (optional)
   * @param loadCallback - Callback to load package content
   * @returns Package with lazy loading configured
   */
  static createLazyPackage(
    packageName: string,
    description: string | undefined,
    loadCallback: () => Promise<void>
  ): Package {
    const pkg = new Package(packageName, description);
    pkg.setLoadCallback(loadCallback);
    return pkg;
  }
}
