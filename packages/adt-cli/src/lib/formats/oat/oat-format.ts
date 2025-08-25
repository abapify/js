import { BaseFormat, FormatResult, ObjectReference } from '../base-format';
import { ObjectData } from '../../objects/base/types';
import { SerializerRegistry } from '../../serializers/serializer-registry';
import { IconRegistry } from '../../utils/icon-registry';

export class OatFormat extends BaseFormat {
  name = 'oat';
  description = 'Open ABAP Tooling (OAT) format with SAP object type structure';

  // OAT supports all object types by default - no hardcoding needed!
  // Dynamic registration happens during initialization

  async serialize(
    objectData: ObjectData,
    objectType: string,
    outputPath: string
  ): Promise<FormatResult> {
    const fs = require('fs');
    const path = require('path');

    // OAT structure: objects/TYPE/NAME/
    const objectDir = path.join(
      outputPath,
      'objects',
      objectType,
      objectData.name
    );
    fs.mkdirSync(objectDir, { recursive: true });

    const objectName = objectData.name.toLowerCase();
    const typeExtension = objectType.toLowerCase();
    const filesCreated: string[] = [];

    // Write source file (if object has source)
    if (
      objectData.source &&
      objectData.source.trim() &&
      objectType !== 'DEVC'
    ) {
      const sourceFile = path.join(
        objectDir,
        `${objectName}.${typeExtension}.abap`
      );
      fs.writeFileSync(sourceFile, objectData.source);
      filesCreated.push(sourceFile);
    }

    // Write metadata file using YAML (OAT default)
    const metadata = {
      kind: objectType,
      spec: {
        name: objectData.name,
        description: objectData.description,
      },
    };

    const serializer = SerializerRegistry.get('oat'); // Uses YAML
    const serialized = serializer.serialize(metadata);
    const metadataFile = path.join(
      objectDir,
      `${objectName}.${typeExtension}${serialized.extension}`
    );
    fs.writeFileSync(metadataFile, serialized.content);
    filesCreated.push(metadataFile);

    // Only show detailed output in debug mode - format will be silent by default

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

    // OAT structure: objects/TYPE/NAME/
    const objectDir = path.join(projectPath, 'objects', objectType, objectName);
    const objectNameLower = objectName.toLowerCase();
    const typeExtension = objectType.toLowerCase();

    // Read source file
    let source = '';
    if (objectType !== 'DEVC') {
      const sourceFile = path.join(
        objectDir,
        `${objectNameLower}.${typeExtension}.abap`
      );
      if (fs.existsSync(sourceFile)) {
        source = fs.readFileSync(sourceFile, 'utf8');
      }
    }

    // Read metadata file
    const yamlFile = path.join(
      objectDir,
      `${objectNameLower}.${typeExtension}.yaml`
    );
    if (!fs.existsSync(yamlFile)) {
      throw new Error(`OAT metadata file not found: ${yamlFile}`);
    }

    const yamlContent = fs.readFileSync(yamlFile, 'utf8');
    const serializer = SerializerRegistry.get('oat');
    const metadata = serializer.deserialize(yamlContent);

    return {
      name: objectName,
      description: metadata.spec?.description || `${objectType} ${objectName}`,
      source,
      metadata: {
        type: objectType,
        kind: metadata.kind,
      },
    };
  }

  async findObjects(projectPath: string): Promise<ObjectReference[]> {
    const fs = require('fs');
    const path = require('path');

    const objects: ObjectReference[] = [];
    const objectsDir = path.join(projectPath, 'objects');

    if (!fs.existsSync(objectsDir)) {
      return objects;
    }

    // Scan objects/TYPE/ directories
    const objectTypes = fs
      .readdirSync(objectsDir, { withFileTypes: true })
      .filter((dirent: any) => dirent.isDirectory())
      .map((dirent: any) => dirent.name);

    for (const objectType of objectTypes) {
      const typeDir = path.join(objectsDir, objectType);
      const objectNames = fs
        .readdirSync(typeDir, { withFileTypes: true })
        .filter((dirent: any) => dirent.isDirectory())
        .map((dirent: any) => dirent.name);

      for (const objectName of objectNames) {
        objects.push({
          type: objectType,
          name: objectName,
          path: path.join(typeDir, objectName),
        });
      }
    }

    return objects;
  }

  override async afterImport(
    outputPath: string,
    result: FormatResult
  ): Promise<void> {
    // Create OAT project manifest
    const fs = require('fs');
    const path = require('path');

    const oatManifest = {
      format: 'oat',
      tooling: 'Open ABAP Tooling',
      version: '1.0.0',
      generator: 'adt-cli',
      objectsProcessed: result.objectsProcessed,
      structure: 'objects/TYPE/NAME/',
    };

    const manifestFile = path.join(outputPath, '.oat.json');
    fs.writeFileSync(manifestFile, JSON.stringify(oatManifest, null, 2));
    // Project manifest creation is silent - only show in debug mode if needed
  }
}
