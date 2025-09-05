import { ADTClient } from '../../adt-client';
import { FormatRegistry } from '../../formats/format-registry';
import { IconRegistry } from '../../utils/icon-registry';
import { ObjectRegistry } from '../../objects/registry';
import { ConfigLoader } from '../../config/loader';
import { PackageMapper } from '../../config/package-mapper';
import * as fs from 'fs';
import * as path from 'path';

export interface ExportOptions {
  packageName: string;
  inputPath: string;
  objectTypes?: string[];
  includeSubpackages?: boolean;
  format?: string;
  transportRequest?: string;
  createObjects?: boolean; // New flag to actually create objects in SAP
  debug?: boolean;
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

  constructor(private adtClient: ADTClient) {}

  async exportPackage(options: ExportOptions): Promise<ExportResult> {
    if (options.debug) {
      this.adtClient.setDebugMode(true);
      console.log(`📦 Exporting package: ${options.packageName}`);
      console.log(`📁 Input path: ${options.inputPath}`);
      console.log(`🎯 Format: ${options.format || 'oat'}`);
      console.log(
        `🚀 Create objects in SAP: ${options.createObjects ? 'Yes' : 'No'}`
      );
      if (options.transportRequest) {
        console.log(`🚛 Transport request: ${options.transportRequest}`);
      }
    }

    // Load config and set up package mapping
    const config = await ConfigLoader.load();
    if (config.oat?.packageMapping) {
      this.packageMapper = new PackageMapper(config.oat.packageMapping);
      if (options.debug) {
        console.log(`⚙️ Package mapping configured`);
      }
    }

    const inputDir = options.inputPath;
    if (!fs.existsSync(inputDir)) {
      throw new Error('Input directory does not exist');
    }

    const format = options.format || 'oat';
    const formatHandler = FormatRegistry.get(format);

    if (options.debug) {
      console.log(
        `🎨 Using format: ${formatHandler.name} - ${formatHandler.description}`
      );
    }

    // Discover all object files in the input directory
    const objectFiles = this.discoverObjectFiles(inputDir, options.objectTypes);

    if (options.debug) {
      console.log(`🔍 Found ${objectFiles.length} object files to process`);
    }

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

        // Track processing statistics
        objectsByType[fileInfo.type] = (objectsByType[fileInfo.type] || 0) + 1;
        processedCount++;

        // Create object in SAP if requested
        if (options.createObjects) {
          const handler = ObjectRegistry.get(fileInfo.type, this.adtClient);

          try {
            // Try to read existing object first to determine if we should create or update
            await handler.read(objectData.name);
            // Object exists, update it
            await handler.update(objectData, options.transportRequest);
            console.log(`✅ Updated ${fileInfo.type} ${objectData.name}`);
          } catch (error) {
            // Object doesn't exist, create it
            await handler.create(objectData, options.transportRequest);
            console.log(`🆕 Created ${fileInfo.type} ${objectData.name}`);
          }

          createdObjectsByType[fileInfo.type] =
            (createdObjectsByType[fileInfo.type] || 0) + 1;
          createdCount++;
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
