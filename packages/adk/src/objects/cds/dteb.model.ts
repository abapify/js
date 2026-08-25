import type { AdkContext } from '../../base/context';
import { EntityBuffer } from '../../base/kinds';
import { registerObjectType } from '../../base/registry';
import { AdkCdsSourceObject } from './source-object';

export class AdkEntityBuffer extends AdkCdsSourceObject {
  static readonly kind = EntityBuffer;
  readonly kind = AdkEntityBuffer.kind;
  protected readonly endpoint = 'ddic/dteb/sources';
  constructor(ctx: AdkContext, name: string) {
    super(ctx, name);
  }
  protected get contract(): any {
    return this.ctx.client.adt.ddic.dteb.sources;
  }
}

registerObjectType('DTEB', EntityBuffer, AdkEntityBuffer as any, {
  endpoint: 'ddic/dteb/sources',
});
