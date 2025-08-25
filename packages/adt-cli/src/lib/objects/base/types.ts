export interface ObjectData {
  name: string;
  description: string;
  source: string;
  metadata: Record<string, any>;
}

export interface OatFileResult {
  sourceFile: string;
  metadataFile: string;
}
