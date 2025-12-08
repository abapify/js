import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import type {
  AdkObject,
  AdkPackage,
  AdkClass,
  AdkInterface,
} from '@abapify/adk';
import { serializePackage } from '../objects/devc';
import { serializeClass } from '../objects/clas';
import { serializeInterface } from '../objects/intf';
import { serializeDomain } from '../objects/doma';
import { serializeDataElement } from '../objects/dtel';

/**
 * Resolve lazy content - either return string directly or call loader function
 */
async function resolveContent(content: unknown): Promise<string> {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (typeof content === 'function') return await content();
  return '';
}

/**
 * Type guard for Class objects
 */
function isClass(obj: AdkObject): boolean {
  return obj.kind === 'Class';
}

/**
 * Type guard for Package objects
 */
function isPackage(obj: AdkObject): boolean {
  return obj.kind === 'Package';
}

/**
 * Type guard for Interface objects
 */
function isInterface(obj: AdkObject): boolean {
  return obj.kind === 'Interface';
}

/**
 * Type guard for Domain objects
 */
function isDomain(obj: AdkObject): boolean {
  return obj.kind === 'Domain';
}

/**
 * Type guard for DataElement objects
 */
function isDataElement(obj: AdkObject): boolean {
  return obj.kind === 'DataElement';
}

/**
 * Serialize ADK objects to abapGit format
 */
export class AbapGitSerializer {
  /**
   * Serialize a single object (called by plugin API)
   */
  async serializeObjectPublic(
    obj: AdkObject,
    targetPath: string,
    packageDir: string
  ): Promise<string[]> {
    const fullPackageDir = join(targetPath, 'src', packageDir);
    mkdirSync(fullPackageDir, { recursive: true });

    const files = await this.serializeObject(obj, fullPackageDir);
    return files;
  }

  private async serializeObject(
    obj: AdkObject,
    packageDir: string
  ): Promise<string[]> {
    const files: string[] = [];
    const objectName = obj.name.toLowerCase();
    const fileExtension = this.getAbapGitExtension(obj.kind);

    // Handle Class objects with segments
    if (isClass(obj)) {
      const classFiles = await this.serializeClass(
        obj,
        packageDir,
        objectName,
        fileExtension
      );
      files.push(...classFiles);
    } else {
      // Handle other object types
      const genericFiles = await this.serializeGenericObject(
        obj,
        packageDir,
        objectName,
        fileExtension
      );
      files.push(...genericFiles);
    }

    // Create metadata file (.xml) for all objects
    const xmlContent = this.generateObjectXml(obj);

    // Special case: packages use "package.devc.xml" instead of "$packagename.devc.xml"
    const xmlFileName = isPackage(obj)
      ? `package.${fileExtension}.xml`
      : `${objectName}.${fileExtension}.xml`;

    const xmlFile = join(packageDir, xmlFileName);
    writeFileSync(xmlFile, xmlContent, 'utf8');
    files.push(xmlFile);

    return files;
  }

  private async serializeClass(
    obj: AdkObject,
    packageDir: string,
    objectName: string,
    fileExtension: string
  ): Promise<string[]> {
    const files: string[] = [];
    const data = obj.dataSync as Record<string, unknown>;

    // Main class file - get from source attribute or first include
    const includes = Array.isArray(data.include) ? data.include : [];

    const mainInclude = includes.find(
      (inc: Record<string, unknown>) => inc.includeType === 'main'
    );
    if (mainInclude) {
      const inc = mainInclude as Record<string, unknown>;
      const content = await resolveContent(inc.content);
      if (content) {
        const mainFile = join(
          packageDir,
          `${objectName}.${fileExtension}.abap`
        );
        writeFileSync(mainFile, content, 'utf8');
        files.push(mainFile);
      }
    } else if (typeof data.sourceUri === 'string') {
      // Fallback: if no main include but source exists
      const mainFile = join(packageDir, `${objectName}.${fileExtension}.abap`);
      writeFileSync(mainFile, '* Main class source\n', 'utf8');
      files.push(mainFile);
    }

    // Segment files (locals_def, locals_imp, macros, testclasses)
    for (const include of includes) {
      const inc = include as Record<string, unknown>;
      if (inc.includeType === 'main') continue; // Already handled

      const content = await resolveContent(inc.content);
      if (content) {
        // Map ADK includeType to abapGit file naming convention
        const abapGitSegmentName = this.mapIncludeTypeToAbapGit(
          String(inc.includeType)
        );
        const segmentFile = join(
          packageDir,
          `${objectName}.${fileExtension}.${abapGitSegmentName}.abap`
        );
        writeFileSync(segmentFile, content, 'utf8');
        files.push(segmentFile);
      }
    }

    return files;
  }

  private async serializeGenericObject(
    obj: AdkObject,
    packageDir: string,
    objectName: string,
    fileExtension: string
  ): Promise<string[]> {
    const files: string[] = [];

    // For generic objects, try to get source from data
    const data = obj.dataSync as Record<string, unknown>;

    // Check if there's lazy-loaded content
    if (data.content) {
      const content = await resolveContent(data.content);
      if (content) {
        const sourceFile = join(
          packageDir,
          `${objectName}.${fileExtension}.abap`
        );
        writeFileSync(sourceFile, content, 'utf8');
        files.push(sourceFile);
      }
    } else if (typeof data.sourceUri === 'string') {
      // Fallback: if no lazy-loaded content but sourceUri exists
      const sourceFile = join(
        packageDir,
        `${objectName}.${fileExtension}.abap`
      );
      writeFileSync(sourceFile, '* Source code placeholder\n', 'utf8');
      files.push(sourceFile);
    }

    return files;
  }

  private getAbapGitExtension(kind: string): string {
    const extensions: Record<string, string> = {
      Class: 'clas',
      Interface: 'intf',
      Program: 'prog',
      FunctionGroup: 'fugr',
      Table: 'tabl',
      DataElement: 'dtel',
      Domain: 'doma',
      Package: 'devc',
    };
    return extensions[kind] || 'obj';
  }

  /**
   * Map ADK includeType to abapGit file naming convention
   */
  private mapIncludeTypeToAbapGit(includeType: string): string {
    const mapping: Record<string, string> = {
      definitions: 'locals_def',
      implementations: 'locals_imp',
      macros: 'macros',
      testclasses: 'testclasses',
      main: 'main',
    };
    return mapping[includeType] || includeType;
  }

  private generateObjectXml(obj: AdkObject): string {
    // Use object-specific serializers based on kind
    if (isPackage(obj)) {
      return serializePackage(obj as AdkPackage);
    }
    if (isClass(obj)) {
      return serializeClass(obj as AdkClass);
    }
    if (isInterface(obj)) {
      return serializeInterface(obj as AdkInterface);
    }
    if (isDomain(obj)) {
      return serializeDomain(obj);
    }
    if (isDataElement(obj)) {
      return serializeDataElement(obj);
    }

    // Fallback for unsupported object types
    throw new Error(`No serializer available for object type: ${obj.kind}`);
  }

}
