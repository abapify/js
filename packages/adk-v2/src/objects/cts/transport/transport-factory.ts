/**
 * Transport Factory - creates the correct transport item type
 */

import type { AdkContext } from '../../../base/context';
import type { TransportData } from './transport.types';
import { AdkTransportRequest, AdkTransportTask } from './transport';

/**
 * Get any transport item (request or task) by number.
 * Returns AdkTransportRequest or AdkTransportTask based on object_type.
 */
export async function getTransportItem(ctx: AdkContext, number: string): Promise<AdkTransportRequest> {
  const response = await ctx.services.transports.get(number);
  return createTransportItem(ctx, response);
}

/**
 * Create transport item from response data.
 * Used internally and for testing.
 */
export function createTransportItem(ctx: AdkContext, response: TransportData): AdkTransportRequest {
  return response.object_type === 'T'
    ? new AdkTransportTask(ctx, response)
    : new AdkTransportRequest(ctx, response);
}
