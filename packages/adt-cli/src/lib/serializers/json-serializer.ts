import { BaseSerializer, SerializationResult } from './base-serializer';

export class JsonSerializer extends BaseSerializer {
  serialize(data: any): SerializationResult {
    const jsonContent = JSON.stringify(data, null, 2);
    return {
      content: jsonContent,
      extension: '.json',
    };
  }

  deserialize(content: string): any {
    return JSON.parse(content);
  }

  getFileExtension(): string {
    return '.json';
  }
}
