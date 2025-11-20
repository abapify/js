/**
 * ADT Client V2 - Response Plugins
 *
 * Pluggable system for intercepting and transforming responses.
 * Plugins can store raw XML, transform data, or save to files.
 */

import type { ElementSchema } from './base';

/**
 * Response context passed to plugins
 */
export interface ResponseContext {
  /** Raw response text (XML) */
  rawText: string;
  /** Parsed response object (if schema available) */
  parsedData?: unknown;
  /** Response schema used for parsing */
  schema?: ElementSchema;
  /** Request URL */
  url: string;
  /** Request method */
  method: string;
  /** Response content type */
  contentType: string;
}

/**
 * Response plugin interface
 */
export interface ResponsePlugin {
  /**
   * Plugin name for identification
   */
  name: string;

  /**
   * Process response before returning to caller
   * Can store files, transform data, log, etc.
   *
   * @param context - Response context with raw and parsed data
   * @returns Modified data or original data
   */
  process(context: ResponseContext): Promise<unknown> | unknown;
}

/**
 * File storage plugin - saves raw XML and JSON to files
 */
export class FileStoragePlugin implements ResponsePlugin {
  name = 'file-storage';

  constructor(
    private options: {
      /** Base directory for storing files */
      outputDir: string;
      /** Save raw XML responses */
      saveXml?: boolean;
      /** Save parsed JSON responses */
      saveJson?: boolean;
      /** File naming function */
      getFileName?: (context: ResponseContext) => string;
    }
  ) {}

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

/**
 * Transform plugin - applies custom transformations
 */
export class TransformPlugin implements ResponsePlugin {
  name = 'transform';

  constructor(
    private transformer: (
      context: ResponseContext
    ) => unknown | Promise<unknown>
  ) {}

  async process(context: ResponseContext): Promise<unknown> {
    return await this.transformer(context);
  }
}

/**
 * Logging plugin - logs requests and responses
 */
export class LoggingPlugin implements ResponsePlugin {
  name = 'logging';

  constructor(
    private logger: (message: string, data?: any) => void = console.log
  ) {}

  process(context: ResponseContext): unknown {
    this.logger(`[${context.method}] ${context.url}`, {
      contentType: context.contentType,
      hasSchema: !!context.schema,
      rawSize: context.rawText.length,
    });
    return context.parsedData;
  }
}
