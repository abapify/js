/**
 * Destination utilities
 * 
 * Loads destinations from adt.config.ts/json using @abapify/adt-config
 */

import { loadConfig, type LoadedConfig, type Destination } from '@abapify/adt-config';

// Cached config instance
let cachedConfig: LoadedConfig | null = null;

/**
 * Get loaded config (cached)
 */
export async function getConfig(): Promise<LoadedConfig> {
  if (!cachedConfig) {
    cachedConfig = await loadConfig();
  }
  return cachedConfig;
}

/**
 * Get a destination by name (SID)
 * @param name Destination name (e.g., 'BHF', 'S0D')
 */
export async function getDestination(name: string): Promise<Destination | undefined> {
  const config = await getConfig();
  return config.getDestination(name);
}

/**
 * List all configured destinations
 */
export async function listDestinations(): Promise<string[]> {
  const config = await getConfig();
  return config.listDestinations();
}

/**
 * Check if a destination exists
 */
export async function hasDestination(name: string): Promise<boolean> {
  const config = await getConfig();
  return config.hasDestination(name);
}

/**
 * Clear cached config (useful for testing)
 */
export function clearConfigCache(): void {
  cachedConfig = null;
}

// Re-export types
export type { LoadedConfig, Destination };
