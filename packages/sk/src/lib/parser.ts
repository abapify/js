import { z } from 'zod';
import { BTPServiceKey, BTPServiceKeySchema } from './types';

// Re-export types for convenience
export type { BTPServiceKey, UAACredentials, Catalog, Binding } from './types';

export class ServiceKeyParser {
  static parse(serviceKeyJson: string | object): BTPServiceKey {
    let parsed: unknown;

    if (typeof serviceKeyJson === 'string') {
      try {
        parsed = JSON.parse(serviceKeyJson);
      } catch (error) {
        throw new Error('Invalid JSON format in service key');
      }
    } else {
      parsed = serviceKeyJson;
    }

    return BTPServiceKeySchema.parse(parsed);
  }

  static safeParse(
    serviceKeyJson: string | object
  ):
    | { success: true; data: BTPServiceKey }
    | { success: false; error: z.ZodError } {
    let parsed: unknown;

    if (typeof serviceKeyJson === 'string') {
      try {
        parsed = JSON.parse(serviceKeyJson);
      } catch (error) {
        return {
          success: false,
          error: new z.ZodError([
            {
              code: 'custom',
              path: [],
              message: 'Invalid JSON format in service key',
            },
          ]),
        };
      }
    } else {
      parsed = serviceKeyJson;
    }

    return BTPServiceKeySchema.safeParse(parsed);
  }
}
