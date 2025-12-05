/**
 * File Storage Plugin - Saves raw XML and JSON responses to files
 */

import type { ResponsePlugin, ResponseContext } from './types';

export interface FileStorageOptions {
  /** Base directory for storing files */
  outputDir: string;
  /** Save raw XML responses */
  saveXml?: boolean;
  /** Save parsed JSON responses */
  saveJson?: boolean;
  /** File naming function */
  getFileName?: (context: ResponseContext) => string;
}

/**
 * File storage plugin - saves raw XML and JSON to files
 */
export class FileStoragePlugin implements ResponsePlugin {
  name = 'file-storage';

  constructor(private options: FileStorageOptions) {}

  async process(context: ResponseContext): Promise<unknown> {
    const { outputDir, saveXml, saveJson, getFileName } = this.options;

    // Generate filename
    const baseFileName = getFileName
      ? getFileName(context)
      : this.defaultFileName(context);

    // Save raw XML
    if (saveXml && context.rawText) {
      const xmlPath = `${outputDir}/${baseFileName}.xml`;
      await this.writeFile(xmlPath, context.rawText);
    }

    // Save parsed JSON
    if (saveJson && context.parsedData) {
      const jsonPath = `${outputDir}/${baseFileName}.json`;
      await this.writeFile(
        jsonPath,
        JSON.stringify(context.parsedData, null, 2)
      );
    }

    // Return original parsed data
    return context.parsedData;
  }

  private defaultFileName(context: ResponseContext): string {
    // Extract endpoint from URL
    const url = new URL(context.url);
    const endpoint = url.pathname
      .replace(/^\/sap\/bc\/adt\//, '')
      .replace(/\//g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '_');

    const timestamp = Date.now();
    return `${endpoint}-${timestamp}`;
  }

  private async writeFile(path: string, content: string): Promise<void> {
    const fs = await import('fs/promises');
    const pathModule = await import('path');

    // Ensure directory exists
    const dir = pathModule.dirname(path);
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(path, content, 'utf-8');
  }
}
