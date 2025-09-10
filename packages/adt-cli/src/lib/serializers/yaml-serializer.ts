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
    return this.parseYaml(content);
  }

  private parseYaml(content: string): any {
    const lines = content
      .split('\n')
      .filter((line) => line.trim() && !line.trim().startsWith('#'));
    const result: any = {};
    const stack: Array<{ obj: any; indent: number }> = [
      { obj: result, indent: -1 },
    ];

    for (const line of lines) {
      const indent = line.length - line.trimStart().length;
      const trimmed = line.trim();

      if (!trimmed) continue;

      // Pop stack until we find the right parent level
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      const current = stack[stack.length - 1].obj;

      if (trimmed.includes(':')) {
        const colonIndex = trimmed.indexOf(':');
        const key = trimmed.substring(0, colonIndex).trim();
        const value = trimmed.substring(colonIndex + 1).trim();

        if (value === '' || value === '{}' || value === '[]') {
          // Object or array - prepare for nested content
          current[key] = value === '[]' ? [] : {};
          stack.push({ obj: current[key], indent });
        } else {
          // Simple value
          current[key] = this.parseYamlValue(value);
        }
      } else if (trimmed.startsWith('- ')) {
        // Array item
        const value = trimmed.substring(2).trim();
        if (Array.isArray(current)) {
          current.push(this.parseYamlValue(value));
        }
      }
    }

    return result;
  }

  private parseYamlValue(value: string): any {
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1);
    }
    if (value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1);
    }
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;
    if (!isNaN(Number(value))) return Number(value);
    return value;
  }

  getFileExtension(): string {
    return '.yaml';
  }

  private toYaml(obj: any, indent = ''): string {
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
