import { ExecutorContext } from '@nx/devkit';

import { Cds2abapExecutorSchema } from './schema';
import executor from './executor';

const options: Cds2abapExecutorSchema = {
  model: "@samples/projects"
};
const context: ExecutorContext = {
  root: '',
  cwd: process.cwd(),
  isVerbose: false,
  projectGraph: {
    nodes: {},
    dependencies: {},
  },
  projectsConfigurations: {
    projects: {},
    version: 2,
  },
  nxJsonConfiguration: {},
};

describe('Cds2abap Executor', () => {
  it('can run', async () => {
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
