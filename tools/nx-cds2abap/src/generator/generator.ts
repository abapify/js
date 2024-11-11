import { Tree } from '@nx/devkit';

import { AbapgitGeneratorSchema } from './schema';
import { cds2abap } from '@abapify/cds2abap';

export async function abapgitGenerator(
  tree: Tree,
  options: AbapgitGeneratorSchema
) {
  await cds2abap({
    ...options,
    output: options.output || 'src',
  });
}
export default abapgitGenerator;
