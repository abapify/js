import { AdtAdapter } from '../../../base/adapters/adt/adapter';
import { InterfaceSpec } from '..';

import { $attr, $xmlns, $namespaces } from 'fxmlp';

const { intf, adtcore } = $namespaces([
  ['intf', { recursive: true }],
  'adtcore',
  'atom',
]);

export class InterfaceAdtAdapter extends AdtAdapter<InterfaceSpec> {
  override toAdt(): Record<string, unknown> {
    return {
      ...intf({
        interface: {
          ...$attr({
            ...adtcore(this.adtcore),
            ...$xmlns({
              intf: 'http://www.sap.com/adt/oo/interfaces',
              atom: 'http://www.w3.org/2005/Atom',
              adtcore: 'http://www.sap.com/adt/core',
            }),
          }),
          content: {
            category: this.spec.category,
            interfaces: this.spec.interfaces,
            components: this.spec.components,
          },
        },
      }),
    };
  }
}
