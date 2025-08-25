import { BaseFormat } from './base-format';
import { OatFormat } from './oat/oat-format';
import { AbapGitFormat } from './abapgit/abapgit-format';
import { ObjectRegistry } from '../objects/registry';

export class FormatRegistry {
  private static formatInstances = new Map<string, BaseFormat>();
  private static initialized = false;

  static {
    this.initializeFormats();
  }

  static get(format: string): BaseFormat {
    const formatInstance = this.formatInstances.get(format);
    if (!formatInstance) {
      throw new Error(
        `No format registered: ${format}. Available: ${this.getSupportedFormats().join(
          ', '
        )}`
      );
    }
    return formatInstance;
  }

  private static initializeFormats(): void {
    // Create format instances and auto-register available object types
    const availableObjectTypes = ObjectRegistry.getSupportedTypes();

    // Create OAT format instance
    const oatFormat = new OatFormat();
    availableObjectTypes.forEach((objectType) =>
      oatFormat.registerObjectType(objectType)
    );
    this.formatInstances.set('oat', oatFormat);

    // Create abapGit format instance
    const abapgitFormat = new AbapGitFormat();
    availableObjectTypes.forEach((objectType) =>
      abapgitFormat.registerObjectType(objectType)
    );
    this.formatInstances.set('abapgit', abapgitFormat);

    // Future: gcts, steampunk, custom formats

    this.initialized = true;
  }

  static getSupportedFormats(): string[] {
    return Array.from(this.formatInstances.keys());
  }

  static isSupported(format: string): boolean {
    return this.formatInstances.has(format);
  }

  static register(format: string, formatInstance: BaseFormat): void {
    // Auto-register available object types with new format
    const availableObjectTypes = ObjectRegistry.getSupportedTypes();
    availableObjectTypes.forEach((objectType) =>
      formatInstance.registerObjectType(objectType)
    );
    this.formatInstances.set(format, formatInstance);
  }

  static listFormats(): Array<{ name: string; description: string }> {
    return Array.from(this.formatInstances.entries()).map(
      ([name, formatInstance]) => {
        return { name, description: formatInstance.description };
      }
    );
  }
}
