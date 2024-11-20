import { AdtAdapter } from '../../../base/adapters/adt/adapter';
import { DomainSpec } from '..';

import { $attr, $xmlns, $namespaces } from 'fxmlp';

const { doma, adtcore } = $namespaces([
  ['doma', { recursive: true }],
  'adtcore',
  'atom',
]);

export class DomainAdtAdapter extends AdtAdapter<DomainSpec> {
  override toAdt(): Record<string, unknown> {
    return {
      ...doma({
        domain: {
          ...$attr({
            ...adtcore(this.adtcore),
            ...$xmlns({
              doma: 'http://www.sap.com/dictionary/domain',
              atom: 'http://www.w3.org/2005/Atom',
              adtcore: 'http://www.sap.com/adt/core',
            }),
          }),
          content: this.spec,
        },
      }),
    };
  }
}
