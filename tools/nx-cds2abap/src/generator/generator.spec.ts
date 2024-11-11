import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { abapgitGenerator } from './generator';
import { AbapgitGeneratorSchema } from './schema';

describe('abapgit generator', () => {
  let tree: Tree;
  const options: AbapgitGeneratorSchema = { model: 'test' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await abapgitGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
});
