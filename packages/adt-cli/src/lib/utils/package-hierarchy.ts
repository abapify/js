import type { ADK_Package } from '@abapify/adk';
import type { AdkObject } from '@abapify/adk';

/**
 * Build package hierarchy from flat list of packages
 * Uses existing ADK Package.addChild() and addSubpackage() methods
 */
export function buildPackageHierarchy(
  packages: ADK_Package[],
  objects: AdkObject[]
): ADK_Package[] {
  // Index packages by name for quick lookup
  const packageMap = new Map<string, ADK_Package>();
  for (const pkg of packages) {
    packageMap.set(pkg.name.toUpperCase(), pkg);
  }

  // Build parent-child relationships
  const rootPackages: ADK_Package[] = [];

  for (const pkg of packages) {
    // Get parent package name from data.superPackage
    const parentName = (pkg as any).data?.superPackage?.name?.toUpperCase();

    if (parentName && packageMap.has(parentName)) {
      // Has parent - add as subpackage
      const parent = packageMap.get(parentName)!;
      parent.addSubpackage(pkg);
    } else {
      // No parent - it's a root package
      rootPackages.push(pkg);
    }
  }

  // Assign objects to their packages
  console.log(`🔍 Assigning ${objects.length} objects to packages`);
  for (const obj of objects) {
    // Check for package in __package runtime property (set by import service)
    const packageName = (obj as any).__package?.toUpperCase();
    console.log(
      `🔍 Object ${obj.kind} ${obj.name} has package: ${packageName}`
    );
    if (packageName && packageMap.has(packageName)) {
      const pkg = packageMap.get(packageName)!;
      pkg.addChild(obj);
      console.log(`🔍   -> Added to package ${pkg.name}`);
    } else {
      console.log(
        `🔍   -> Package not found in map. Available:`,
        Array.from(packageMap.keys())
      );
    }
  }

  return rootPackages;
}

/**
 * Get all packages (flattened from hierarchy)
 */
export function flattenPackageHierarchy(
  rootPackages: ADK_Package[]
): ADK_Package[] {
  const allPackages: ADK_Package[] = [];

  function traverse(pkg: ADK_Package) {
    allPackages.push(pkg);
    for (const subpkg of pkg.subpackages) {
      traverse(subpkg);
    }
  }

  for (const root of rootPackages) {
    traverse(root);
  }

  return allPackages;
}

/**
 * Display package hierarchy as tree (for debugging)
 */
export function displayPackageTree(
  rootPackages: ADK_Package[],
  showObjects = false
): string {
  const lines: string[] = [];

  function traverse(pkg: ADK_Package, prefix: string, isLast: boolean) {
    const connector = isLast ? '└─ ' : '├─ ';
    const description = pkg.description ? ` - ${pkg.description}` : '';
    const objectInfo =
      pkg.children.length > 0 ? ` [${pkg.children.length} objects]` : '';

    lines.push(
      `${prefix}${connector}📦 ${pkg.name}${description}${objectInfo}`
    );

    const childPrefix = prefix + (isLast ? '   ' : '│  ');

    // Show objects if requested
    if (showObjects && pkg.children.length > 0) {
      for (let i = 0; i < pkg.children.length; i++) {
        const obj = pkg.children[i];
        const isLastObj =
          i === pkg.children.length - 1 && pkg.subpackages.length === 0;
        const objConnector = isLastObj ? '└─ ' : '├─ ';
        lines.push(`${childPrefix}${objConnector}${obj.kind} ${obj.name}`);
      }
    }

    // Recursively show subpackages
    for (let i = 0; i < pkg.subpackages.length; i++) {
      const subpkg = pkg.subpackages[i];
      const isLastChild = i === pkg.subpackages.length - 1;
      traverse(subpkg, childPrefix, isLastChild);
    }
  }

  for (let i = 0; i < rootPackages.length; i++) {
    const root = rootPackages[i];
    const isLast = i === rootPackages.length - 1;
    traverse(root, '', isLast);
  }

  return lines.join('\n');
}
