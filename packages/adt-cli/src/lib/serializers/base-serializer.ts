export interface SerializationResult {
  content: string;
  extension: string;
}

export abstract class BaseSerializer {
  abstract serialize(data: any): SerializationResult;
  abstract deserialize(content: string): any;
  abstract getFileExtension(): string;
}
