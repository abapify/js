import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { AdkObject } from '@abapify/adk';
import type { ClassSpec, ClassInclude } from '@abapify/adk';

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

      // Group objects by package
      const objectsByPackage = this.groupByPackage(objects);

      // Process each package
      for (const [packageName, packageObjects] of objectsByPackage.entries()) {
        const packageDir = join(srcDir, packageName.toLowerCase());
        mkdirSync(packageDir, { recursive: true });

        // Process each object in the package
        for (const obj of packageObjects) {
          try {
            const files = await this.serializeObject(obj, packageDir);
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

  private groupByPackage(objects: AdkObject[]): Map<string, AdkObject[]> {
    const groups = new Map<string, AdkObject[]>();

    for (const obj of objects) {
      // Get package from spec.core if available
      let packageName = '$TMP';
      if (hasSpec(obj) && obj.spec.core?.package) {
        packageName = obj.spec.core.package;
      }

      if (!groups.has(packageName)) {
        groups.set(packageName, []);
      }
      groups.get(packageName)!.push(obj);
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
          const segmentFile = join(
            packageDir,
            `${objectName}.${fileExtension}.${include.includeType}.abap`
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

  private generateObjectXml(obj: AdkObject): string {
    const objectType = obj.kind.toUpperCase();
    const name = obj.name;
    const description = obj.description || '';

    // For now, generate basic XML structure
    // TODO: Use actual ADT XML from obj.toAdtXml() and convert to abapGit format
    return `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_${objectType}" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <VSEOCLASS>
    <CLSNAME>${name}</CLSNAME>
    <LANGU>E</LANGU>
    <DESCRIPT>${this.escapeXml(description)}</DESCRIPT>
    <STATE>1</STATE>
    <CLSCCINCL>X</CLSCCINCL>
    <FIXPT>X</FIXPT>
    <UNICODE>X</UNICODE>
   </VSEOCLASS>
  </asx:values>
 </asx:abap>
</abapGit>`;
  }

  private generateRootAbapGitXml(objects: AdkObject[]): string {
    // Extract unique packages from objects
    const packages = [
      ...new Set(
        objects.map((o) => {
          if (hasSpec(o) && o.spec.core?.package) {
            return o.spec.core.package;
          }
          return '$TMP';
        })
      ),
    ];

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
