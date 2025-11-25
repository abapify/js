/**
 * @abapify/logger - Shared logger interface for abapify packages
 *
 * This package provides a standard Logger interface compatible with popular
 * logging libraries (pino, winston, bunyan) and simple implementations for
 * common use cases.
 */

export type { Logger } from './types';
export { NoOpLogger, ConsoleLogger } from './loggers';
