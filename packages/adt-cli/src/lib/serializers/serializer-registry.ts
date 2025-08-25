import { BaseSerializer } from './base-serializer';
import { YamlSerializer } from './yaml-serializer';
import { JsonSerializer } from './json-serializer';

export class SerializerRegistry {
  private static serializers = new Map<string, () => BaseSerializer>();

  static {
    // Register format serializers
    this.serializers.set('oat', () => new YamlSerializer());
    this.serializers.set('yaml', () => new YamlSerializer());
    this.serializers.set('json', () => new JsonSerializer());
  }

  static get(format: string): BaseSerializer {
    const serializerFactory = this.serializers.get(format);
    if (!serializerFactory) {
      throw new Error(`No serializer registered for format: ${format}`);
    }
    return serializerFactory();
  }

  static getSupportedFormats(): string[] {
    return Array.from(this.serializers.keys());
  }

  static isSupported(format: string): boolean {
    return this.serializers.has(format);
  }

  static register(
    format: string,
    serializerFactory: () => BaseSerializer
  ): void {
    this.serializers.set(format, serializerFactory);
  }
}
