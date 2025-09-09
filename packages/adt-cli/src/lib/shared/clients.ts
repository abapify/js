// Shared client instances for all commands
import {
  createAdtClient,
  type AdtClient,
  AuthManager,
} from '@abapify/adt-client';
import { createCliLogger } from '../utils/logger-config.js';

// Global CLI logger instance that will be set by commands
let globalCliLogger: any = null;
let adtClientInstance: AdtClient | null = null;

// Set the global CLI logger and recreate ADT client with it
export function setGlobalLogger(logger: any): void {
  globalCliLogger = logger;
  // Recreate ADT client with the new logger
  adtClientInstance = createAdtClient({
    logger: globalCliLogger,
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
    throw new Error(
      'Not authenticated. Run "adt auth login --file <service-key>" first.'
    );
  }
}
