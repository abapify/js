/**
 * Response Plugins - Pluggable system for intercepting and transforming responses
 *
 * Plugins can store raw XML, transform data, save to files, or perform any
 * custom processing on responses before they're returned to the caller.
 */

// Export types
export type { ResponsePlugin, ResponseContext } from './types';
export type { FileStorageOptions } from './file-storage';
export type { TransformFunction } from './transform';
export type { LogFunction } from './logging';
export type { FileLoggingConfig } from './file-logging';

// Export plugin implementations
export { FileStoragePlugin } from './file-storage';
export { TransformPlugin } from './transform';
export { LoggingPlugin } from './logging';
export { FileLoggingPlugin } from './file-logging';
