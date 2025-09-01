import { AdtAdapter } from '../../../base/adapters/adt/adapter';
import { ClassSpec } from '..';

import { $attr, $xmlns, $namespaces } from 'fxmlp';

const { clas, adtcore } = $namespaces([
  ['clas', { recursive: true }],
  'adtcore',
  'atom',
]);

export class ClassAdtAdapter extends AdtAdapter<ClassSpec> {
  override toAdt(): Record<string, unknown> {
    return {
      ...clas({
        class: {
          ...$attr({
            ...adtcore(this.adtcore),
            ...$xmlns({
              clas: 'http://www.sap.com/adt/oo/classes',
              atom: 'http://www.w3.org/2005/Atom',
              adtcore: 'http://www.sap.com/adt/core',
            }),
          }),
          content: {
            visibility: this.spec.visibility,
            final: this.spec.isFinal,
            abstract: this.spec.isAbstract,
            superclass: this.spec.superclass,
            interfaces: this.spec.interfaces,
            components: this.spec.components,
          },
        },
      }),
    };
  }
}
