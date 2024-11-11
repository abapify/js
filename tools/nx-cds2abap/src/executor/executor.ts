import { PromiseExecutor } from '@nx/devkit';
import { Cds2abapExecutorSchema } from './schema';
import { cds2abap } from '@abapify/cds2abap';

const runExecutor: PromiseExecutor<Cds2abapExecutorSchema> = async (
  options
) => {

  await cds2abap({
    ...options,
    output: options.output || 'src',
  });

  return {
    success: true,
  };
};

export default runExecutor;
