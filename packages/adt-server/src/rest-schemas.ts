import { z } from 'zod';

export const MAX_SOURCE_BYTES = 2 * 1024 * 1024;

export const transportSourceManifestBody = z
  .object({
    transports: z.array(z.string().trim().min(1)).min(1),
  })
  .strict();

export const sourceVersionReadBody = z
  .object({
    sourceCapability: z
      .string()
      .min(1)
      .max(8 * 1024),
    maxBytes: z.number().int().positive().max(MAX_SOURCE_BYTES),
  })
  .strict();

export type TransportSourceManifestInput = z.infer<
  typeof transportSourceManifestBody
>;
