import {
  AdkObject,
  DeserializeOptions,
  PluginFilesystemError,
} from '@abapify/adt-cli';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

/**
 * OAT deserializer - converts OAT format files to ADK objects
 */
export class OatDeserializer {
  /**
   * Deserialize OAT format files to ADK objects
   */
  async deserialize(
    sourcePath: string,
    options?: DeserializeOptions
  ): Promise<AdkObject[]> {
    try {
      const objects: AdkObject[] = [];

      // Check if source path exists
      const stats = await fs.stat(sourcePath);
      if (!stats.isDirectory()) {
        throw new Error(`Source path must be a directory: ${sourcePath}`);
      }

      // Find all YAML metadata files
      const yamlFiles = await this.findYamlFiles(sourcePath);

      // Process each YAML file
      for (const yamlFile of yamlFiles) {
        try {
          const obj = await this.deserializeObject(
            yamlFile,
            sourcePath,
            options
          );
          if (obj) {
            objects.push(obj);
          }
        } catch (error) {
          if (options?.strictMode) {
            throw error;
          }
          // In non-strict mode, skip invalid objects
          console.warn(`Skipping invalid object file: ${yamlFile}`, error);
        }
      }

      return objects;
    } catch (error) {
      throw new PluginFilesystemError(
        '@abapify/oat',
        `Failed to deserialize objects from ${sourcePath}`,
        { sourcePath },
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Find all YAML metadata files recursively
   */
  private async findYamlFiles(dir: string): Promise<string[]> {
    const yamlFiles: string[] = [];

    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        const subFiles = await this.findYamlFiles(fullPath);
        yamlFiles.push(...subFiles);
      } else if (entry.isFile() && this.isYamlMetadataFile(entry.name)) {
        yamlFiles.push(fullPath);
      }
    }

    return yamlFiles;
  }

  /**
   * Check if file is a YAML metadata file (not a source file)
   */
  private isYamlMetadataFile(fileName: string): boolean {
    return (
      (fileName.endsWith('.yaml') || fileName.endsWith('.yml')) &&
      !fileName.includes('.abap') &&
      !fileName.includes('.properties')
    );
  }

  /**
   * Deserialize a single object from YAML file
   */
  private async deserializeObject(
    yamlFile: string,
    basePath: string,
    options?: DeserializeOptions
  ): Promise<AdkObject | null> {
    const content = await fs.readFile(yamlFile, 'utf-8');
    const data = yaml.load(content) as any;

    // Validate required fields
    if (!data.kind || !data.metadata || !data.metadata.name) {
      if (options?.validateStructure) {
        throw new Error(
          `Invalid object structure in ${yamlFile}: missing kind or metadata.name`
        );
      }
      return null;
    }

    // Load source files if they exist
    const objectDir = path.dirname(yamlFile);
    const spec = await this.loadSourceFiles(
      data.spec || {},
      data.kind,
      data.metadata.name,
      objectDir
    );

    return {
      kind: data.kind,
      metadata: {
        name: data.metadata.name,
        description: data.metadata.description || '',
        package: data.metadata.package || '',
        author: data.metadata.author,
        createdAt: data.metadata.createdAt
          ? new Date(data.metadata.createdAt)
          : undefined,
        modifiedAt: data.metadata.modifiedAt
          ? new Date(data.metadata.modifiedAt)
          : undefined,
        transportRequest: data.metadata.transportRequest,
      },
      spec,
    };
  }

  /**
   * Load source files for an object
   */
  private async loadSourceFiles(
    spec: any,
    kind: string,
    objectName: string,
    objectDir: string
  ): Promise<any> {
    const lowerName = objectName.toLowerCase();
    const lowerKind = kind.toLowerCase();

    // Initialize source object if not present
    if (!spec.source) {
      spec.source = {};
    }

    try {
      switch (kind) {
        case 'Class':
          await this.loadClassSources(spec, lowerName, objectDir);
          break;
        case 'Interface':
          await this.loadInterfaceSources(spec, lowerName, objectDir);
          break;
        case 'Domain':
          // Domains typically don't have source files
          break;
        default:
          await this.loadGenericSources(spec, lowerName, lowerKind, objectDir);
      }
    } catch (error) {
      // Source files are optional - don't fail if they don't exist
    }

    return spec;
  }

  /**
   * Load class source files
   */
  private async loadClassSources(
    spec: any,
    objectName: string,
    objectDir: string
  ): Promise<void> {
    const mainFile = path.join(objectDir, `${objectName}.clas.abap`);
    const testFile = path.join(
      objectDir,
      `${objectName}.clas.testclasses.abap`
    );
    const localsDefFile = path.join(
      objectDir,
      `${objectName}.clas.locals_def.abap`
    );
    const localsImpFile = path.join(
      objectDir,
      `${objectName}.clas.locals_imp.abap`
    );
    const macrosFile = path.join(objectDir, `${objectName}.clas.macros.abap`);

    try {
      spec.source.main = await fs.readFile(mainFile, 'utf-8');
    } catch {
      /* File doesn't exist */
    }

    try {
      spec.source.testClasses = await fs.readFile(testFile, 'utf-8');
    } catch {
      /* File doesn't exist */
    }

    try {
      spec.source.localDefinitions = await fs.readFile(localsDefFile, 'utf-8');
    } catch {
      /* File doesn't exist */
    }

    try {
      spec.source.localImplementations = await fs.readFile(
        localsImpFile,
        'utf-8'
      );
    } catch {
      /* File doesn't exist */
    }

    try {
      spec.source.macros = await fs.readFile(macrosFile, 'utf-8');
    } catch {
      /* File doesn't exist */
    }
  }

  /**
   * Load interface source files
   */
  private async loadInterfaceSources(
    spec: any,
    objectName: string,
    objectDir: string
  ): Promise<void> {
    const mainFile = path.join(objectDir, `${objectName}.intf.abap`);

    try {
      spec.source.main = await fs.readFile(mainFile, 'utf-8');
    } catch {
      /* File doesn't exist */
    }
  }

  /**
   * Load generic source files
   */
  private async loadGenericSources(
    spec: any,
    objectName: string,
    objectKind: string,
    objectDir: string
  ): Promise<void> {
    const sourceFile = path.join(objectDir, `${objectName}.${objectKind}.abap`);

    try {
      spec.source = await fs.readFile(sourceFile, 'utf-8');
    } catch {
      /* File doesn't exist */
    }
  }
}
