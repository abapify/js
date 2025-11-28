import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import type { Logger } from './logger';

/**
 * Options for file logging
 */
export interface FileLogOptions {
  filename?: string; // Relative path from outputDir
  metadata?: Record<string, any>; // Optional metadata
}

/**
 * File logger configuration
 */
export interface FileLoggerConfig {
  outputDir?: string; // Base output directory
  enabled?: boolean; // Enable file logging
  writeMetadata?: boolean; // Write companion .meta.json files
}

/**
 * Enhanced logger with file output support
 * Works in both CLI and MCP contexts
 */
export class FileLogger {
  private outputDir?: string;
  private enabled: boolean;
  private writeMetadata: boolean;
  private baseLogger: Logger;

  constructor(baseLogger: Logger, config: FileLoggerConfig = {}) {
    this.baseLogger = baseLogger;
    this.outputDir = config.outputDir;
    this.enabled = config.enabled ?? false;
    this.writeMetadata = config.writeMetadata ?? false;
  }

  /**
   * Set output directory for file logging
   */
  setOutputDir(dir: string): void {
    this.outputDir = resolve(dir);
    this.baseLogger.debug(
      `File logger output directory set to: ${this.outputDir}`
    );
  }

  /**
   * Enable or disable file logging
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.baseLogger.debug(`File logging ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Log content with optional file output
   */
  log(content: string, options?: FileLogOptions): void {
    // Always log to console via base logger
    if (options?.filename) {
      this.baseLogger.debug(`Logging content to file: ${options.filename}`);
    } else {
      this.baseLogger.info(content);
    }

    // Write to file if enabled and filename provided
    if (this.enabled && options?.filename && this.outputDir) {
      this.writeToFile(options.filename, content, options.metadata);
    }
  }

  /**
   * Debug level logging with file support
   */
  debug(message: string, options?: FileLogOptions): void {
    this.baseLogger.debug(message);

    if (this.enabled && options?.filename && this.outputDir) {
      this.writeToFile(options.filename, message, options.metadata);
    }
  }

  /**
   * Info level logging with file support
   */
  info(message: string, options?: FileLogOptions): void {
    this.baseLogger.info(message);

    if (this.enabled && options?.filename && this.outputDir) {
      this.writeToFile(options.filename, message, options.metadata);
    }
  }

  /**
   * Warn level logging with file support
   */
  warn(message: string, options?: FileLogOptions): void {
    this.baseLogger.warn(message);

    if (this.enabled && options?.filename && this.outputDir) {
      this.writeToFile(options.filename, message, options.metadata);
    }
  }

  /**
   * Error level logging with file support
   */
  error(message: string, options?: FileLogOptions): void {
    this.baseLogger.error(message);

    if (this.enabled && options?.filename && this.outputDir) {
      this.writeToFile(options.filename, message, options.metadata);
    }
  }

  /**
   * Get the base logger for direct access
   */
  getBaseLogger(): Logger {
    return this.baseLogger;
  }

  /**
   * Write content to file with directory creation
   */
  private writeToFile(
    filename: string,
    content: string,
    metadata?: Record<string, any>
  ): void {
    if (!this.outputDir) {
      this.baseLogger.warn('File logging enabled but no output directory set');
      return;
    }

    try {
      // Sanitize and resolve path
      const safePath = this.sanitizePath(filename);
      const fullPath = join(this.outputDir, safePath);

      // Ensure path is within outputDir (security check)
      const resolvedPath = resolve(fullPath);
      const resolvedOutputDir = resolve(this.outputDir);
      if (!resolvedPath.startsWith(resolvedOutputDir)) {
        this.baseLogger.error(
          `Invalid file path (outside output dir): ${filename}`
        );
        return;
      }

      // Create directory structure
      const dir = dirname(fullPath);
      mkdirSync(dir, { recursive: true });

      // Write content
      writeFileSync(fullPath, content, 'utf8');
      this.baseLogger.trace(`Wrote file: ${fullPath}`);

      // Write metadata if enabled
      if (this.writeMetadata && metadata) {
        // Replace response.xml with metadata.json when pattern matches,
        // otherwise append .metadata.json to avoid overwriting the XML payload
        let metaPath: string;
        if (/-response\.xml$/.test(fullPath)) {
          metaPath = fullPath.replace(/-response\.xml$/, '-metadata.json');
        } else if (/\.xml$/.test(fullPath)) {
          metaPath = fullPath.replace(/\.xml$/, '.metadata.json');
        } else {
          metaPath = `${fullPath}.metadata.json`;
        }
        writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf8');
        this.baseLogger.trace(`Wrote metadata: ${metaPath}`);
      }
    } catch (error) {
      this.baseLogger.error(
        `Failed to write file ${filename}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Generate file path for logging ADT responses
   * Converts ADT endpoint to fixture-style path structure
   */
  generateLogFilePath(
    endpoint: string,
    headers?: Record<string, string>
  ): string {
    // Remove /sap/bc/adt prefix
    let path = endpoint.replace(/^\/sap\/bc\/adt\/?/, '');

    // Handle discovery endpoint
    if (path === '' || path === 'discovery') {
      return './adt/core/discovery.xml';
    }

    // Parse query parameters
    const [basePath, queryString] = path.split('?');
    const segments = basePath.split('/').filter((s) => s);

    // Check if this is a source endpoint (ends with source type)
    const sourceTypes = [
      'main',
      'definitions',
      'implementations',
      'macros',
      'testclasses',
    ];
    const lastSegment = segments[segments.length - 1];

    if (sourceTypes.includes(lastSegment)) {
      // Source file - no extension
      return `./adt/${segments.join('/')}`;
    }

    // Generate unique request ID from etag or timestamp
    let requestId: string;
    if (headers?.etag) {
      // Use etag as request ID (remove quotes and sanitize)
      requestId = headers.etag.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
    } else {
      // Use high-precision timestamp as request ID
      requestId =
        Date.now().toString() + Math.random().toString(36).slice(2, 7);
    }

    // Build directory path from segments and query
    let dirPath = `./adt/${segments.join('/')}`;
    if (queryString) {
      // Sanitize query string for directory name
      const sanitizedQuery = queryString.replace(/[^a-zA-Z0-9_-]/g, '_');
      dirPath += `/${sanitizedQuery}`;
    }

    // Use request ID in filename
    return `${dirPath}/${requestId}-response.xml`;
  }

  /**
   * Sanitize file path to prevent directory traversal
   */
  private sanitizePath(filename: string): string {
    // Remove leading slashes and resolve relative paths
    let safe = filename.replace(/^\/+/, '');

    // Remove any ../ attempts
    safe = safe.replace(/\.\.\//g, '');
    safe = safe.replace(/\.\./g, '');

    return safe;
  }
}

/**
 * Create a file logger instance
 */
export function createFileLogger(
  baseLogger: Logger,
  config?: FileLoggerConfig
): FileLogger {
  return new FileLogger(baseLogger, config);
}
