import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { AdkObject } from '@abapify/adk';
import type { ClassSpec } from '@abapify/adk';

export interface SerializeResult {
  success: boolean;
  objectsProcessed: number;
  filesCreated: string[];
  errors?: string[];
}

/**
 * Resolve lazy content - either return string directly or call loader function
 */
async function resolveContent(
  content: string | (() => Promise<string>) | undefined
): Promise<string> {
  if (!content) return '';
  if (typeof content === 'string') return content;
  return await content();
}

/**
 * Type guard to check if object has a spec property
 */
function hasSpec(obj: AdkObject): obj is AdkObject & { spec: any } {
  return 'spec' in obj && obj.spec !== undefined;
}

/**
 * Type guard for Class objects
 */
function isClass(obj: AdkObject): obj is AdkObject & { spec: ClassSpec } {
  return obj.kind === 'Class' && hasSpec(obj);
}

/**
 * Serialize ADK objects to abapGit format
 */
export class AbapGitSerializer {
  async serialize(
    objects: AdkObject[],
    targetPath: string
  ): Promise<SerializeResult> {
    const filesCreated: string[] = [];
    const errors: string[] = [];
    let objectsProcessed = 0;

    try {
      // Create target directory structure
      const srcDir = join(targetPath, 'src');
      mkdirSync(srcDir, { recursive: true });

      // Determine root package (most common package or first one)
      const rootPackage = this.determineRootPackage(objects);

      // Filter out Package objects - they're used for metadata only, not serialized as files
      const serializableObjects = objects.filter(obj => obj.kind !== 'Package');

      // Group objects by their folder (using PREFIX logic)
      const objectsByFolder = this.groupByFolder(serializableObjects, rootPackage);

      // Create root package.devc.xml
      const rootPackageXml = this.generatePackageXml(rootPackage, rootPackage, objects);
      const rootPackagePath = join(srcDir, 'package.devc.xml');
      writeFileSync(rootPackagePath, rootPackageXml, 'utf8');
      filesCreated.push(rootPackagePath);

      // Process each folder
      for (const [folderName, folderObjects] of objectsByFolder.entries()) {
        const folderDir = join(srcDir, folderName);
        mkdirSync(folderDir, { recursive: true });

        // Create package.devc.xml for this folder
        const firstObj = folderObjects[0];
        const folderPackage = (hasSpec(firstObj) && firstObj.spec?.core?.package) || rootPackage;
        const folderPackageXml = this.generatePackageXml(folderPackage, rootPackage, objects);
        const folderPackagePath = join(folderDir, 'package.devc.xml');
        writeFileSync(folderPackagePath, folderPackageXml, 'utf8');
        filesCreated.push(folderPackagePath);

        // Process each object in the folder
        for (const obj of folderObjects) {
          try {
            const files = await this.serializeObject(obj, folderDir);
            filesCreated.push(...files);
            objectsProcessed++;
          } catch (error) {
            errors.push(
              `Failed to serialize ${obj.name}: ${
                error instanceof Error ? error.message : String(error)
              }`
            );
          }
        }
      }

      // Create root .abapgit.xml
      const abapGitXml = this.generateRootAbapGitXml(objects);
      const abapGitPath = join(targetPath, '.abapgit.xml');
      writeFileSync(abapGitPath, abapGitXml, 'utf8');
      filesCreated.push(abapGitPath);

      return {
        success: errors.length === 0,
        objectsProcessed,
        filesCreated,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      return {
        success: false,
        objectsProcessed,
        filesCreated,
        errors: [
          `Serialization failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ],
      };
    }
  }

  /**
   * Determine the root package from objects
   */
  private determineRootPackage(objects: AdkObject[]): string {
    // Get all packages
    const packages = objects
      .map(obj => hasSpec(obj) && obj.spec.core?.package)
      .filter(Boolean) as string[];
    
    if (packages.length === 0) return '$TMP';
    
    // Find the shortest package name (likely the root)
    return packages.reduce((shortest, current) => 
      current.length < shortest.length ? current : shortest
    );
  }

  /**
   * Group objects by folder using PREFIX logic
   * - If package = root → folder = object type (e.g., 'clas')
   * - If package = root_suffix → folder = suffix (e.g., 'suffix')
   */
  private groupByFolder(objects: AdkObject[], rootPackage: string): Map<string, AdkObject[]> {
    const groups = new Map<string, AdkObject[]>();

    for (const obj of objects) {
      const objPackage = (hasSpec(obj) && obj.spec.core?.package) || rootPackage;
      let folderName: string;

      if (objPackage === rootPackage) {
        // Same as root → use object type folder
        folderName = this.getAbapGitExtension(obj.kind);
      } else if (objPackage.startsWith(rootPackage + '_')) {
        // Child package → use suffix as folder name
        folderName = objPackage.substring(rootPackage.length + 1).toLowerCase();
      } else {
        // Different package → use object type as fallback
        folderName = this.getAbapGitExtension(obj.kind);
      }

      if (!groups.has(folderName)) {
        groups.set(folderName, []);
      }
      groups.get(folderName)!.push(obj);
    }

    return groups;
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
    const xmlFile = join(packageDir, `${objectName}.${fileExtension}.xml`);
    writeFileSync(xmlFile, xmlContent, 'utf8');
    files.push(xmlFile);

    return files;
  }

  private async serializeClass(
    obj: AdkObject & { spec: ClassSpec },
    packageDir: string,
    objectName: string,
    fileExtension: string
  ): Promise<string[]> {
    const files: string[] = [];
    const spec = obj.spec;

    // Main class file - get from source attribute or first include
    const mainInclude = spec.include?.find((inc) => inc.includeType === 'main');
    if (mainInclude) {
      const content = await resolveContent(mainInclude.content);
      if (content) {
        const mainFile = join(
          packageDir,
          `${objectName}.${fileExtension}.abap`
        );
        writeFileSync(mainFile, content, 'utf8');
        files.push(mainFile);
      }
    } else if (spec.source?.sourceUri) {
      // Fallback: if no main include but source exists
      const mainFile = join(packageDir, `${objectName}.${fileExtension}.abap`);
      writeFileSync(mainFile, '* Main class source\n', 'utf8');
      files.push(mainFile);
    }

    // Segment files (locals_def, locals_imp, macros, testclasses)
    if (spec.include) {
      for (const include of spec.include) {
        if (include.includeType === 'main') continue; // Already handled

        const content = await resolveContent(include.content);
        if (content) {
          // Map ADK includeType to abapGit file naming convention
          const abapGitSegmentName = this.mapIncludeTypeToAbapGit(include.includeType);
          const segmentFile = join(
            packageDir,
            `${objectName}.${fileExtension}.${abapGitSegmentName}.abap`
          );
          writeFileSync(segmentFile, content, 'utf8');
          files.push(segmentFile);
        }
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

    // For generic objects, try to get source from spec
    if (hasSpec(obj) && obj.spec.source?.sourceUri) {
      const sourceFile = join(
        packageDir,
        `${objectName}.${fileExtension}.abap`
      );
      // TODO: Fetch actual source content via sourceUri
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
      'definitions': 'locals_def',
      'implementations': 'locals_imp',
      'macros': 'macros',
      'testclasses': 'testclasses',
      'main': 'main',
    };
    return mapping[includeType] || includeType;
  }

  /**
   * Get abapGit object type code (4-char SAP type)
   */
  private getAbapGitObjectType(kind: string): string {
    const types: Record<string, string> = {
      'Class': 'CLAS',
      'Interface': 'INTF',
      'Program': 'PROG',
      'FunctionGroup': 'FUGR',
      'Table': 'TABL',
      'DataElement': 'DTEL',
      'Domain': 'DOMA',
      'Package': 'DEVC',
    };
    return types[kind] || kind.toUpperCase().substring(0, 4);
  }

  /**
   * Generate package.devc.xml for a package
   */
  private generatePackageXml(packageName: string, rootPackage: string, objects: AdkObject[]): string {
    // Try to find a Package object with this name to get its description (case-insensitive)
    const packageObj = objects.find(obj => 
      obj.kind === 'Package' && obj.name.toUpperCase() === packageName.toUpperCase()
    );
    
    // Use the package object's description if available, otherwise derive from name
    let description: string;
    if (packageObj && packageObj.description) {
      description = packageObj.description;
    } else if (packageName === rootPackage) {
      description = packageName; // Root package fallback
    } else if (packageName.startsWith(rootPackage + '_')) {
      // Child package - use suffix as description
      const suffix = packageName.substring(rootPackage.length + 1);
      description = suffix.charAt(0).toUpperCase() + suffix.slice(1).toLowerCase();
    } else {
      description = packageName; // Fallback to package name
    }

    return `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_DEVC" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <DEVC>
    <CTEXT>${this.escapeXml(description)}</CTEXT>
   </DEVC>
  </asx:values>
 </asx:abap>
</abapGit>`;
  }

  private generateObjectXml(obj: AdkObject): string {
    const name = obj.name;
    const description = obj.description || '';
    
    // Get abapGit object type (4-char code)
    const abapGitType = this.getAbapGitObjectType(obj.kind);

    // Check if object has test classes
    const hasTestClasses = isClass(obj) && 
      obj.spec?.include?.some(inc => inc.includeType === 'testclasses');

    // Build WITH_UNIT_TESTS line if needed
    const testClassesLine = hasTestClasses 
      ? '\n    <WITH_UNIT_TESTS>X</WITH_UNIT_TESTS>' 
      : '';

    // For now, generate basic XML structure
    // TODO: Use actual ADT XML from obj.toAdtXml() and convert to abapGit format
    return `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_${abapGitType}" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOCLASS>
    <CLSNAME>${name}</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>${this.escapeXml(description)}</DESCRIPT>
    <STATE>1</STATE>
    <CLSCCINCL>X</CLSCCINCL>
    <FIXPT>X</FIXPT>
    <UNICODE>X</UNICODE>${testClassesLine}
   </VSEOCLASS>
  </asx:values>
 </asx:abap>
</abapGit>`;
  }

  private generateRootAbapGitXml(objects: AdkObject[]): string {
    // Extract unique packages from objects (for future use)
    // const packages = [
    //   ...new Set(
    //     objects.map((o) => {
    //       if (hasSpec(o) && o.spec.core?.package) {
    //         return o.spec.core.package;
    //       }
    //       return '$TMP';
    //     })
    //   ),
    // ];

    return `<?xml version="1.0" encoding="utf-8"?>
<asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
 <asx:values>
  <DATA>
   <MASTER_LANGUAGE>E</MASTER_LANGUAGE>
   <STARTING_FOLDER>/src/</STARTING_FOLDER>
   <FOLDER_LOGIC>PREFIX</FOLDER_LOGIC>
   <IGNORE>
    <item>/.gitignore</item>
    <item>/LICENSE</item>
    <item>/README.md</item>
    <item>/package.json</item>
    <item>/.travis.yml</item>
    <item>/.gitlab-ci.yml</item>
    <item>/abaplint.json</item>
    <item>/azure-pipelines.yml</item>
   </IGNORE>
  </DATA>
 </asx:values>
</asx:abap>`;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
