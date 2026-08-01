import { z } from 'zod';

const positiveBoundedInt = z.number().int().min(1).max(32);

export const flowConfigSchema = z
  .object({
    format: z.object({
      id: z.string().trim().min(1),
      options: z
        .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
        .optional(),
    }),
    include: z
      .object({
        objectTypes: z.array(z.string().trim().min(1)).optional(),
        packages: z.array(z.string().trim().min(1)).optional(),
        applicationComponents: z.array(z.string().trim().min(1)).optional(),
      })
      .optional(),
    concurrency: z
      .object({
        metadata: positiveBoundedInt.optional(),
        sources: positiveBoundedInt.optional(),
      })
      .optional(),
    maxSourceBytes: z
      .number()
      .int()
      .min(1)
      .max(64 * 1024 * 1024)
      .optional(),
  })
  .strict();

export const ownedFileSchema = z.object({
  path: z.string().min(1),
  hash: z.string().regex(/^[a-f0-9]{64}$/),
  role: z.enum(['source', 'metadata']),
  sourceComponent: z.string().min(1).optional(),
});

export const sourceSelectionSchema = z.object({
  component: z.string().min(1),
  versionId: z.string().min(1),
  sourceUri: z.string().min(1),
});

export const objectDescriptorSchema = z.object({
  schemaVersion: z.literal(1),
  formatVersion: z.literal(1),
  identity: z.object({
    canonical: z.string().min(1),
    pgmid: z.string().min(1),
    type: z.string().min(1),
    name: z.string().min(1),
  }),
  state: z.enum(['present', 'deleted']),
  packagePath: z.array(z.string()),
  selections: z.array(sourceSelectionSchema),
  ownedFiles: z.array(ownedFileSchema),
  configDigest: z.string().regex(/^[a-f0-9]{64}$/),
  formatDigest: z.string().regex(/^[a-f0-9]{64}$/),
});

export const transportDescriptorSchema = z.object({
  schemaVersion: z.literal(1),
  requestedTransports: z.array(z.string().min(1)),
  scopeTransports: z.array(z.string().min(1)),
  objects: z.array(z.string().min(1)),
  configDigest: z.string().regex(/^[a-f0-9]{64}$/),
  formatDigest: z.string().regex(/^[a-f0-9]{64}$/),
});

export type ObjectDescriptor = z.infer<typeof objectDescriptorSchema>;
export type TransportDescriptor = z.infer<typeof transportDescriptorSchema>;
export type OwnedFile = z.infer<typeof ownedFileSchema>;
