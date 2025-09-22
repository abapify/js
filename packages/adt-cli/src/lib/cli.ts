#!/usr/bin/env -S npx tsx

import { Command } from 'commander';
import {
  importPackageCommand,
  importTransportCommand,
  exportPackageCommand,
  searchCommand,
  discoveryCommand,
  getCommand,
  outlineCommand,
  atcCommand,
  loginCommand,
  logoutCommand,
  transportListCommand,
  transportGetCommand,
  transportCreateCommand,
  createTestLogCommand,
  createTestAdtCommand,
  createResearchSessionsCommand,
} from './commands';
import { deployCommand } from './commands/deploy/index';
import { createUnlockCommand } from './commands/unlock/index';
import { createLockCommand } from './commands/lock';
import { createDeploySourceCommand } from './commands/deploy-source';
import { createCliLogger, AVAILABLE_COMPONENTS } from './utils/logger-config';
import { setGlobalLogger } from './shared/clients';

// Add global options help to all commands using afterAll hook
function addGlobalOptionsHelpToAll(rootProgram: Command): void {
  // Get global options from root program
  const globalOptions = rootProgram.options
    .filter(
      (option) =>
        !option.flags.includes('-h, --help') &&
        !option.flags.includes('-V, --version')
    )
    .map((option) => `  ${option.flags.padEnd(30)} ${option.description}`)
    .join('\n');

  if (globalOptions) {
    rootProgram.addHelpText('afterAll', (context) => {
      // Skip the main program to avoid duplicate global options
      if (context.command === rootProgram) {
        return '';
      }

      return `
Global Options:
${globalOptions}
`;
    });
  }
}

// Create main program
export async function createCLI(): Promise<Command> {
  const program = new Command();

  program
    .name('adt')
    .description('ADT CLI tool for managing SAP ADT services')
    .version('1.0.0')
    .option(
      '-v, --verbose [components]',
      `Enable verbose logging. Optionally filter by components: ${AVAILABLE_COMPONENTS.join(
        ', '
      )} or 'all'`
    )
    .hook('preAction', (thisCommand) => {
      const opts = thisCommand.optsWithGlobals();

      // Create logger based on global options
      const logger = createCliLogger({
        verbose: opts.verbose,
      });

      // Store logger for use in commands
      (thisCommand as any).logger = logger;
    });

  // Auth commands
  const authCmd = program
    .command('auth')
    .description('Authentication commands');

  authCmd.addCommand(loginCommand);
  authCmd.addCommand(logoutCommand);

  // Discovery command
  program.addCommand(discoveryCommand);

  // Object inspector command
  program.addCommand(getCommand);

  // Object outline command
  program.addCommand(outlineCommand);

  // ATC (ABAP Test Cockpit) command
  program.addCommand(atcCommand);

  // Search command
  program.addCommand(searchCommand);

  // Transport commands
  const transportCmd = program
    .command('transport')
    .alias('tr')
    .description('Transport request management');

  transportCmd.addCommand(transportListCommand);
  transportCmd.addCommand(transportGetCommand);
  transportCmd.addCommand(transportCreateCommand);

  // Import commands
  const importCmd = program
    .command('import')
    .description('Import ABAP objects to various formats (OAT, abapGit, etc.)');

  importCmd.addCommand(importPackageCommand);
  importCmd.addCommand(importTransportCommand);

  // Export commands
  const exportCmd = program
    .command('export')
    .description('Export ABAP objects from various formats to SAP systems');

  exportCmd.addCommand(exportPackageCommand);

  // Deploy command
  program.addCommand(deployCommand);

  // Deploy source command
  program.addCommand(createDeploySourceCommand());

  // Lock command
  program.addCommand(createLockCommand());

  // Unlock command
  program.addCommand(createUnlockCommand());

  // Research command
  program.addCommand(createResearchSessionsCommand());

  // Test commands for debugging
  program.addCommand(createTestLogCommand());
  program.addCommand(createTestAdtCommand());

  // Apply global options help to all commands using afterAll hook
  addGlobalOptionsHelpToAll(program);

  return program;
}

// Main execution function
export async function main(): Promise<void> {
  const program = await createCLI();

  // Add a hook to set up logger before command execution
  program.hook('preAction', (thisCommand, actionCommand) => {
    // Set CLI mode for ADT client logger to enable pretty formatting
    process.env.ADT_CLI_MODE = 'true';

    // Get global options from root program
    let rootCmd = actionCommand;
    while (rootCmd.parent) {
      rootCmd = rootCmd.parent;
    }
    const globalOptions = rootCmd.opts();

    // Create and set global logger for ADT client
    const logger = createCliLogger({ verbose: globalOptions.verbose });
    setGlobalLogger(logger);
  });

  await program.parseAsync(process.argv);
}
