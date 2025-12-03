/**
 * System Information JSON Schema
 * 
 * Used by: GET /sap/bc/adt/core/http/systeminformation
 * Content-Type: application/json
 * 
 * Returns system information including SAP release, client, user details.
 */

import { z } from 'zod';

/**
 * System Information response schema
 */
export const systeminformationSchema = z.object({
  systemID: z.string(),
  client: z.string(),
  userName: z.string(),
  userFullName: z.string(),
  language: z.string(),
  release: z.string(),
  sapRelease: z.string(),
});

export type SystemInformation = z.infer<typeof systeminformationSchema>;

export default systeminformationSchema;
