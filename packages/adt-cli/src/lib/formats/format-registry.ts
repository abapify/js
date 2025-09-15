import { BaseFormat } from './base-format';
import { ObjectRegistry } from '../objects/registry';

export class FormatRegistry {
  private static formatInstances = new Map<string, BaseFormat>();

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

    // Optionally register OAT format
    try {
      // Use dynamic import pattern that bundlers won't resolve eagerly
      const oatModule = require('./oat/oat-format');
      if (oatModule?.OatFormat) {
        const oatFormat: BaseFormat = new oatModule.OatFormat();
        availableObjectTypes.forEach((objectType) =>
          oatFormat.registerObjectType(objectType)
        );
        this.formatInstances.set('oat', oatFormat);
      }
    } catch {}

    // Optionally register abapGit format
    try {
      const abapgitModule = require('./abapgit/abapgit-format');
      if (abapgitModule?.AbapGitFormat) {
        const abapgitFormat: BaseFormat = new abapgitModule.AbapGitFormat();
        availableObjectTypes.forEach((objectType) =>
          abapgitFormat.registerObjectType(objectType)
        );
        this.formatInstances.set('abapgit', abapgitFormat);
      }
    } catch {}

    // Future: gcts, steampunk, custom formats
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
