/**
 * Logger interface compatible with pino, winston, bunyan, and custom loggers
 *
 * This is the standard logger interface used across all @abapify packages.
 */
export interface Logger {
  /**
   * Log a trace message (lowest level)
   */
  trace(msg: string, obj?: any): void;

  /**
   * Log a debug message
   */
  debug(msg: string, obj?: any): void;

  /**
   * Log an info message
   */
  info(msg: string, obj?: any): void;

  /**
   * Log a warning message
   */
  warn(msg: string, obj?: any): void;

  /**
   * Log an error message
   */
  error(msg: string, obj?: any): void;

  /**
   * Log a fatal message (highest level)
   */
  fatal(msg: string, obj?: any): void;

  /**
   * Create a child logger with additional context
   */
  child(bindings: Record<string, any>): Logger;
}
