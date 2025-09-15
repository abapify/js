import {
  AdkObject,
  SerializeResult,
  SerializeOptions,
  PluginFilesystemError,
} from '@abapify/adt-cli';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

/**
 * OAT serializer - converts ADK objects to OAT format files
 */
export class OatSerializer {
  /**
   * Serialize ADK objects to file system
   */
  async serialize(
    objects: AdkObject[],
    targetPath: string,
    options?: SerializeOptions
  ): Promise<SerializeResult> {
    const filesCreated: string[] = [];
    const errors: any[] = [];
    let objectsProcessed = 0;

    try {
      // Create target directory structure
      await this.createDirectoryStructure(targetPath, options);

      // Process each object
      for (const obj of objects) {
        try {
          const objectFiles = await this.serializeObject(
            obj,
            targetPath,
            options
          );
          filesCreated.push(...objectFiles);
          objectsProcessed++;
        } catch (error) {
          errors.push({
            message: `Failed to serialize object ${obj.metadata.name}`,
            plugin: '@abapify/oat',
            category: 'serialization',
            context: { objectName: obj.metadata.name, objectKind: obj.kind },
            cause: error,
          });
        }
      }

      // Create OAT project manifest
      await this.createProjectManifest(targetPath, objectsProcessed);

      return {
        success: errors.length === 0,
        filesCreated,
        objectsProcessed,
        errors,
        metadata: {
          totalSize: await this.calculateTotalSize(filesCreated),
          processingTime: Date.now(),
          format: 'oat',
        },
      };
    } catch (error) {
      throw new PluginFilesystemError(
        '@abapify/oat',
        `Failed to serialize objects to ${targetPath}`,
        { targetPath, objectCount: objects.length },
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Create directory structure based on file structure option
   */
  private async createDirectoryStructure(
    targetPath: string,
    options?: SerializeOptions
  ): Promise<void> {
    const fileStructure = options?.fileStructure || 'hierarchical';

    await fs.mkdir(targetPath, { recursive: true });

    if (fileStructure === 'hierarchical') {
      // Create packages/objects structure
      await fs.mkdir(path.join(targetPath, 'packages'), { recursive: true });
    }
  }

  /**
   * Serialize a single object
   */
  private async serializeObject(
    obj: AdkObject,
    targetPath: string,
    options?: SerializeOptions
  ): Promise<string[]> {
    const filesCreated: string[] = [];
    const fileStructure = options?.fileStructure || 'hierarchical';

    // Determine object directory
    const objectDir = this.getObjectDirectory(obj, targetPath, fileStructure);
    await fs.mkdir(objectDir, { recursive: true });

    // Create main metadata file
    const metadataFile = await this.createMetadataFile(obj, objectDir);
    filesCreated.push(metadataFile);

    // Create source files if spec contains source code
    if (obj.spec && typeof obj.spec === 'object') {
      const sourceFiles = await this.createSourceFiles(obj, objectDir);
      filesCreated.push(...sourceFiles);
    }

    return filesCreated;
  }

  /**
   * Get object directory path based on file structure
   */
  private getObjectDirectory(
    obj: AdkObject,
    targetPath: string,
    fileStructure: string
  ): string {
    const objectName = obj.metadata.name.toLowerCase();
    const objectType = obj.kind.toLowerCase();

    switch (fileStructure) {
      case 'flat':
        return targetPath;
      case 'grouped':
        return path.join(targetPath, objectType);
      case 'hierarchical':
      default:
        const packageName = obj.metadata.package?.toLowerCase() || 'default';
        return path.join(
          targetPath,
          'packages',
          packageName,
          'objects',
          objectType,
          objectName
        );
    }
  }

  /**
   * Create metadata YAML file
   */
  private async createMetadataFile(
    obj: AdkObject,
    objectDir: string
  ): Promise<string> {
    const fileName = `${obj.metadata.name.toLowerCase()}.${obj.kind.toLowerCase()}.yaml`;
    const filePath = path.join(objectDir, fileName);

    const yamlContent = {
      kind: obj.kind,
      metadata: {
        name: obj.metadata.name,
        description: obj.metadata.description || '',
        package: obj.metadata.package || '',
        ...(obj.metadata.author && { author: obj.metadata.author }),
        ...(obj.metadata.createdAt && {
          createdAt: obj.metadata.createdAt.toISOString(),
        }),
        ...(obj.metadata.modifiedAt && {
          modifiedAt: obj.metadata.modifiedAt.toISOString(),
        }),
        ...(obj.metadata.transportRequest && {
          transportRequest: obj.metadata.transportRequest,
        }),
      },
      spec: obj.spec,
    };

    const yamlString = yaml.dump(yamlContent, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
      sortKeys: false,
    });

    await fs.writeFile(filePath, yamlString, 'utf-8');
    return filePath;
  }

  /**
   * Create source code files from spec
   */
  private async createSourceFiles(
    obj: AdkObject,
    objectDir: string
  ): Promise<string[]> {
    const filesCreated: string[] = [];
    const spec = obj.spec as any;

    // Handle different source types based on object kind
    switch (obj.kind) {
      case 'Class':
        if (spec.source?.main) {
          const mainFile = path.join(
            objectDir,
            `${obj.metadata.name.toLowerCase()}.clas.abap`
          );
          await fs.writeFile(mainFile, spec.source.main, 'utf-8');
          filesCreated.push(mainFile);
        }
        if (spec.source?.testClasses) {
          const testFile = path.join(
            objectDir,
            `${obj.metadata.name.toLowerCase()}.clas.testclasses.abap`
          );
          await fs.writeFile(testFile, spec.source.testClasses, 'utf-8');
          filesCreated.push(testFile);
        }
        break;

      case 'Interface':
        if (spec.source?.main) {
          const mainFile = path.join(
            objectDir,
            `${obj.metadata.name.toLowerCase()}.intf.abap`
          );
          await fs.writeFile(mainFile, spec.source.main, 'utf-8');
          filesCreated.push(mainFile);
        }
        break;

      case 'Domain':
        // Domains typically don't have separate source files
        break;

      default:
        // Handle generic source if present
        if (spec.source) {
          const sourceFile = path.join(
            objectDir,
            `${obj.metadata.name.toLowerCase()}.${obj.kind.toLowerCase()}.abap`
          );
          await fs.writeFile(sourceFile, spec.source, 'utf-8');
          filesCreated.push(sourceFile);
        }
    }

    return filesCreated;
  }

  /**
   * Create OAT project manifest
   */
  private async createProjectManifest(
    targetPath: string,
    objectsProcessed: number
  ): Promise<void> {
    const manifest = {
      format: 'oat',
      tooling: 'Open ABAP Tooling',
      version: '1.0.0',
      generator: '@abapify/oat',
      objectsProcessed,
      structure: 'packages/pkg/objects/type/name/',
      createdAt: new Date().toISOString(),
    };

    const manifestFile = path.join(targetPath, '.oat.json');
    await fs.writeFile(
      manifestFile,
      JSON.stringify(manifest, null, 2),
      'utf-8'
    );
  }

  /**
   * Calculate total size of created files
   */
  private async calculateTotalSize(filePaths: string[]): Promise<number> {
    let totalSize = 0;
    for (const filePath of filePaths) {
      try {
        const stats = await fs.stat(filePath);
        totalSize += stats.size;
      } catch {
        // Ignore files that can't be stat'd
      }
    }
    return totalSize;
  }
}
