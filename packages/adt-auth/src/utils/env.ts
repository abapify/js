import { readFileSync, existsSync } from 'fs';
import type { Destination } from '../auth-manager';
import { ServiceKeyParser, type BTPServiceKey } from '../types/service-key';

/**
 * Read a BTP service key from a string that is either:
 * - A JSON string (starts with `{`)
 * - A file path to a JSON file
 *
 * @param input - JSON string or path to a JSON file
 * @returns Parsed and validated `BTPServiceKey`
 */
export function readServiceKey(input: string): BTPServiceKey {
  const trimmed = input.trim();

  if (trimmed.startsWith('{')) {
    // Treat as a JSON string
    return ServiceKeyParser.parse(trimmed);
  }

  // Treat as a file path
  if (!existsSync(trimmed)) {
    throw new Error(`Service key file not found: ${trimmed}`);
  }

  const raw = readFileSync(trimmed, 'utf-8');
  return ServiceKeyParser.parse(raw);
}

/**
 * Resolves a service key destination from the `ADT_SERVICE_KEY` environment
 * variable.
 *
 * The value can be a JSON string or a path to a JSON file.
 *
 * @returns A `Destination` object for the service-key plugin, or `null` if
 *   `ADT_SERVICE_KEY` is not set.
 */
export function resolveServiceKeyFromEnv(): Destination | null {
  const raw = process.env['ADT_SERVICE_KEY'];

  if (!raw) {
    return null;
  }

  const serviceKey = readServiceKey(raw);

  return {
    type: '@abapify/adt-auth/plugins/service-key',
    options: {
      url: serviceKey.url,
      serviceKey,
    },
  };
}
