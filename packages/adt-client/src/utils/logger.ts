import pino from 'pino';

/**
 * Logger configuration for ADT Client
 * Supports component-based logging with configurable levels
 */

// Determine if we should use pretty formatting (CLI context or development)
const shouldUsePrettyFormat =
  process.env.NODE_ENV === 'development' || process.env.ADT_CLI_MODE === 'true';

// Base logger configuration - always use pino
const baseLogger = pino({
  level: process.env.ADT_LOG_LEVEL || 'info',
  transport: shouldUsePrettyFormat
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname,time',
          messageFormat: '[{component}] {msg}',
          hideObject: true,
          singleLine: true,
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});

/**
 * Create a component-specific logger
 * @param component - Component name (e.g., 'atc', 'cts', 'http', 'auth')
 * @returns Pino logger instance with component context
 */
export function createLogger(component: string) {
  return baseLogger.child({ component });
}

/**
 * Pre-configured loggers for common components
 */
export const loggers = {
  client: createLogger('client'),
  connection: createLogger('connection'),
  auth: createLogger('auth'),
  session: createLogger('session'),
  atc: createLogger('atc'),
  cts: createLogger('cts'),
  repository: createLogger('repository'),
  discovery: createLogger('discovery'),
  http: createLogger('http'),
  xml: createLogger('xml'),
  error: createLogger('error'),
};

/**
 * Logger type definition for better TypeScript support
 */
export interface Logger {
  trace(msg: string, obj?: any): void;
  debug(msg: string, obj?: any): void;
  info(msg: string, obj?: any): void;
  warn(msg: string, obj?: any): void;
  error(msg: string, obj?: any): void;
  fatal(msg: string, obj?: any): void;
  child(bindings: Record<string, any>): Logger;
}

/**
 * Log levels configuration
 * Environment variables:
 * - ADT_LOG_LEVEL: trace|debug|info|warn|error (default: info)
 * - ADT_LOG_COMPONENTS: comma-separated list of components to enable (optional)
 * - NODE_ENV: development enables pretty printing
 */

/**
 * Helper function to check if component logging is enabled
 * @param component - Component name to check
 * @returns true if component should log
 */
export function isComponentEnabled(component: string): boolean {
  const enabledComponents = process.env.ADT_LOG_COMPONENTS;
  if (!enabledComponents) return true; // All components enabled by default

  return enabledComponents
    .split(',')
    .map((c) => c.trim())
    .includes(component);
}

/**
 * Conditional logger that respects component filtering
 * @param component - Component name
 * @returns Logger or no-op logger if component is disabled
 */
export function getLogger(component: string) {
  if (!isComponentEnabled(component)) {
    // Return no-op logger
    return {
      trace: () => {},
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      fatal: () => {},
      child: () => getLogger(component),
    };
  }

  return createLogger(component);
}

export default baseLogger;
