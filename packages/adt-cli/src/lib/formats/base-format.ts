import { ObjectData } from '../objects/base/types';
import type { AdkObject } from '@abapify/adk';

export interface FormatResult {
  filesCreated: string[];
  objectsProcessed: number;
}

export interface ObjectReference {
  type: string;
  name: string;
  path: string;
}

export abstract class BaseFormat {
  abstract name: string;
  abstract description: string;

  // Dynamic object type registration (base class logic)
  private supportedTypes = new Set<string>();

  registerObjectType(objectType: string): void {
    if (this.shouldSupportObjectType(objectType)) {
      this.supportedTypes.add(objectType);
    }
  }

  getSupportedObjectTypes(): string[] {
    return Array.from(this.supportedTypes);
  }

  // Child classes can override for specific filtering
  protected shouldSupportObjectType(objectType: string): boolean {
    return true; // Base: accept all registered types
  }

  // Import: ADT ObjectData → Files (legacy method for backward compatibility)
  abstract serialize(
    objectData: ObjectData,
    objectType: string,
    outputPath: string
  ): Promise<FormatResult>;

  // Import: ADK Objects → Files (new method for ADK-based formats)
  // Formats can override this to work with ADK objects directly
  async serializeAdkObjects?(
    objects: AdkObject[],
    outputPath: string
  ): Promise<FormatResult>;

  // Export: Files → ADT ObjectData (key: objectType + objectName)
  abstract deserialize(
    objectType: string,
    objectName: string,
    projectPath: string
  ): Promise<ObjectData>;

  // Discovery: What objects exist in this project?
  abstract findObjects(projectPath: string): Promise<ObjectReference[]>;

  // Optional hooks for format-specific logic
  async beforeImport?(outputPath: string): Promise<void>;
  async afterImport?(outputPath: string, result: FormatResult): Promise<void>;

  async validateStructure?(outputPath: string): Promise<boolean>;
}
