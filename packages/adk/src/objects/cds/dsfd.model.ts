import type { AdkContext } from '../../base/context';
import { ScalarFunctionDefinition } from '../../base/kinds';
import { registerObjectType } from '../../base/registry';
import { AdkCdsSourceObject } from './source-object';

export class AdkScalarFunctionDefinition extends AdkCdsSourceObject {
  static readonly kind = ScalarFunctionDefinition;
  readonly kind = AdkScalarFunctionDefinition.kind;
  protected readonly endpoint = 'ddic/dsfd/sources';
  constructor(ctx: AdkContext, name: string) {
    super(ctx, name);
  }
  protected get contract(): any {
    return this.ctx.client.adt.ddic.dsfd.sources;
  }
}

registerObjectType(
  'DSFD',
  ScalarFunctionDefinition,
  AdkScalarFunctionDefinition as any,
  {
    endpoint: 'ddic/dsfd/sources',
  },
);
