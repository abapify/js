import { readFileSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';

export interface AbapGitObject {
  type: string;
  name: string;
  xmlData: string;
  sourceCode?: string;
  metadata: any;
}

export interface AbapGitProject {
  config: any;
  objects: AbapGitObject[];
  path: string;
}

export class AbapGitPlugin {
  name = 'abapGit';
  description = 'abapGit project reader and parser';

  async readProject(projectPath: string): Promise<AbapGitProject> {
    // Read .abapgit.xml configuration
    const configPath = join(projectPath, '.abapgit.xml');
    const configXml = readFileSync(configPath, 'utf-8');
    const config = await this.parseAbapGitConfig(configXml);

    // Determine source folder
    const sourceFolder = join(projectPath, config.startingFolder || 'src');

    // Read all objects from source folder
    const objects = await this.readObjects(sourceFolder);

    return {
      config,
      objects,
      path: projectPath,
    };
  }

  private async parseAbapGitConfig(xmlContent: string): Promise<any> {
    const { XMLParser } = await import('fast-xml-parser');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
    });

    const parsed = parser.parse(xmlContent);
    const data = parsed['asx:abap']['asx:values'].DATA;

    return {
      masterLanguage: data.MASTER_LANGUAGE,
      startingFolder: data.STARTING_FOLDER,
      folderLogic: data.FOLDER_LOGIC,
      ignore: Array.isArray(data.IGNORE?.item)
        ? data.IGNORE.item
        : [data.IGNORE?.item].filter(Boolean),
    };
  }

  private async readObjects(sourceFolder: string): Promise<AbapGitObject[]> {
    const objects: AbapGitObject[] = [];
    const files = this.getAllFiles(sourceFolder);

    // Group files by object (based on filename pattern)
    const objectGroups = this.groupFilesByObject(files);

    for (const [objectKey, objectFiles] of objectGroups.entries()) {
      const object = await this.parseObject(objectKey, objectFiles);
      if (object) {
        objects.push(object);
      }
    }

    return objects;
  }

  private getAllFiles(dir: string): string[] {
    const files: string[] = [];

    try {
      const entries = readdirSync(dir);

      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          files.push(...this.getAllFiles(fullPath));
        } else if (stat.isFile()) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }

    return files;
  }

  private groupFilesByObject(files: string[]): Map<string, string[]> {
    const groups = new Map<string, string[]>();

    for (const file of files) {
      const fileName = basename(file);

      // Match abapGit naming patterns: objectname.objecttype.extension
      const match = fileName.match(/^(.+)\.(\w+)\.(xml|abap|json)$/);
      if (match) {
        const [, objectName, objectType] = match;
        const key = `${objectName}.${objectType}`;

        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(file);
      }
    }

    return groups;
  }

  private async parseObject(
    objectKey: string,
    files: string[]
  ): Promise<AbapGitObject | null> {
    const [objectName, objectType] = objectKey.split('.');

    // Find XML metadata file
    const xmlFile = files.find((f) => f.endsWith('.xml'));
    if (!xmlFile) {
      return null;
    }

    const xmlData = readFileSync(xmlFile, 'utf-8');

    // Find source code file
    const sourceFile = files.find((f) => f.endsWith('.abap'));
    const sourceCode = sourceFile
      ? readFileSync(sourceFile, 'utf-8')
      : undefined;

    // Parse metadata from XML
    const metadata = await this.parseObjectMetadata(xmlData, objectType);

    return {
      type: objectType.toUpperCase(),
      name: objectName.toUpperCase(),
      xmlData,
      sourceCode,
      metadata,
    };
  }

  private async parseObjectMetadata(
    xmlData: string,
    objectType: string
  ): Promise<any> {
    try {
      const { XMLParser } = await import('fast-xml-parser');
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        textNodeName: '#text',
      });

      const parsed = parser.parse(xmlData);
      const values = parsed.abapGit['asx:abap']['asx:values'];

      // Extract metadata based on object type
      switch (objectType.toLowerCase()) {
        case 'intf':
          return values.VSEOINTERF || {};
        case 'clas':
          return values.VSEOCLASS || {};
        case 'doma':
          return values.DD01V || {};
        default:
          return values;
      }
    } catch (error) {
      return {};
    }
  }
}

export function abapgit(): string {
  return 'abapgit';
}
