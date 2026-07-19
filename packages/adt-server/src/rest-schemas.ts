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

export const transportSearchQuery = z
  .object({
    includeTasks: z.enum(['true', 'false']).optional(),
    owner: z.string().trim().min(1).max(128).optional(),
    type: z.string().trim().min(1).max(16).optional(),
    status: z.string().trim().min(1).max(64).optional(),
    target: z.string().trim().min(1).max(128).optional(),
    dateFrom: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/u)
      .optional(),
    dateTo: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/u)
      .optional(),
    text: z.string().trim().min(1).max(256).optional(),
  })
  .strict();

export const transportSummary = z
  .object({
    trkorr: z.string().trim().min(1).max(64),
    owner: z.string().max(128),
    description: z.string().max(1_024),
    status: z.string().max(64),
    statusRaw: z.string().max(16).optional(),
    trFunction: z.string().max(16).optional(),
    target: z.string().max(128).optional(),
    client: z.string().max(16).optional(),
    changedAt: z.string().datetime().optional(),
  })
  .strict();

export const transportListResponse = z.array(transportSummary);

export function parseTransportSearchQuery(input: unknown) {
  const query = transportSearchQuery.parse(input);
  return {
    ...query,
    ...(query.includeTasks === undefined
      ? {}
      : { includeTasks: query.includeTasks === 'true' }),
  };
}

export type TransportSourceManifestInput = z.infer<
  typeof transportSourceManifestBody
>;

export type TransportSearchCriteria = ReturnType<
  typeof parseTransportSearchQuery
>;
