import { BaseFormat, FormatResult, ObjectReference } from '../base-format';
import { ObjectData } from '../../objects/base/types';
import { IconRegistry } from '../../utils/icon-registry';

export class AbapGitFormat extends BaseFormat {
  name = 'abapgit';
  description = 'abapGit-compatible format with src/ structure';

  // abapGit can filter object types if needed
  protected shouldSupportObjectType(objectType: string): boolean {
    // abapGit might not support modern RAP objects - add filtering if needed
    const unsupportedTypes = ['SRVB', 'SIA6']; // Example: Service bindings, IAM apps
    return !unsupportedTypes.includes(objectType);
  }

  async serialize(
    objectData: ObjectData,
    objectType: string,
    outputPath: string
  ): Promise<FormatResult> {
    const fs = require('fs');
    const path = require('path');

    // abapGit structure: src/
    const srcDir = path.join(outputPath, 'src');
    fs.mkdirSync(srcDir, { recursive: true });

    const objectName = objectData.name.toLowerCase();
    const filesCreated: string[] = [];

    // abapGit naming convention
    let sourceFile = '';
    let metadataFile = '';

    switch (objectType) {
      case 'CLAS':
        sourceFile = path.join(srcDir, `${objectName}.clas.abap`);
        metadataFile = path.join(srcDir, `${objectName}.clas.xml`);
        break;
      case 'INTF':
        sourceFile = path.join(srcDir, `${objectName}.intf.abap`);
        metadataFile = path.join(srcDir, `${objectName}.intf.xml`);
        break;
      case 'DEVC':
        // abapGit handles packages differently
        metadataFile = path.join(srcDir, 'package.devc.xml');
        break;
      default:
        throw new Error(
          `abapGit plugin does not support object type: ${objectType}`
        );
    }

    // Write source file
    if (
      objectData.source &&
      objectData.source.trim() &&
      objectType !== 'DEVC' &&
      sourceFile
    ) {
      fs.writeFileSync(sourceFile, objectData.source);
      filesCreated.push(sourceFile);
    }

    // Write abapGit XML metadata (simplified)
    const abapGitMetadata = `<?xml version="1.0" encoding="utf-8"?>
<abapGit version="v1.0.0" serializer="LCL_OBJECT_${objectType}" serializer_version="v1.0.0">
 <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
  <asx:values>
   <OBJECT>
    <NAME>${objectData.name}</NAME>
    <DESCRIPTION>${objectData.description}</DESCRIPTION>
   </OBJECT>
  </asx:values>
 </asx:abap>
</abapGit>`;

    fs.writeFileSync(metadataFile, abapGitMetadata);
    filesCreated.push(metadataFile);

    const icon = IconRegistry.getIcon(objectType);
    console.log(
      `${icon} [abapGit] Created ${objectType}: ${path.relative(
        outputPath,
        sourceFile || metadataFile
      )}`
    );

    return {
      filesCreated,
      objectsProcessed: 1,
    };
  }

  async deserialize(
    objectType: string,
    objectName: string,
    projectPath: string
  ): Promise<ObjectData> {
    const fs = require('fs');
    const path = require('path');

    // abapGit structure: src/
    const srcDir = path.join(projectPath, 'src');
    const objectNameLower = objectName.toLowerCase();

    // Find files based on object type
    let sourceFile = '';
    let metadataFile = '';

    switch (objectType) {
      case 'CLAS':
        sourceFile = path.join(srcDir, `${objectNameLower}.clas.abap`);
        metadataFile = path.join(srcDir, `${objectNameLower}.clas.xml`);
        break;
      case 'INTF':
        sourceFile = path.join(srcDir, `${objectNameLower}.intf.abap`);
        metadataFile = path.join(srcDir, `${objectNameLower}.intf.xml`);
        break;
      case 'DEVC':
        metadataFile = path.join(srcDir, 'package.devc.xml');
        break;
      default:
        throw new Error(
          `abapGit plugin does not support object type: ${objectType}`
        );
    }

    // Read source file
    let source = '';
    if (sourceFile && fs.existsSync(sourceFile)) {
      source = fs.readFileSync(sourceFile, 'utf8');
    }

    // Read metadata file (simplified XML parsing for now)
    if (!fs.existsSync(metadataFile)) {
      throw new Error(`abapGit metadata file not found: ${metadataFile}`);
    }

    const xmlContent = fs.readFileSync(metadataFile, 'utf8');
    // TODO: Proper XML parsing - for now extract description from XML
    const descMatch = xmlContent.match(/<DESCRIPTION>(.*?)<\/DESCRIPTION>/);
    const description = descMatch
      ? descMatch[1]
      : `${objectType} ${objectName}`;

    return {
      name: objectName,
      description,
      source,
      metadata: {
        type: objectType,
        format: 'abapgit',
      },
    };
  }

  async findObjects(projectPath: string): Promise<ObjectReference[]> {
    const fs = require('fs');
    const path = require('path');

    const objects: ObjectReference[] = [];
    const srcDir = path.join(projectPath, 'src');

    if (!fs.existsSync(srcDir)) {
      return objects;
    }

    // Scan src/ directory for abapGit files
    const files = fs.readdirSync(srcDir);

    for (const file of files) {
      // Parse abapGit file patterns: objectname.type.extension
      const match = file.match(/^(.+)\.(clas|intf|prog|devc)\.(abap|xml)$/);
      if (match) {
        const [, objectName, objectType, extension] = match;

        // Only count .abap files as primary objects (avoid duplicates with .xml)
        if (
          extension === 'abap' ||
          (extension === 'xml' && objectType === 'devc')
        ) {
          objects.push({
            type: objectType.toUpperCase(),
            name: objectName.toUpperCase(),
            path: path.join(srcDir, file),
          });
        }
      }
    }

    return objects;
  }

  override async afterImport(
    outputPath: string,
    result: FormatResult
  ): Promise<void> {
    // Create .abapgit.xml project file
    const fs = require('fs');
    const path = require('path');

    const abapGitProject = `<?xml version="1.0" encoding="utf-8"?>
<asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
 <asx:values>
  <DATA>
   <STARTING_FOLDER>/src/</STARTING_FOLDER>
   <FOLDER_LOGIC>PREFIX</FOLDER_LOGIC>
  </DATA>
 </asx:values>
</asx:abap>`;

    const projectFile = path.join(outputPath, '.abapgit.xml');
    fs.writeFileSync(projectFile, abapGitProject);
    console.log(`🔧 [abapGit] Created project file: ${projectFile}`);
  }
}
