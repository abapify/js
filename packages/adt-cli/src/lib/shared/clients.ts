// Shared client instances for all commands
import {
  createAdtClient,
  type AdtClient,
  AuthManager,
  createFileLogger,
  createLogger,
} from '@abapify/adt-client';

export interface LoggingConfig {
  logLevel: string;
  logOutput: string;
  logResponseFiles: boolean;
}

// Global CLI logger instance that will be set by commands
let globalCliLogger: any = null;
let globalLoggingConfig: LoggingConfig | null = null;
let adtClientInstance: AdtClient | null = null;

// Set the global CLI logger and recreate ADT client with it
export function setGlobalLogger(
  logger: any,
  loggingConfig?: LoggingConfig
): void {
  globalCliLogger = logger;
  globalLoggingConfig = loggingConfig || null;

  // Create FileLogger if response logging is enabled
  let fileLogger;
  if (loggingConfig?.logResponseFiles) {
    const baseLogger = createLogger('adt-responses');
    fileLogger = createFileLogger(baseLogger, {
      outputDir: loggingConfig.logOutput,
      enabled: true,
      writeMetadata: false,
    });
  }

  // Recreate ADT client with the new logger and file logger
  adtClientInstance = createAdtClient({
    logger: globalCliLogger,
    fileLogger: fileLogger,
  });
}

// Get the ADT client instance (creates default if no logger set)
export function getAdtClient(): AdtClient {
  if (!adtClientInstance) {
    adtClientInstance = createAdtClient();
  }
  return adtClientInstance;
}

// Export as property for backward compatibility
export const adtClient = new Proxy({} as AdtClient, {
  get(target, prop) {
    return (getAdtClient() as any)[prop];
  },
});

// Get the auth manager instance (lazy access)
export function getAuthManager(): AuthManager {
  return (getAdtClient() as any).authManager;
}

// Helper function to ensure client is connected
export async function ensureConnected(): Promise<void> {
  if (!adtClient.isConnected()) {
    throw new Error('Not authenticated. Run "adt auth login" first.');
  }
}
