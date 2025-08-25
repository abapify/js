import { ADTClient } from '../../adt-client';
import { SearchService, ADTObject } from '../search/service';
import { ObjectRegistry } from '../../objects/registry';
import { FormatRegistry } from '../../formats/format-registry';
import { IconRegistry } from '../../utils/icon-registry';

export interface ImportOptions {
  packageName: string;
  outputPath: string;
  objectTypes?: string[]; // ['CLAS', 'INTF', 'DDLS'] or undefined (all supported)
  includeSubpackages?: boolean;
  format?: string; // 'oat', 'abapgit', 'json', etc.
  debug?: boolean;
}

export interface ImportResult {
  packageName: string;
  description: string;
  totalObjects: number;
  processedObjects: number;
  objectsByType: Record<string, number>;
  outputPath: string;
}

export class ImportService {
  private searchService: SearchService;

  constructor(private adtClient: ADTClient) {
    this.searchService = new SearchService(adtClient);
  }

  async importPackage(options: ImportOptions): Promise<ImportResult> {
    if (options.debug) {
      this.adtClient.setDebugMode(true);
      console.log(`🔍 Importing package: ${options.packageName}`);
      console.log(`📁 Output path: ${options.outputPath}`);
      console.log(`🎯 Format: ${options.format || 'oat'}`);
    }

    try {
      // Discover all objects in package using SearchService
      if (options.debug) {
        console.log(`📦 Discovering package: ${options.packageName}`);
      }
      const searchResult = await this.searchService.searchByPackage(
        options.packageName,
        {
          debug: options.debug,
        }
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

      const formatName = formatHandler.name.toUpperCase();
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
          const handler = ObjectRegistry.get(obj.type, this.adtClient);
          const objectData = await handler.read(obj.name);

          // Merge description from search result
          objectData.description = obj.description || objectData.description;

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

  private shouldIncludeObject(obj: ADTObject, options: ImportOptions): boolean {
    // Dynamic filtering based on objectTypes array
    if (options.objectTypes) {
      // If specific types specified, only include those
      return options.objectTypes.includes(obj.type);
    }

    // If no types specified, include all (plugin will filter by its supported types)
    return true;
  }
}
