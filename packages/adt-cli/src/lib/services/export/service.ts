import { FormatRegistry } from '../../formats/format-registry';
import { ObjectRegistry } from '../../objects/registry';
import { IconRegistry } from '../../utils/icon-registry';
import { ConfigLoader } from '../../config/loader';
import { PackageMapper } from '../../config/package-mapper';
import type { Logger } from '@abapify/adt-client';
import * as fs from 'fs';
import * as path from 'path';

export interface ExportOptions {
  packageName: string;
  inputPath: string;
  objectTypes?: string[];
  format?: string;
  transportRequest?: string;
  createObjects?: boolean; // New flag to actually create objects in SAP
}

export interface ExportResult {
  packageName: string;
  description: string;
  totalObjects: number;
  processedObjects: number;
  createdObjects: number;
  objectsByType: Record<string, number>;
  createdObjectsByType: Record<string, number>;
}

export class ExportService {
  private packageMapper?: PackageMapper;
  private adtClient?: any; // ADT client for object operations
  private logger?: Logger;

  constructor(adtClient?: any, logger?: Logger) {
    this.adtClient = adtClient;
    this.logger = logger;
  }

  async exportPackage(options: ExportOptions): Promise<ExportResult> {
    this.logger?.debug('📦 Export parameters', {
      packageName: options.packageName,
      inputPath: options.inputPath,
      format: options.format || 'oat',
      createObjects: options.createObjects || false,
    });

    if (options.transportRequest) {
      this.logger?.debug(`🚛 Transport request: ${options.transportRequest}`);
    }

    // Load config and set up package mapping
    const configLoader = new ConfigLoader();
    const config = await configLoader.load();
    if (config.oat?.packageMapping) {
      this.packageMapper = new PackageMapper(config.oat.packageMapping);
      this.logger?.debug('⚙️ Package mapping configured');
    }

    const inputDir = options.inputPath;
    if (!fs.existsSync(inputDir)) {
      throw new Error('Input directory does not exist');
    }

    const format = options.format || 'oat';
    const formatHandler = FormatRegistry.get(format);

    this.logger?.debug(
      `🎨 Using format: ${formatHandler.name} - ${formatHandler.description}`
    );

    // Discover all object files in the input directory
    const objectFiles = this.discoverObjectFiles(inputDir, options.objectTypes);

    this.logger?.debug(
      `🔍 Found ${objectFiles.length} object files to process`
    );

    let processedCount = 0;
    let createdCount = 0;
    const objectsByType: Record<string, number> = {};
    const createdObjectsByType: Record<string, number> = {};

    console.log(`📦 Processing package ${options.packageName}`);
    console.log(
      `🔍 Processing ${objectFiles.length} objects${
        options.createObjects ? ' and creating in SAP' : ''
      }`
    );

    for (const fileInfo of objectFiles) {
      try {
        // Deserialize the object data using format handler
        const objectData = await formatHandler.deserialize(
          fileInfo.type,
          fileInfo.name,
          inputDir
        );

        // Apply package mapping if configured
        const remotePackageName = this.packageMapper
          ? this.packageMapper.toRemote(options.packageName)
          : options.packageName;
        objectData.package = remotePackageName;

        const icon = IconRegistry.getIcon(fileInfo.type);
        console.log(`${icon} Processing ${fileInfo.type} ${objectData.name}`);

        this.logger?.debug(`🔍 ObjectData for ${objectData.name}`, {
          description: objectData.description,
          package: objectData.package,
          sourceLength: objectData.source?.length || 0,
        });

        // Track processing statistics
        objectsByType[fileInfo.type] = (objectsByType[fileInfo.type] || 0) + 1;
        processedCount++;

        // Create object in SAP if requested
        if (options.createObjects) {
          const handler = ObjectRegistry.get(fileInfo.type);

          try {
            // The handler now intelligently checks if object exists and creates/updates accordingly
            await handler.create(objectData, options.transportRequest);

            createdObjectsByType[fileInfo.type] =
              (createdObjectsByType[fileInfo.type] || 0) + 1;
            createdCount++;
          } catch (error) {
            console.error(
              `⚠️ Failed to process ${fileInfo.type} ${objectData.name}: ${
                error instanceof Error ? error.message : String(error)
              }`
            );
            throw error;
          }
        }
      } catch (error: unknown) {
        console.error(
          `⚠️ Failed to process ${fileInfo.type} from ${fileInfo.path}: ${
            (error as Error).message
          }`
        );
      }
    }

    if (options.createObjects) {
      console.log(
        `✅ Export complete - ${createdCount}/${processedCount} objects created in SAP`
      );
    } else {
      console.log(
        `✅ Export complete - ${processedCount} objects processed (dry run)`
      );
    }

    return {
      packageName: options.packageName,
      description: `Export of package ${options.packageName}`,
      totalObjects: objectFiles.length,
      processedObjects: processedCount,
      createdObjects: createdCount,
      objectsByType,
      createdObjectsByType,
    };
  }

  private discoverObjectFiles(
    inputDir: string,
    allowedTypes?: string[]
  ): Array<{ path: string; type: string; name: string }> {
    const objectFiles: Array<{ path: string; type: string; name: string }> = [];
    const processedObjects = new Set<string>(); // Track processed objects to avoid duplicates

    const scanDirectory = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          scanDirectory(fullPath); // Recursively scan subdirectories
        } else if (entry.isFile()) {
          const objectType = this.detectObjectType(entry.name, allowedTypes);
          if (objectType && ObjectRegistry.isSupported(objectType)) {
            const objectName = this.extractObjectName(entry.name, objectType);
            const objectKey = `${objectType}:${objectName}`;

            // Only add each object once (avoid duplicates from .yaml/.abap files)
            if (!processedObjects.has(objectKey)) {
              processedObjects.add(objectKey);
              objectFiles.push({
                path: path.dirname(fullPath), // Use directory path for OAT format
                type: objectType,
                name: objectName,
              });
            }
          }
        }
      }
    };

    scanDirectory(inputDir);
    return objectFiles;
  }

  private detectObjectType(
    fileName: string,
    allowedTypes?: string[]
  ): string | null {
    // Try to detect from file extension or naming pattern
    let objectType: string | null = null;

    if (fileName.includes('.clas.') || fileName.endsWith('.clas')) {
      objectType = 'CLAS';
    } else if (fileName.includes('.intf.') || fileName.endsWith('.intf')) {
      objectType = 'INTF';
    } else if (fileName.includes('.doma.') || fileName.endsWith('.doma')) {
      objectType = 'DOMA';
    }

    // Check if type is allowed
    if (objectType && allowedTypes && !allowedTypes.includes(objectType)) {
      return null;
    }

    return objectType;
  }

  private extractObjectName(fileName: string, objectType: string): string {
    const baseName = path.basename(fileName, path.extname(fileName));

    // Remove object type suffix if present
    const typePattern = new RegExp(`\\.(${objectType.toLowerCase()})$`, 'i');
    return baseName.replace(typePattern, '').toUpperCase();
  }
}
