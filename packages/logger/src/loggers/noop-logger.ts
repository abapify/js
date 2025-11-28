import type { Logger } from '../types';

/**
 * No-op logger that discards all log messages
 * Useful for testing or when logging is not needed
 */
export class NoOpLogger implements Logger {
  trace(): void {}
  debug(): void {}
  info(): void {}
  warn(): void {}
  error(): void {}
  fatal(): void {}
  child(): Logger {
    return this;
  }
}
