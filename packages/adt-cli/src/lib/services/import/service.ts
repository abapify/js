import { adtClient } from '../../shared/clients';
import type { ADTObjectInfo } from '@abapify/adt-client';
import { ObjectRegistry } from '../../objects/registry';
import { FormatRegistry } from '../../formats/format-registry';
import { IconRegistry } from '../../utils/icon-registry';
import { ConfigLoader } from '../../config/loader';
import { PackageMapper } from '../../config/package-mapper';

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
      adtClient.setDebugMode(true);
      console.log(`🔍 Importing package: ${options.packageName}`);
      console.log(`📁 Output path: ${options.outputPath}`);
      console.log(`🎯 Format: ${options.format || 'oat'}`);
    }

    // Load config and set up package mapping
    const config = await ConfigLoader.load();
    if (config.oat?.packageMapping) {
      this.packageMapper = new PackageMapper(config.oat.packageMapping);
      if (options.debug) {
        console.log(`⚙️ Package mapping configured`);
      }
    }

    try {
      // Discover all objects in package using SearchService
      if (options.debug) {
        console.log(`📦 Discovering package: ${options.packageName}`);
      }
      const searchResult = await adtClient.searchByPackage(
        options.packageName,
        {}
      );

      if (options.debug) {
        console.log(`✅ Found ${searchResult.totalCount} total objects`);
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
      const objectsToProcess = searchResult.objects.filter((obj) => {
        const supportedByFormat = formatHandler
          .getSupportedObjectTypes()
          .includes(obj.type);
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

      // Process each object using format handler
      const objectsByType: Record<string, number> = {};
      let processedCount = 0;
      const allResults: any[] = [];

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
      adtClient.setDebugMode(true);
      console.log(`🔍 Importing transport: ${options.transportNumber}`);
      console.log(`📁 Output path: ${options.outputPath}`);
      console.log(`🎯 Format: ${options.format || 'oat'}`);
    }

    // Load config and set up package mapping
    const config = await ConfigLoader.load();
    if (config.oat?.packageMapping) {
      this.packageMapper = new PackageMapper(config.oat.packageMapping);
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
        console.log(`📝 Transport: ${transportDetails.transport.description}`);
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

      // Check if format supports ADK objects
      const supportsAdkObjects =
        typeof formatHandler.serializeAdkObjects === 'function';

      const objectsByType: Record<string, number> = {};
      let processedCount = 0;
      const allResults: any[] = [];

      if (supportsAdkObjects) {
        // New path: Use ADK objects
        const adkObjects: any[] = [];

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
        description:
          transportDetails.transport.description ||
          `Transport ${options.transportNumber}`,
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
}
