import { Command } from 'commander';
import { createCliLogger } from '../utils/logger-config.js';

export function createTestLogCommand(): Command {
  const command = new Command('test-log');

  command
    .description('Test logging functionality with different components')
    .action(async (options, cmd) => {
      // Get global options from the root program
      let rootCmd = cmd.parent || cmd;
      while (rootCmd.parent) {
        rootCmd = rootCmd.parent;
      }
      const globalOptions = rootCmd.opts();
      const logger = createCliLogger({ verbose: globalOptions.verbose });

      // Test basic logging
      logger.info('Testing basic info log');
      logger.debug('Testing basic debug log');

      // Test component-specific logging
      const authLogger = logger.child({ component: 'auth' });
      authLogger.info('Authentication component log');
      authLogger.debug('Authentication debug log');

      const connectionLogger = logger.child({ component: 'connection' });
      connectionLogger.info('Connection component log');
      connectionLogger.debug('Connection debug log');

      const cliLogger = logger.child({ component: 'cli' });
      cliLogger.info('CLI component log');
      cliLogger.warn('CLI warning log');
      cliLogger.error('CLI error log');

      // Test nested child loggers
      const nestedLogger = authLogger.child({ subcomponent: 'oauth' });
      nestedLogger.info('Nested logger test');

      console.log('✅ Test logging completed!');
    });

  return command;
}
