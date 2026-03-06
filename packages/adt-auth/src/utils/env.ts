import type { Destination } from '../auth-manager';
import { ServiceKeyParser } from '../types/service-key';

/**
 * Resolves a service key destination from environment variables.
 *
 * Reads `COPILOT_ADT_SERVICE_KEY` first, then `ADT_SERVICE_KEY`.
 * If found, parses the JSON service key and returns a ready `Destination`
 * config for the service-key plugin.
 *
 * @returns A `Destination` object for the service-key plugin, or `null` if
 *   neither env var is set.
 */
export function resolveServiceKeyFromEnv(): Destination | null {
  const raw =
    process.env['COPILOT_ADT_SERVICE_KEY'] ?? process.env['ADT_SERVICE_KEY'];

  if (!raw) {
    return null;
  }

  const serviceKey = ServiceKeyParser.parse(raw);

  return {
    type: '@abapify/adt-auth/plugins/service-key',
    options: {
      url: serviceKey.url,
      serviceKey,
    },
  };
}
