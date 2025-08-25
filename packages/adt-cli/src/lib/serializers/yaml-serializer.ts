import { BaseSerializer, SerializationResult } from './base-serializer';

export class YamlSerializer extends BaseSerializer {
  serialize(data: any): SerializationResult {
    const yamlContent = this.toYaml(data);
    return {
      content: yamlContent,
      extension: '.yaml',
    };
  }

  deserialize(content: string): any {
    // TODO: Implement YAML parsing when needed for adt export
    throw new Error('YAML deserialization not yet implemented');
  }

  getFileExtension(): string {
    return '.yaml';
  }

  private toYaml(obj: any, indent: string = ''): string {
    const yaml = [];

    for (const [key, value] of Object.entries(obj)) {
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        yaml.push(`${indent}${key}:`);
        const nestedYaml = this.toYaml(value, indent + '  ');
        yaml.push(nestedYaml.trimEnd());
      } else {
        yaml.push(`${indent}${key}: ${this.formatYamlValue(value)}`);
      }
    }

    return yaml.join('\n') + (indent === '' ? '\n' : '');
  }

  private formatYamlValue(value: any): string {
    if (typeof value === 'string') {
      if (value.includes(':') || value.includes('#') || value.includes(' ')) {
        return `"${value}"`;
      }
      return value;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      return (
        '\n' +
        value.map((item) => `  - ${this.formatYamlValue(item)}`).join('\n')
      );
    }
    return String(value);
  }
}
