import { adtClient } from '../../shared/clients';
import type { ADTObjectInfo } from '@abapify/adt-client';
import { ObjectRegistry } from '../../objects/registry';
import { FormatRegistry } from '../../formats/format-registry';
import { IconRegistry } from '../../utils/icon-registry';
import { ConfigLoader } from '../../config/loader';
import { PackageMapper } from '../../config/package-mapper';
import { loadFormatPlugin } from '../../utils/format-loader';
import {
  buildPackageHierarchy,
  displayPackageTree,
} from '../../utils/package-hierarchy';
import type { ADK_Package } from '@abapify/adk';

export interface ImportOptions {
  packageName: string;
  outputPath: string;
  objectTypes?: string[]; // ['CLAS', 'INTF', 'DDLS'] or undefined (all supported)
  includeSubpackages?: boolean;
  format?: string; // 'oat', 'abapgit', 'json', etc.
  debug?: boolean;
}

export interface TransportImportOptions {
  transportNumber: string;
  outputPath: string;
  objectTypes?: string[]; // ['CLAS', 'INTF', 'DDLS'] or undefined (all supported)
  format?: string; // 'oat', 'abapgit', 'json', etc.
  debug?: boolean;
}

export interface TransportImportOptions {
  transportNumber: string;
  outputPath: string;
  objectTypes?: string[]; // ['CLAS', 'INTF', 'DDLS'] or undefined (all supported)
  format?: string; // 'oat', 'abapgit', 'json', etc.
  debug?: boolean;
}

export interface ImportResult {
  packageName?: string;
  transportNumber?: string;
  description: string;
  totalObjects: number;
  processedObjects: number;
  objectsByType: Record<string, number>;
  outputPath: string;
}

export class ImportService {
  private packageMapper?: PackageMapper;

  constructor() {
    // Transport operations now use the shared adtClient
  }

  async importPackage(options: ImportOptions): Promise<ImportResult> {
    if (options.debug) {
      console.log(`🔍 Importing package: ${options.packageName}`);
      console.log(`📁 Output path: ${options.outputPath}`);
      console.log(`🎯 Format: ${options.format || 'oat'}`);
    }

    // Load config and set up package mapping
    const configLoader = new ConfigLoader();
    const config = await configLoader.load();

    // Check for package mapping in format plugin options
    const formatName = options.format || 'oat';
    const formatPlugin = config.plugins?.formats?.find(
      (p) => p.name === formatName
    );
    const packageMapping = formatPlugin?.config?.options?.packageMapping;

    if (packageMapping) {
      this.packageMapper = new PackageMapper(packageMapping);
      if (options.debug) {
        console.log(`⚙️ Package mapping configured`);
      }
    }

    try {
      // Discover all objects in package using SearchService
      if (options.debug) {
        console.log(`📦 Discovering package: ${options.packageName}`);
      }

      // Use search with package filter instead of getPackageContents
      const searchResult = await adtClient.repository.searchObjectsDetailed({
        operation: 'quickSearch',
        packageName: options.packageName,
        maxResults: 1000,
      });

      if (options.debug) {
        console.log(`✅ Found ${searchResult.totalCount} total objects`);
      }

      // Set up output directory and get plugin
      const fs = require('fs');
      const baseDir = options.outputPath;
      fs.mkdirSync(baseDir, { recursive: true });

      const format = options.format || 'oat';

      // Try dynamic loading first (supports @abapify/... and shortcuts like 'oat', 'abapgit')
      // Fall back to FormatRegistry for backward compatibility
      let formatHandler: any;
      try {
        if (
          format.startsWith('@') ||
          format === 'oat' ||
          format === 'abapgit'
        ) {
          // Use dynamic loading for package names and shortcuts
          const plugin = await loadFormatPlugin(format);
          formatHandler = plugin.instance;
        } else {
          // Fall back to static registry for other formats
          formatHandler = FormatRegistry.get(format);
        }
      } catch (error) {
        // If dynamic loading fails, try static registry as fallback
        if (FormatRegistry.isSupported(format)) {
          formatHandler = FormatRegistry.get(format);
        } else {
          throw error;
        }
      }

      if (options.debug) {
        console.log(
          `🎨 Using format: ${formatHandler.name} - ${formatHandler.description}`
        );
      }

      // Filter objects based on both format support and ADT handler support
      const objectsToProcess = searchResult.objects.filter((obj) => {
        // Check format support (new plugins may not have getSupportedObjectTypes)
        const supportedByFormat = formatHandler.getSupportedObjectTypes
          ? formatHandler.getSupportedObjectTypes().includes(obj.type)
          : true; // New ADK-aware plugins support all ADT-supported types
        const supportedByADT = ObjectRegistry.isSupported(obj.type);
        const includeByOptions = this.shouldIncludeObject(obj, options);

        return supportedByFormat && supportedByADT && includeByOptions;
      });

      // Show compact progress info
      const objectCounts = objectsToProcess.reduce((counts, obj) => {
        counts[obj.type] = (counts[obj.type] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);

      const objectSummary = Object.entries(objectCounts)
        .map(
          ([type, count]) =>
            `${count} ${type.toLowerCase()}${count > 1 ? 's' : ''}`
        )
        .join(', ');

      console.log(`📦 Importing package ${options.packageName}`);

      // Show what will actually be imported (scalable for many types)
      if (Object.keys(objectCounts).length <= 3) {
        // Simple format for few types
        console.log(
          `🔍 Importing ${objectsToProcess.length} objects: ${objectSummary}`
        );
      } else {
        // Structured format for many types
        console.log(`🔍 Importing ${objectsToProcess.length} objects:`);
        Object.entries(objectCounts).forEach(([type, count]) => {
          const icon = IconRegistry.getIcon(type);
          console.log(`   ${icon} ${type}: ${count}`);
        });
      }

      // Format preprocessing
      if (formatHandler.beforeImport) {
        await formatHandler.beforeImport(baseDir);
      }

      // Check if format supports ADK objects (either new per-object or legacy bulk API)
      const supportsAdkObjects =
        typeof formatHandler.serializeObject === 'function' ||
        typeof formatHandler.serializeAdkObjects === 'function';

      const objectsByType: Record<string, number> = {};
      let processedCount = 0;
      const allResults: any[] = [];

      if (supportsAdkObjects) {
        // New path: Use ADK objects with package hierarchy
        const packages: ADK_Package[] = [];
        const objects: any[] = [];

        // Step 1: Fetch unique packages as proper ADK Package objects
        const uniquePackages = new Set<string>();
        for (const obj of objectsToProcess) {
          uniquePackages.add(obj.packageName);
        }

        if (options.debug) {
          console.log(`📦 Fetching ${uniquePackages.size} unique packages...`);
        }

        for (const packageName of uniquePackages) {
          try {
            const handler = ObjectRegistry.get('DEVC') as any;
            if (typeof handler.getAdkObject === 'function') {
              const packageAdkObject = (await handler.getAdkObject(
                packageName
              )) as ADK_Package;

              // Note: Package parent relationship is in data.superPackage (from ADT XML)
              // Package mapping is handled by the hierarchy builder

              packages.push(packageAdkObject);
              objectsByType['DEVC'] = (objectsByType['DEVC'] || 0) + 1;
              processedCount++;
            }
          } catch (error) {
            console.log(
              `⚠️ Failed to fetch package ${packageName}: ${
                error instanceof Error ? error.message : String(error)
              }`
            );
          }
        }

        // Step 2: Fetch all objects
        if (options.debug) {
          console.log(`📄 Fetching ${objectsToProcess.length} objects...`);
        }

        for (const obj of objectsToProcess) {
          try {
            const handler = ObjectRegistry.get(obj.type) as any;

            if (typeof handler.getAdkObject === 'function') {
              const adkObject = await handler.getAdkObject(obj.name);

              // Apply package mapping if configured
              const localPackageName = this.packageMapper
                ? this.packageMapper.toLocal(obj.packageName)
                : obj.packageName.toLowerCase();

              // Attach package information to the ADK object (extend with runtime property)
              (adkObject as any).__package = localPackageName;
              console.log(
                `🔍 Fetched ${adkObject.kind} ${adkObject.name}, assigned package: ${localPackageName}`
              );

              objects.push(adkObject);
              objectsByType[obj.type] = (objectsByType[obj.type] || 0) + 1;
              processedCount++;
            } else {
              console.log(
                `⚠️ Handler for ${obj.type} doesn't support ADK objects, skipping ${obj.name}`
              );
            }
          } catch (error) {
            console.log(
              `⚠️ Failed to process ${obj.type} ${obj.name}: ${
                error instanceof Error ? error.message : String(error)
              }`
            );
          }
        }

        // Step 3: Build package hierarchy (packages now have children/subpackages populated)
        const rootPackages = buildPackageHierarchy(packages, objects);

        if (options.debug) {
          console.log(
            `\n🌳 Package hierarchy:\n${displayPackageTree(
              rootPackages,
              true
            )}\n`
          );
        }

        // Step 4: CLI iterates tree and calls plugin for each object
        const allFilesCreated: string[] = [];
        let currentIndex = 0;
        const totalObjects = objects.length;

        try {
          // Debug: Check plugin capabilities
          console.log('🔍 DEBUG: formatHandler type:', typeof formatHandler);
          console.log('🔍 DEBUG: formatHandler.name:', formatHandler.name);
          console.log(
            '🔍 DEBUG: Has serializeObject?',
            typeof formatHandler.serializeObject === 'function'
          );
          console.log(
            '🔍 DEBUG: Has serializeAdkObjects?',
            typeof formatHandler.serializeAdkObjects === 'function'
          );
          console.log(
            '🔍 DEBUG: Available methods:',
            Object.keys(formatHandler).filter(
              (k) => typeof (formatHandler as any)[k] === 'function'
            )
          );

          // Serialize using per-object iteration
          if (typeof formatHandler.serializeObject === 'function') {
            console.log('✅ Using per-object serialization');
            // CLI owns iteration logic
            await this.serializeWithIteration(
              rootPackages,
              formatHandler,
              baseDir,
              totalObjects,
              currentIndex,
              allFilesCreated
            );
          } else {
            throw new Error('Plugin does not implement serializeObject method');
          }
        } catch (error) {
          console.log(
            `⚠️ Failed to serialize: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      } else {
        // Old path: Use traditional object data
        for (const obj of objectsToProcess) {
          try {
            // Get object data from ADT using object handler
            const handler = ObjectRegistry.get(obj.type);
            const objectData = await handler.read(obj.name);

            // Merge description and package from search result
            objectData.description = obj.description || objectData.description;

            // Apply package mapping if configured
            const localPackageName = this.packageMapper
              ? this.packageMapper.toLocal(obj.packageName)
              : obj.packageName.toLowerCase();
            objectData.package = localPackageName;

            // Format handler serializes the object data
            const formatResult = await formatHandler.serialize(
              objectData,
              obj.type,
              baseDir
            );
            allResults.push(formatResult);

            // Track statistics
            objectsByType[obj.type] = (objectsByType[obj.type] || 0) + 1;
            processedCount++;
          } catch (error) {
            console.log(
              `⚠️ Failed to process ${obj.type} ${obj.name}: ${
                error instanceof Error ? error.message : String(error)
              }`
            );
          }
        }
      }

      // Format post-processing
      if (formatHandler.afterImport) {
        const totalResult = {
          filesCreated: allResults.flatMap((r) => r.filesCreated),
          objectsProcessed: processedCount,
        };
        await formatHandler.afterImport(baseDir, totalResult);
      }

      console.log(`✅ Import complete`);

      return {
        packageName: options.packageName,
        description: `Package ${options.packageName}`,
        totalObjects: searchResult.totalCount,
        processedObjects: processedCount,
        objectsByType,
        outputPath: baseDir,
      };
    } catch (error) {
      throw new Error(
        `Import failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  async importTransport(
    options: TransportImportOptions
  ): Promise<ImportResult> {
    if (options.debug) {
      console.log(`🔍 Importing transport: ${options.transportNumber}`);
      console.log(`📁 Output path: ${options.outputPath}`);
      console.log(`🎯 Format: ${options.format || 'oat'}`);
    }

    // Load config and set up package mapping
    const configLoader = new ConfigLoader();
    const config = await configLoader.load();

    // Check for package mapping in format plugin options
    const formatName = options.format || 'oat';
    const formatPlugin = config.plugins?.formats?.find(
      (p) => p.name === formatName
    );
    const packageMapping = formatPlugin?.config?.options?.packageMapping;

    if (packageMapping) {
      this.packageMapper = new PackageMapper(packageMapping);
      if (options.debug) {
        console.log(`⚙️ Package mapping configured`);
      }
    }

    try {
      // Get transport details and objects
      if (options.debug) {
        console.log(`🚛 Getting transport details: ${options.transportNumber}`);
      }

      // Get transport objects using the client's transport service
      const transportObjects = await adtClient.cts.getTransportObjects(
        options.transportNumber
      );

      // Convert TransportObject[] to ADTObjectInfo[] format expected by the rest of the system
      const searchObjects: ADTObjectInfo[] = transportObjects.map((obj) => ({
        name: obj.name,
        type: obj.type,
        description: obj.description,
        packageName: obj.packageName,
        uri: obj.uri,
        fullType: obj.fullType,
      }));

      if (options.debug) {
        console.log(
          `✅ Extracted ${searchObjects.length} objects from transport`
        );
      }

      // Set up output directory and get plugin
      const fs = require('fs');
      const baseDir = options.outputPath;
      fs.mkdirSync(baseDir, { recursive: true });

      const format = options.format || 'oat';
      const formatHandler = FormatRegistry.get(format);

      if (options.debug) {
        console.log(
          `🎨 Using format: ${formatHandler.name} - ${formatHandler.description}`
        );
      }

      // Filter objects based on both format support and ADT handler support
      const objectsToProcess = searchObjects.filter((obj) => {
        const supportedByFormat = formatHandler
          .getSupportedObjectTypes()
          .includes(obj.type);
        const supportedByADT = ObjectRegistry.isSupported(obj.type);
        const includeByOptions = this.shouldIncludeObjectForTransport(
          obj,
          options
        );

        return supportedByFormat && supportedByADT && includeByOptions;
      });

      // Show compact progress info
      const objectCounts = objectsToProcess.reduce((counts, obj) => {
        counts[obj.type] = (counts[obj.type] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);

      const objectSummary = Object.entries(objectCounts)
        .map(
          ([type, count]) =>
            `${count} ${type.toLowerCase()}${count > 1 ? 's' : ''}`
        )
        .join(', ');

      console.log(`🚛 Importing transport ${options.transportNumber}`);

      // Show what will actually be imported (scalable for many types)
      if (Object.keys(objectCounts).length <= 3) {
        // Simple format for few types
        console.log(
          `🔍 Importing ${objectsToProcess.length} objects: ${objectSummary}`
        );
      } else {
        // Structured format for many types
        console.log(`🔍 Importing ${objectsToProcess.length} objects:`);
        Object.entries(objectCounts).forEach(([type, count]) => {
          const icon = IconRegistry.getIcon(type);
          console.log(`   ${icon} ${type}: ${count}`);
        });
      }

      // Format preprocessing
      if (formatHandler.beforeImport) {
        await formatHandler.beforeImport(baseDir);
      }

      // Check if format supports ADK objects (either new per-object or legacy bulk API)
      const supportsAdkObjects =
        typeof formatHandler.serializeObject === 'function' ||
        typeof formatHandler.serializeAdkObjects === 'function';

      const objectsByType: Record<string, number> = {};
      let processedCount = 0;
      const allResults: any[] = [];

      if (supportsAdkObjects) {
        // New path: Use ADK objects
        const adkObjects: any[] = [];

        // Build a map of package descriptions from search results
        // Search results include child packages with their descriptions
        const packageDescriptions = new Map<string, string>();
        console.log(`🔍 DEBUG: Building package descriptions map...`);
        console.log(
          `🔍 DEBUG: Total objects in search: ${searchObjects.length}`
        );
        const devcObjects = searchObjects.filter(
          (o: any) => o.type === 'DEVC/K'
        );
        console.log(`🔍 DEBUG: DEVC/K objects: ${devcObjects.length}`);
        devcObjects.forEach((o: any) =>
          console.log(
            `  📦 ${o.name}: type="${o.type}" desc="${o.description}"`
          )
        );

        for (const obj of searchObjects) {
          if (obj.type === 'DEVC/K' && obj.description) {
            packageDescriptions.set(obj.name, obj.description);
            console.log(`✅ Added: ${obj.name} = "${obj.description}"`);
          }
        }
        console.log(
          `📦 DEBUG: Map size: ${packageDescriptions.size}, keys: ${Array.from(
            packageDescriptions.keys()
          ).join(', ')}`
        );

        // First, collect all unique packages from the objects
        const uniquePackages = new Set<string>();
        for (const obj of objectsToProcess) {
          uniquePackages.add(obj.packageName);
        }

        // Fetch Package objects for all unique packages
        for (const packageName of uniquePackages) {
          try {
            // Create a Package ADK object
            const packageAdkObject = {
              kind: 'Package',
              name: packageName,
              description: '', // Will be set from search results or ADT
              spec: {
                core: {
                  package: packageName,
                  description: '',
                },
              },
            };

            // Try to get description from search results first (includes child packages)
            const descriptionFromSearch = packageDescriptions.get(packageName);
            if (descriptionFromSearch) {
              console.log(
                `📦 Package ${packageName}: description="${descriptionFromSearch}" (from search)`
              );
              packageAdkObject.description = descriptionFromSearch;
              packageAdkObject.spec.core.description = descriptionFromSearch;
            } else {
              // Fallback: try to fetch from ADT (for root package or if not in search)
              try {
                const packageInfo = await adtClient.repository.getPackage(
                  packageName
                );
                console.log(
                  `📦 Package ${packageName}: description="${packageInfo.description}" (from ADT)`
                );
                packageAdkObject.description = packageInfo.description;
                packageAdkObject.spec.core.description =
                  packageInfo.description;
              } catch (error) {
                // Final fallback: use package name
                console.log(
                  `⚠️  No description found for package ${packageName}, using package name as fallback`
                );
                packageAdkObject.description = packageName;
                packageAdkObject.spec.core.description = packageName;
              }
            }

            adkObjects.push(packageAdkObject);
            objectsByType['DEVC'] = (objectsByType['DEVC'] || 0) + 1;
            processedCount++;
          } catch (error) {
            console.log(
              `⚠️ Failed to process package ${packageName}: ${
                error instanceof Error ? error.message : String(error)
              }`
            );
          }
        }

        for (const obj of objectsToProcess) {
          try {
            const handler = ObjectRegistry.get(obj.type);

            // Check if handler supports getAdkObject
            if (typeof handler.getAdkObject === 'function') {
              const adkObject = await handler.getAdkObject(obj.name);

              // Merge description and package from transport result
              if (adkObject.spec && adkObject.spec.core) {
                adkObject.spec.core.description =
                  obj.description || adkObject.spec.core.description;

                // Apply package mapping if configured
                const localPackageName = this.packageMapper
                  ? this.packageMapper.toLocal(obj.packageName)
                  : obj.packageName.toLowerCase();
                adkObject.spec.core.package = localPackageName;
              }

              adkObjects.push(adkObject);
              objectsByType[obj.type] = (objectsByType[obj.type] || 0) + 1;
              processedCount++;
            } else {
              console.log(
                `⚠️ Handler for ${obj.type} doesn't support ADK objects, skipping ${obj.name}`
              );
            }
          } catch (error) {
            console.log(
              `⚠️ Failed to process ${obj.type} ${obj.name}: ${
                error instanceof Error ? error.message : String(error)
              }`
            );
          }
        }

        // Serialize all ADK objects at once
        if (adkObjects.length > 0) {
          const formatResult = await formatHandler.serializeAdkObjects!(
            adkObjects,
            baseDir
          );
          allResults.push(formatResult);
        }
      } else {
        // Legacy path: Use ObjectData
        for (const obj of objectsToProcess) {
          try {
            // Get object data from ADT using object handler
            const handler = ObjectRegistry.get(obj.type);
            const objectData = await handler.read(obj.name);

            // Merge description and package from transport result
            objectData.description = obj.description || objectData.description;

            // Apply package mapping if configured
            const localPackageName = this.packageMapper
              ? this.packageMapper.toLocal(obj.packageName)
              : obj.packageName.toLowerCase();
            objectData.package = localPackageName;

            // Format handler serializes the object data
            const formatResult = await formatHandler.serialize(
              objectData,
              obj.type,
              baseDir
            );
            allResults.push(formatResult);

            // Track statistics
            objectsByType[obj.type] = (objectsByType[obj.type] || 0) + 1;
            processedCount++;
          } catch (error) {
            console.log(
              `⚠️ Failed to process ${obj.type} ${obj.name}: ${
                error instanceof Error ? error.message : String(error)
              }`
            );
          }
        }
      }

      // Format post-processing
      if (formatHandler.afterImport) {
        const totalResult = {
          filesCreated: allResults.flatMap((r) => r.filesCreated),
          objectsProcessed: processedCount,
        };
        await formatHandler.afterImport(baseDir, totalResult);
      }

      console.log(`✅ Import complete`);

      return {
        transportNumber: options.transportNumber,
        description: `Transport ${options.transportNumber}`,
        totalObjects: searchObjects.length,
        processedObjects: processedCount,
        objectsByType,
        outputPath: baseDir,
      };
    } catch (error) {
      throw new Error(
        `Transport import failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private shouldIncludeObject(
    obj: ADTObjectInfo,
    options: ImportOptions
  ): boolean {
    // Dynamic filtering based on objectTypes array
    if (options.objectTypes) {
      // If specific types specified, only include those
      return options.objectTypes.includes(obj.type);
    }

    // If no types specified, include all (plugin will filter by its supported types)
    return true;
  }

  private shouldIncludeObjectForTransport(
    obj: ADTObjectInfo,
    options: TransportImportOptions
  ): boolean {
    // Dynamic filtering based on objectTypes array
    if (options.objectTypes) {
      // If specific types specified, only include those
      return options.objectTypes.includes(obj.type);
    }

    // If no types specified, include all (plugin will filter by its supported types)
    return true;
  }

  /**
   * Iterate package tree and serialize each object via plugin
   * CLI owns the iteration logic, plugin just serializes individual objects
   */
  private async serializeWithIteration(
    rootPackages: ADK_Package[],
    formatHandler: any,
    baseDir: string,
    totalObjects: number,
    currentIndex: number,
    allFilesCreated: string[]
  ): Promise<void> {
    // Recursive function to traverse package tree
    const traversePackage = async (
      pkg: ADK_Package,
      parents: ADK_Package[],
      packagePath: string[]
    ) => {
      // Build context for this package
      const packageDir = packagePath.join('/').toLowerCase();

      // Debug: Check package children
      console.log(
        `🔍 Package ${pkg.name}: ${pkg.children.length} children, ${pkg.subpackages.length} subpackages`
      );

      // Serialize all objects in this package
      for (const obj of pkg.children) {
        try {
          console.log(`🔍 Serializing object: ${obj.kind} ${obj.name}`);
          const context = {
            package: pkg,
            packagePath,
            packageDir,
            parents,
            totalObjects,
            currentIndex: currentIndex++,
          };

          const result = await formatHandler.serializeObject(
            obj,
            baseDir,
            context
          );

          if (result.success) {
            allFilesCreated.push(...result.filesCreated);
          }
        } catch (error) {
          console.log(
            `⚠️ Failed to serialize ${obj.kind} ${obj.name}: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }

      // Recursively process subpackages
      for (const subpkg of pkg.subpackages) {
        await traversePackage(
          subpkg,
          [...parents, pkg],
          [...packagePath, subpkg.name]
        );
      }
    };

    // Start traversal from each root package
    for (const rootPkg of rootPackages) {
      await traversePackage(rootPkg, [], [rootPkg.name]);
    }
  }
}
