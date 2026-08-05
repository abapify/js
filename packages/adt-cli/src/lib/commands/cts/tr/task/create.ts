import { Command } from 'commander';
import { getAdtClientV2, getCliContext } from '../../../../utils/adt-client-v2';
import { createProgressReporter } from '../../../../utils/progress-reporter';
import { createCliLogger } from '../../../../utils/logger-config';
import { CtsTransportLifecycleService } from '../../../../services/cts';
import type { Logger } from '@abapify/logger';

const writeLine = (line: string) => {
  process.stdout.write(`${line}\n`);
};

const writeError = (line: string) => {
  process.stderr.write(`${line}\n`);
};

interface CommandWithLogger extends Command {
  logger?: Logger;
}

export const ctsTaskCreateCommand = new Command('create')
  .description('Create a modifiable task under an existing transport request')
  .argument('<transport>', 'Parent transport request number')
  .argument('<owner>', 'SAP user who should own the new task')
  .option('--json', 'Output result as JSON')
  .action(async function (
    this: CommandWithLogger,
    transport: string,
    owner: string,
    options: { json: boolean },
  ) {
    const globalOpts = this.optsWithGlobals?.() ?? {};
    const ctx = getCliContext();
    const verboseFlag = globalOpts.verbose ?? ctx.verbose ?? false;
    const compact = !verboseFlag;
    const logger =
      this.logger ?? ctx.logger ?? createCliLogger({ verbose: verboseFlag });
    const progress = createProgressReporter({ compact, logger });

    try {
      const client = await getAdtClientV2({
        logger,
        enableLogging: true,
      });
      const result = await new CtsTransportLifecycleService(client).createTask({
        transport,
        owner,
      });

      if (options.json) {
        writeLine(JSON.stringify(result, null, 2));
      } else {
        writeLine(`✅ Task ${result.task} created under ${result.transport}`);
        writeLine(`   Owner: ${result.owner}`);
      }
    } catch (error) {
      writeError(
        `❌ Task creation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      progress.done();
      process.exit(1);
    }
  });
