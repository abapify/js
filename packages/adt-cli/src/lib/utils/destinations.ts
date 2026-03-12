/**
 * Destination utilities
 *
 * Loads destinations from adt.config.ts/json using @abapify/adt-config
 */

import {
  loadConfig,
  type LoadedConfig,
  type Destination,
} from '@abapify/adt-config';
import { getCliContext } from '../shared/adt-client';
import { discoverServiceKeyDestinations } from './auto-service-keys';

// Cached config instance (keyed by configPath to handle different configs)
let cachedConfig: LoadedConfig | null = null;
let cachedConfigPath: string | undefined = undefined;

/**
 * Get loaded config (cached)
 * Uses configPath from CLI context if available (from --config flag)
 */
export async function getConfig(): Promise<LoadedConfig> {
  const context = getCliContext();
  const configPath = context.configPath;

  // Invalidate cache if configPath changed
  if (cachedConfig && cachedConfigPath !== configPath) {
    cachedConfig = null;
  }

  if (!cachedConfig) {
    cachedConfig = await loadConfig({ configPath });
    cachedConfigPath = configPath;
  }
  return cachedConfig;
}

/**
 * Get a destination by name (SID)
 * @param name Destination name (e.g., 'BHF', 'S0D')
 */
export async function getDestination(
  name: string,
): Promise<Destination | undefined> {
  const config = await getConfig();
  const configured = config.getDestination(name);
  if (configured) {
    return configured;
  }

  const upperName = name.toUpperCase();
  return discoverServiceKeyDestinations().get(upperName);
}

/**
 * List all configured destinations
 */
export async function listDestinations(): Promise<string[]> {
  const config = await getConfig();
  const configured = config.listDestinations();
  const discovered = listAutoServiceKeyDestinationNames();
  const configuredUpper = new Set(configured.map((name) => name.toUpperCase()));

  for (const sid of discovered) {
    if (!configuredUpper.has(sid)) {
      configured.push(sid);
    }
  }

  return configured;
}

/**
 * Check if a destination exists
 */
export async function hasDestination(name: string): Promise<boolean> {
  const config = await getConfig();
  if (config.hasDestination(name)) {
    return true;
  }

  return discoverServiceKeyDestinations().has(name.toUpperCase());
}

/**
 * List SID names for auto-discovered service-key destinations.
 */
export function listAutoServiceKeyDestinationNames(): string[] {
  return [...discoverServiceKeyDestinations().keys()];
}

/**
 * Clear cached config (useful for testing)
 */
export function clearConfigCache(): void {
  cachedConfig = null;
  cachedConfigPath = undefined;
}

// Re-export types
export type { LoadedConfig, Destination };
