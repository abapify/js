/**
 * Transform Plugin - Applies custom transformations to responses
 */

import type { ResponsePlugin, ResponseContext } from './types';

export type TransformFunction = (
  context: ResponseContext
) => unknown | Promise<unknown>;

/**
 * Transform plugin - applies custom transformations
 */
export class TransformPlugin implements ResponsePlugin {
  name = 'transform';

  constructor(private transformer: TransformFunction) {}

  async process(context: ResponseContext): Promise<unknown> {
    return await this.transformer(context);
  }
}
