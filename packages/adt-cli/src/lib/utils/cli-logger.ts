import type { Logger } from '@abapify/logger';

/**
 * CLI Logger interface that extends the base logger with CLI-specific methods
 */
export interface CliLogger extends Logger {
  /**
   * Log a CLI operation start
   */
  operation(name: string, details?: Record<string, any>): void;

  /**
   * Log a CLI success message
   */
  success(message: string, details?: Record<string, any>): void;

  /**
   * Log a CLI failure message
   */
  failure(message: string, details?: Record<string, any>): void;

  /**
   * Log a CLI warning message
   */
  warning(message: string, details?: Record<string, any>): void;
}

/**
 * Extend a base logger with CLI-specific methods
 */
export function createCliLogger(baseLogger: Logger): CliLogger {
  return {
    ...baseLogger,

    operation: (name: string, details?: Record<string, any>) => {
      baseLogger.info(`🚀 ${name}`, details);
    },

    success: (message: string, details?: Record<string, any>) => {
      baseLogger.info(`✅ ${message}`, details);
    },

    failure: (message: string, details?: Record<string, any>) => {
      baseLogger.error(`❌ ${message}`, details);
    },

    warning: (message: string, details?: Record<string, any>) => {
      baseLogger.warn(`⚠️ ${message}`, details);
    },
  };
}
