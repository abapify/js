import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { cds2abapGenerator } from './generator';
import { Cds2abapGeneratorSchema } from './schema';

describe('cds2abap generator', () => {
  let tree: Tree;
  const options: Cds2abapGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await cds2abapGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
});
