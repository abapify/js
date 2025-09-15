import {
  FormatPlugin,
  AdkObject,
  SerializeResult,
  SerializeOptions,
  DeserializeOptions,
  ValidationResult,
} from '@abapify/adt-cli';
import { OatSerializer } from './serializer';
import { OatDeserializer } from './deserializer';

/**
 * OAT format plugin implementation
 */
export class OatPlugin implements FormatPlugin {
  readonly name = '@abapify/oat';
  readonly version = '1.0.0';
  readonly description =
    'OAT (Object Archive Text) format plugin for ABAP objects';

  private serializer = new OatSerializer();
  private deserializer = new OatDeserializer();

  /**
   * Serialize ADK objects to OAT format files
   */
  async serialize(
    objects: AdkObject[],
    targetPath: string,
    options?: SerializeOptions
  ): Promise<SerializeResult> {
    return this.serializer.serialize(objects, targetPath, options);
  }

  /**
   * Deserialize OAT format files to ADK objects
   */
  async deserialize(
    sourcePath: string,
    options?: DeserializeOptions
  ): Promise<AdkObject[]> {
    return this.deserializer.deserialize(sourcePath, options);
  }

  /**
   * Validate plugin configuration
   */
  validateConfig(config: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (config.options) {
      const { fileStructure, includeMetadata, compressionLevel } =
        config.options;

      if (
        fileStructure &&
        !['flat', 'grouped', 'hierarchical'].includes(fileStructure)
      ) {
        errors.push(
          'fileStructure must be one of: flat, grouped, hierarchical'
        );
      }

      if (
        includeMetadata !== undefined &&
        typeof includeMetadata !== 'boolean'
      ) {
        errors.push('includeMetadata must be a boolean');
      }

      if (
        compressionLevel !== undefined &&
        (typeof compressionLevel !== 'number' ||
          compressionLevel < 0 ||
          compressionLevel > 9)
      ) {
        errors.push('compressionLevel must be a number between 0 and 9');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get supported object types
   */
  getSupportedObjectTypes(): string[] {
    return ['Class', 'Interface', 'Domain', 'Package'];
  }
}

// Export plugin instance as default
export default new OatPlugin();
